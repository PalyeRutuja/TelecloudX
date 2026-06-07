/**
 * lib/firebase-admin.ts
 * ---------------------
 * Firebase Admin SDK initialization for server-side API routes.
 * This is separate from lib/firebase.ts which uses the client SDK.
 *
 * Collections used:
 *   - users          : uid, email, telegramId, walletBalance, createdAt
 *   - telegram_tokens: token, uid, used, createdAt
 *   - vms            : vmId, uid, name, status, specs, createdAt
 *   - transactions   : txId, uid, amount, type, razorpayOrderId, status, createdAt
 */

import admin from "firebase-admin";

function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return {
      db: admin.firestore(),
      auth: admin.auth(),
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  if (
    !projectId ||
    !clientEmail ||
    !privateKey ||
    privateKey.includes("YOUR_KEY_HERE")
  ) {
    console.warn(
      "[Firebase Admin] Not initialized — missing or placeholder credentials."
    );
    return {
      db: null as any,
      auth: null as any,
    };
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return {
    db: admin.firestore(),
    auth: admin.auth(),
  };
}

export const { db, auth } = getFirebaseAdmin();

export const collections = {
  get users() {
    if (!db) throw new Error("Firebase Admin not initialized.");
    return db.collection("users");
  },
  get telegramTokens() {
    if (!db) throw new Error("Firebase Admin not initialized.");
    return db.collection("telegram_tokens");
  },
  get vms() {
    if (!db) throw new Error("Firebase Admin not initialized.");
    return db.collection("vms");
  },
  get transactions() {
    if (!db) throw new Error("Firebase Admin not initialized.");
    return db.collection("transactions");
  },
};
