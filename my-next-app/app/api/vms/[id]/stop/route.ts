/**
 * POST /api/vms/[id]/stop
 * -----------------------
 * Stops a specific VM owned by the authenticated user.
 *
 * // FRONTEND ENDPOINT — EMPTY
 * This endpoint is reserved for frontend integration. It currently returns
 * a placeholder response and will be implemented once the dashboard UI is built.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // FRONTEND ENDPOINT — EMPTY
  return NextResponse.json(
    { status: "not implemented" },
    { status: 501 }
  );
}
