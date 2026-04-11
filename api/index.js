const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { initFirebase, getFirestore } = require('../firebase');

dotenv.config();
initFirebase();

const authRouter = require('../routes/auth');
const ordersRouter = require('../routes/orders');
const adminRouter = require('../routes/admin');

const app = express();
const FRONTEND_ORIGIN_ENV = process.env.FRONTEND_ORIGIN || '*';
const FRONTEND_ORIGIN = FRONTEND_ORIGIN_ENV === '*' ? '*' : FRONTEND_ORIGIN_ENV.split(',');

app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'E-commerce backend is running',
    api: {
      signup: '/auth/signup',
      login: '/auth/login',
      adminLogin: '/auth/admin/login',
      orders: '/orders',
      homepage: '/admin/homepage'
    }
  });
});

// Firebase test route
app.get('/test-firebase', async (req, res) => {
  try {
    const db = getFirestore();
    const testDoc = await db.collection('test').doc('ping').get();
    if (testDoc.exists) {
      res.json({ success: true, data: testDoc.data() });
    } else {
      res.json({ success: true, message: 'No test doc, Firebase is connected!' });
    }
  } catch (err) {
    console.error('[Firebase Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/auth', authRouter);
app.use('/orders', ordersRouter);
app.use('/admin', adminRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Backend error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ EXPORT FOR VERCEL
module.exports = app;