import { 
  deployVirtualMachine, 
  listServiceOfferings, 
  listTemplates, 
  listZones,
} from "@/lib/cloudstack";
import { requireAuth } from "@/lib/middleware";

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
      offerings: offerings?.listserviceofferingsresponse?.serviceoffering || [],
      templates: templates?.listtemplatesresponse?.template || [],
      zones: zones?.listzonesresponse?.zone || [],
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
      serviceofferingid,
      templateid,
      zoneid,
      networkid,
      networkids,
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

    return Response.json({
      success: true,
      data: result?.deployvirtualmachineresponse,
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
