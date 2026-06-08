import { adminFirestore } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
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
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to list VMs";
    console.error("Failed to list VMs:", error);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const input = await request.json();
    const now = new Date().toISOString();
    const ref = adminFirestore
      .collection("users")
      .doc(auth.userId)
      .collection("vms")
      .doc();

    const record = {
      userId: auth.userId,
      userEmail: auth.email,
      name: input.name,
      displayname: input.displayname || input.name,
      state: input.state || "Running",
      templatename: input.templatename || "",
      serviceofferingname: input.serviceofferingname || "",
      cpunumber: input.cpunumber || 0,
      memory: input.memory || 0,
      zonename: input.zonename || "",
      created: now,
      updatedAt: now,
      ipaddress: input.ipaddress || null,
      cloudstackVmId: input.cloudstackVmId || null,
      cloudstackJobId: input.cloudstackJobId || null,
      cloudstackResponse: input.cloudstackResponse || null,
    };

    // Remove undefined values to avoid Firestore errors
    const cleanedRecord = Object.fromEntries(
      Object.entries(record).filter(([_, v]) => v !== undefined && v !== null)
    );

    await ref.set(cleanedRecord);

    return Response.json({
      success: true,
      vm: { id: ref.id, ...cleanedRecord },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create VM";
    console.error("Failed to create VM:", error);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
