/**
 * POST /api/telegram/link
 * -----------------------
 * Links a Telegram chat ID to a user's Firebase account using a one-time token.
 * Called by the Telegram bot when the user sends /start <token>.
 * Body: { token: string, telegramId: number }
 * Response: { message }
 */

import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, telegramId } = body;

    if (!token || typeof telegramId !== "number") {
      return NextResponse.json(
        { error: "token and telegramId are required." },
        { status: 400 }
      );
    }

    // Look up the token document
    const tokenQuery = await adminFirestore
      .collection("telegram_tokens")
      .where("token", "==", token)
      .where("used", "==", false)
      .limit(1)
      .get();

    if (tokenQuery.empty) {
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 400 }
      );
    }

    const tokenDoc = tokenQuery.docs[0];
    const tokenData = tokenDoc.data();

    // Check token expiry (10 minutes)
    const createdAt = new Date(tokenData.createdAt).getTime();
    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;
    if (now - createdAt > TEN_MINUTES) {
      return NextResponse.json(
        { error: "Token has expired. Please generate a new one." },
        { status: 400 }
      );
    }

    const uid = tokenData.uid;

    // Mark token as used
    await tokenDoc.ref.update({ used: true });

    // Update user document with telegramId
    await adminFirestore.collection("users").doc(uid).update({ telegramId });

    return NextResponse.json(
      { message: "Telegram account linked successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/telegram/link] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to link Telegram account." },
      { status: 500 }
    );
  }
}
