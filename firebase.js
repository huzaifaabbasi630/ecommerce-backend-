// firebase.js
const dotenv = require('dotenv');
const admin = require('firebase-admin');

dotenv.config();

let db;

function initFirebase() {
  if (admin.apps.length) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  let credential;

  if (serviceAccountJson) {
    try {
      const parsedAccount = typeof serviceAccountJson === 'string' && serviceAccountJson.startsWith('{')
        ? JSON.parse(serviceAccountJson)
        : serviceAccountJson;

      // Crucial for Vercel: Replace \n in private_key with actual newlines
      if (parsedAccount.private_key) {
        parsedAccount.private_key = parsedAccount.private_key.replace(/\\n/g, '\n');
      }

      credential = admin.credential.cert(parsedAccount);
    } catch (e) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', e.message);
      credential = admin.credential.applicationDefault();
    }
  } else {
    credential = admin.credential.applicationDefault();
  }

  admin.initializeApp({
    credential,
    projectId
  });

  db = admin.firestore();
  console.log('✅ Firebase initialized successfully');
}

function getFirestore() {
  if (!db) initFirebase();
  return db;
}

function getAuth() {
  initFirebase();
  return admin.auth();
}

async function ensureAdminUser() {
  const auth = getAuth();
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
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
        displayName: 'Site Administrator'
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