import admin from "firebase-admin";

export const initFirebase = () => {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
};

export const getFirestore = () => admin.firestore();
