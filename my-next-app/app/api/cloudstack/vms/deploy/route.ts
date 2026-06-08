import { 
  deployVirtualMachine, 
  listServiceOfferings, 
  listTemplates, 
  listZones,
} from "@/lib/cloudstack";
import { adminFirestore } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/middleware";

function uniqueById<T extends Record<string, unknown>>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = String(item.id ?? item.uuid ?? "");
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const [offerings, templates, zones] = await Promise.all([
      listServiceOfferings(),
      listTemplates(),
      listZones(),
    ]);

    return Response.json({
      success: true,
      offerings: uniqueById(offerings?.listserviceofferingsresponse?.serviceoffering || []),
      templates: uniqueById(templates?.listtemplatesresponse?.template || []),
      zones: uniqueById(zones?.listzonesresponse?.zone || []),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch deployment options";
    console.error("Failed to fetch deployment options:", error);
    return Response.json({
      success: false,
      error: message,
    });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const {
      name,
      displayname,
      serviceofferingid,
      templateid,
      zoneid,
      networkid,
      networkids,
      serviceofferingname,
      templatename,
      zonename,
      cpunumber,
      memory,
    } = body;

    if (!serviceofferingid || !templateid || !zoneid) {
      return Response.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const deployParams: Record<string, string> = {
      serviceofferingid,
      templateid,
      zoneid,
    };

    if (networkid) {
      deployParams.networkids = networkid;
    } else if (networkids) {
      deployParams.networkids = networkids;
    }

    const result = await deployVirtualMachine(deployParams);
    const deployment = result?.deployvirtualmachineresponse || result?.data?.deployvirtualmachineresponse || result?.data || result;
    const now = new Date().toISOString();
    const vmRef = adminFirestore.collection("users").doc(auth.userId).collection("vms").doc();
    const vmRecord = {
      userId: auth.userId,
      userEmail: auth.email,
      name: String(name || displayname || deployment?.name || deployment?.displayname || "new-vm"),
      displayname: String(displayname || name || deployment?.displayname || deployment?.name || "new-vm"),
      state: String(deployment?.state || "Running"),
      templatename: String(templatename || deployment?.templatename || templateid || ""),
      serviceofferingname: String(serviceofferingname || deployment?.serviceofferingname || serviceofferingid || ""),
      cpunumber: Number(cpunumber || deployment?.cpunumber || 0),
      memory: Number(memory || deployment?.memory || 0),
      zonename: String(zonename || deployment?.zonename || zoneid || ""),
      created: now,
      updatedAt: now,
      ipaddress: deployment?.ipaddress ? String(deployment.ipaddress) : undefined,
      cloudstackVmId: deployment?.id ? String(deployment.id) : undefined,
      cloudstackJobId: deployment?.jobid ? String(deployment.jobid) : undefined,
      cloudstackResponse: deployment,
    };

    const storedVmRecord = Object.fromEntries(
      Object.entries(vmRecord).filter(([, value]) => value !== undefined)
    );

    await vmRef.set(storedVmRecord);

    return Response.json({
      success: true,
      data: deployment,
      vm: {
        id: vmRef.id,
        ...storedVmRecord,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "VM deployment failed";
    console.error("VM deployment failed:", error);
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
