import { destroyVirtualMachine } from "@/lib/cloudstack";
import { requireAuth } from "@/lib/middleware";

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

    const updated = await destroyVirtualMachine(id);

    return Response.json({
      success: true,
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to destroy VM";
    console.error("Failed to destroy VM:", error);
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
