import { listVirtualMachines } from "@/lib/cloudstack";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;
  try {
    const result = await listVirtualMachines();
    const vms = result?.listvirtualmachinesresponse?.virtualmachine || [];
    const count = result?.listvirtualmachinesresponse?.count || vms.length;
    
    return Response.json({
      success: true,
      vms,
      count,
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
