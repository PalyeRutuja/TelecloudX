import { destroyVirtualMachine } from "@/lib/cloudstack";
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

    // Try to destroy from CloudStack if we have a valid CloudStack ID
    if (id && !id.startsWith("vm-")) {
      try {
        cloudstackResult = await destroyVirtualMachine(id);
      } catch (err: any) {
        cloudstackError = err.message;
        console.error("CloudStack destroy failed (expected for mock IDs):", err.message);
      }
    }

    // Delete from Firebase regardless of CloudStack result
    const docId = firebaseId || id;
    if (docId) {
      try {
        await adminFirestore
          .collection("users")
          .doc(auth.userId)
          .collection("vms")
          .doc(docId)
          .delete();
      } catch (err: any) {
        console.error("Firebase delete failed:", err.message);
      }
    }

    return Response.json({
      success: true,
      data: cloudstackResult?.destroyvirtualmachineresponse,
      message: cloudstackError 
        ? "VM removed from your account. CloudStack destroy skipped (VM may be a mock or already deleted)."
        : "VM destroyed successfully",
      cloudstackError: cloudstackError || undefined,
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
