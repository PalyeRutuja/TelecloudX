export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/middleware";
import { stopVirtualMachine } from "@/lib/cloudstack";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return Response.json(
        { error: "VM ID is required" },
        { status: 400 }
      );
    }

    const result = await stopVirtualMachine();

    return Response.json({
      success: true,
      data: result?.stopvirtualmachineresponse,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to stop VM";
    console.error("Failed to stop VM:", error);
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
