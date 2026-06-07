/**
 * POST /api/vms/deploy
 * --------------------
 * Initiates a new VM deployment for the authenticated user.
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
