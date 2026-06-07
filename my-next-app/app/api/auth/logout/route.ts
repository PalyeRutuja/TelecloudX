/**
 * POST /api/auth/logout
 * ---------------------
 * For custom JWT auth, logout is client-side (delete token from storage).
 * This endpoint acknowledges the logout and can be used for server-side
 * session tracking in the future.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt-auth";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      // Verify token is valid before acknowledging logout
      const payload = await verifyJWT(token);
      if (payload) {
        // In a future version, we could maintain a blocklist of revoked tokens
        console.log(`[Logout] User ${payload.userId} (${payload.email}) logged out`);
      }
    }

    return NextResponse.json(
      { message: "Logged out successfully. Please clear your local token." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/auth/logout] Error:", error);
    return NextResponse.json(
      { error: error.message || "Logout failed." },
      { status: 500 }
    );
  }
}
