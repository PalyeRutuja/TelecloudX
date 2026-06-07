/**
 * POST /api/telegram/generate-token
 * ---------------------------------
 * Generates a one-time token for linking a Telegram account.
 * The frontend dashboard calls this when the user clicks "Connect Telegram".
 * The token is stored in Firestore (telegram_tokens) with the user's UID.
 * 
 * Headers: Authorization: Bearer <JWT_TOKEN>
 * Response: { success, token, link }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt-auth";
import { adminFirestore } from "@/lib/firebase-admin";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Verify JWT auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const jwtToken = authHeader.substring(7);
    const payload = await verifyJWT(jwtToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or expired token" },
        { status: 401 }
      );
    }

    const { userId } = payload;

    // Generate a random one-time token
    const token = randomBytes(16).toString("hex");
    const botName = process.env.TELEGRAM_BOT_NAME || "TeleCloudXBot";

    // Store token in Firestore with expiry (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await adminFirestore.collection("telegram_tokens").add({
      token,
      uid: userId,
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    const link = `https://t.me/${botName}?start=${token}`;

    return NextResponse.json({
      success: true,
      token,
      link,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error("[POST /api/telegram/generate-token] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}
