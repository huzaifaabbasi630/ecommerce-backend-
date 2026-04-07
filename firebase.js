// firebase.js
const admin = require('firebase-admin');

let app;

function initFirebase() {
  if (app) return app;

  try {
    // ✅ Get service account from ENV
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // ✅ Fix private key (VERY IMPORTANT for Vercel)
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase initialized successfully');
    return app;

  } catch (error) {
    console.error('❌ Firebase init error:', error.message);
    throw new Error('Firebase initialization failed');
  }
}

// ✅ Firestore
function getFirestore() {
  if (!app) initFirebase();
  return admin.firestore();
}

// ✅ Auth
function getAuth() {
  if (!app) initFirebase();
  return admin.auth();
}

// ✅ Ensure Admin User
async function ensureAdminUser() {
  const auth = getAuth();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD missing');
  }

  try {
    const user = await auth.getUserByEmail(adminEmail);

    if (!user.customClaims || user.customClaims.admin !== true) {
      await auth.setCustomUserClaims(user.uid, { admin: true });
    }

    return user;

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'Admin'
      });

      await auth.setCustomUserClaims(newUser.uid, { admin: true });
      return newUser;
    }

    throw error;
  }
}

module.exports = {
  initFirebase,
  getFirestore,
  getAuth,
  ensureAdminUser
};