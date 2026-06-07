import admin from "firebase-admin";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

let serviceAccount: any;
if (raw) {
  try {
    serviceAccount = JSON.parse(raw);
  } catch (err) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT must be a valid JSON string of the service account");
  }
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp();
  }
}

export const adminFirestore = admin.firestore();

export default admin;
