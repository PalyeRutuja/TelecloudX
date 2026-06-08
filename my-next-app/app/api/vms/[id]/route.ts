import { adminFirestore } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/middleware";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const { id } = await params;
    const docSnap = await adminFirestore
      .collection("users")
      .doc(auth.userId)
      .collection("vms")
      .doc(id)
      .get();

    if (!docSnap.exists) {
      return Response.json({ success: false, error: "VM not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      vm: { id: docSnap.id, ...docSnap.data() },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get VM";
    console.error("Failed to get VM:", error);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const { id } = await params;
    const updates = await request.json();
    const ref = adminFirestore
      .collection("users")
      .doc(auth.userId)
      .collection("vms")
      .doc(id);

    const docSnap = await ref.get();
    if (!docSnap.exists) {
      return Response.json({ success: false, error: "VM not found" }, { status: 404 });
    }

    const next = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const cleanedNext = Object.fromEntries(
      Object.entries(next).filter(([_, v]) => v !== undefined && v !== null)
    );

    await ref.set(cleanedNext, { merge: true });

    const refreshed = await ref.get();
    return Response.json({
      success: true,
      vm: { id: refreshed.id, ...refreshed.data() },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update VM";
    console.error("Failed to update VM:", error);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const { id } = await params;
    const ref = adminFirestore
      .collection("users")
      .doc(auth.userId)
      .collection("vms")
      .doc(id);

    const docSnap = await ref.get();
    if (!docSnap.exists) {
      return Response.json({ success: false, error: "VM not found" }, { status: 404 });
    }

    await ref.delete();

    return Response.json({
      success: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete VM";
    console.error("Failed to delete VM:", error);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
