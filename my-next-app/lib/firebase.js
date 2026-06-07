/**
 * lib/firebase.js
 * ----------------
 * Initializes Firebase Admin SDK for server-side usage.
 * Provides Firestore (db) and Auth (auth) instances.
 *
 * Collections used:
 *   - users          : uid, email, telegramId, walletBalance, createdAt
 *   - telegram_tokens: token, uid, used, createdAt
 *   - vms            : vmId, uid, name, status, specs, createdAt
 *   - transactions   : txId, uid, amount, type, razorpayOrderId, status, createdAt
 */

import admin from "firebase-admin";

// Prevent re-initialization during hot reload in dev
function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return {
      db: admin.firestore(),
      auth: admin.auth(),
    };
  }

  // Build service-account credentials from environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  // Skip Firebase init during Next.js static generation if key is placeholder
  if (
    !projectId ||
    !clientEmail ||
    !privateKey ||
    privateKey.includes("YOUR_KEY_HERE")
  ) {
    console.warn(
      "[Firebase] Admin SDK not initialized — missing or placeholder credentials."
    );
    return {
      db: /** @type {any} */ (null),
      auth: /** @type {any} */ (null),
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

/**
 * Firestore collection references for convenience.
 * These are lazy-evaluated so the build doesn't crash when
 * Firebase Admin is not initialized (e.g., placeholder credentials).
 */
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
