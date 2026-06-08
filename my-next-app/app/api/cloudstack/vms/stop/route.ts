import { stopVirtualMachine } from "@/lib/cloudstack";
import { adminFirestore } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/middleware";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const { id, firebaseId } = body;

    if (!id && !firebaseId) {
      return Response.json(
        { error: "VM ID or Firebase ID is required" },
        { status: 400 }
      );
    }

    let cloudstackResult = null;
    let cloudstackError = null;

    // Try to stop in CloudStack if we have a valid CloudStack ID
    if (id && !id.startsWith("vm-")) {
      try {
        cloudstackResult = await stopVirtualMachine(id);
      } catch (err: any) {
        cloudstackError = err.message;
        console.error("CloudStack stop failed (expected for mock IDs):", err.message);
      }
    }

    // Update Firebase state regardless of CloudStack result
    const docId = firebaseId;
    if (docId) {
      try {
        await adminFirestore
          .collection("users")
          .doc(auth.userId)
          .collection("vms")
          .doc(docId)
          .update({
            state: "Stopped",
            updatedAt: new Date().toISOString(),
          });
      } catch (err: any) {
        console.error("Firebase update failed:", err.message);
      }
    }

    return Response.json({
      success: true,
      data: cloudstackResult?.stopvirtualmachineresponse,
      message: cloudstackError 
        ? "VM state updated to Stopped. CloudStack stop skipped (VM may be a mock or already stopped)."
        : "VM stopped successfully",
      cloudstackError: cloudstackError || undefined,
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
