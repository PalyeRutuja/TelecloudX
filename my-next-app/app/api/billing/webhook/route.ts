/**
 * POST /api/billing/webhook
 * -------------------------
 * Razorpay webhook endpoint.
 * Receives payment success events, verifies the signature,
 * and updates the user's wallet balance in Firestore.
 *
 * NOTE: This endpoint MUST return a 200 response quickly.
 * Do not perform long-running work here.
 */

import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/firebase-admin";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-razorpay-signature") || "";
    const body = await request.text();

    // Verify webhook signature to ensure request came from Razorpay
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error("[POST /api/billing/webhook] Invalid signature.");
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    // We only care about payment.captured for wallet top-ups
    if (eventType !== "payment.captured") {
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment) {
      return NextResponse.json({ error: "Missing payment entity." }, { status: 400 });
    }

    const orderId = payment.order_id;
    const amountPaid = payment.amount; // amount in paise

    // Find the pending transaction by razorpayOrderId
    const txQuery = await collections.transactions
      .where("razorpayOrderId", "==", orderId)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (txQuery.empty) {
      console.warn(`[Webhook] No pending transaction found for order ${orderId}`);
      return NextResponse.json({ received: true, unknown: true }, { status: 200 });
    }

    const txDoc = txQuery.docs[0];
    const txData = txDoc.data();
    const uid = txData.uid;

    // Update transaction status to completed
    await txDoc.ref.update({
      status: "completed",
      razorpayPaymentId: payment.id,
      capturedAt: new Date().toISOString(),
    });

    // Increment user's wallet balance (amount is in paise, convert to rupees)
    const incrementAmount = amountPaid / 100;
    const userRef = collections.users.doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error(`[Webhook] User ${uid} not found.`);
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const currentBalance = userDoc.data()?.walletBalance || 0;
    await userRef.update({
      walletBalance: currentBalance + incrementAmount,
    });

    console.log(`[Webhook] Credited ${incrementAmount} to user ${uid}. Order: ${orderId}`);

    return NextResponse.json({ received: true, credited: incrementAmount }, { status: 200 });
  } catch (error: any) {
    console.error("[POST /api/billing/webhook] Error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed." },
      { status: 500 }
    );
  }
}
