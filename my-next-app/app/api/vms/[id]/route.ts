/**
 * GET /api/vms/[id]
 * -----------------
 * Returns the status and details of a specific VM.
 *
 * // FRONTEND ENDPOINT — EMPTY
 * This endpoint is reserved for frontend integration. It currently returns
 * a placeholder response and will be implemented once the dashboard UI is built.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // FRONTEND ENDPOINT — EMPTY
  return NextResponse.json(
    { status: "not implemented" },
    { status: 501 }
  );
}
