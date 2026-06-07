/**
 * POST /api/billing/topup
 * -----------------------
 * Initiates a Razorpay UPI payment for wallet top-up.
 * Creates a Razorpay order, stores a pending transaction in Firestore,
 * and returns the order details to the caller.
 *
 * // FRONTEND ENDPOINT — EMPTY
 * This endpoint is reserved for frontend integration. It currently returns
 * a placeholder response and will be implemented once the dashboard UI is built.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // FRONTEND ENDPOINT — EMPTY
  return NextResponse.json(
    { status: "not implemented" },
    { status: 501 }
  );
}
