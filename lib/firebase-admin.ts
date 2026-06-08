import admin from "firebase-admin";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT env var is not set (JSON string)");
}

let serviceAccount: any;
try {
  serviceAccount = JSON.parse(raw);
} catch (err) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT must be a valid JSON string of the service account");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminFirestore = admin.firestore();

export default admin;
