import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { initFirebase, getFirestore } from "../firebase.js";
import authRouter from "../routes/auth.js";
import ordersRouter from "../routes/orders.js";
import adminRouter from "../routes/admin.js";

dotenv.config();
initFirebase();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN === '*' ? true : process.env.FRONTEND_ORIGIN,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "E-commerce backend is running",
    api: {
      signup: "/auth/signup",
      login: "/auth/login",
      adminLogin: "/auth/admin/login",
      orders: "/orders",
      homepage: "/admin/homepage"
    }
  });
});

app.get("/test-firebase", async (req, res) => {
  try {
    const db = getFirestore();
    const testDoc = await db.collection("test").doc("ping").get();
    if (testDoc.exists) {
      res.json({ success: true, data: testDoc.data() });
    } else {
      res.json({ success: true, message: "No test doc, Firebase is connected!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use("/auth", authRouter);
app.use("/orders", ordersRouter);
app.use("/admin", adminRouter);

app.use((req,res) => res.status(404).json({ error: "Route not found" }));

// Serverless wrapper
import serverless from "serverless-http";
export default serverless(app);