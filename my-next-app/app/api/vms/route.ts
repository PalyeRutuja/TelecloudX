/**
 * GET /api/vms
 * ------------
 * Returns a list of all VMs belonging to the authenticated user.
 *
 * // FRONTEND ENDPOINT — EMPTY
 * This endpoint is reserved for frontend integration. It currently returns
 * a placeholder response and will be implemented once the dashboard UI is built.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // FRONTEND ENDPOINT — EMPTY
  return NextResponse.json(
    { status: "not implemented" },
    { status: 501 }
  );
}
