/**
 * lib/razorpay.js
 * ---------------
 * Initializes Razorpay client for payment processing.
 * Exposes razorpay instance and a helper to verify webhooks.
 */

import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error(
    "Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local"
  );
}

/**
 * Razorpay client instance.
 * Used to create orders, fetch payments, etc.
 */
export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

/**
 * Verifies Razorpay webhook signature.
 * @param {string} body       - Raw request body (string)
 * @param {string} signature  - Value of X-Razorpay-Signature header
 * @returns {boolean}         - True if signature is valid
 */
export function verifyWebhookSignature(body, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing RAZORPAY_WEBHOOK_SECRET in .env.local");
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}
