import { adminFirestore } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    // Fetch user's VMs from Firebase (stored during deployment)
    const vmsSnapshot = await adminFirestore
      .collection("users")
      .doc(auth.userId)
      .collection("vms")
      .orderBy("created", "desc")
      .get();

    const vms = vmsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return Response.json({
      success: true,
      vms,
      count: vms.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to list VMs";
    console.error("Failed to list VMs:", error);
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
