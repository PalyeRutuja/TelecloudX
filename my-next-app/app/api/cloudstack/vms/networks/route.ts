import { listNetworks } from "@/lib/cloudstack";
import { requireAuth } from "@/lib/middleware";

type CloudStackNetworkRecord = {
  id?: string;
  uuid?: string;
  name?: string;
  displaytext?: string;
  traffictype?: string;
  networkofferingname?: string;
  isdefault?: boolean | string;
  state?: string;
  [key: string]: unknown;
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function dedupeNetworks(networks: CloudStackNetworkRecord[]): CloudStackNetworkRecord[] {
  const seen = new Set<string>();
  const result: CloudStackNetworkRecord[] = [];

  for (const network of networks) {
    const dedupeKey =
      network.id ||
      network.uuid ||
      `${network.name ?? ""}:${network.displaytext ?? ""}:${network.traffictype ?? ""}`;

    if (!dedupeKey || seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    result.push(network);
  }

  return result;
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const zoneid = searchParams.get("zoneid");

  if (!zoneid) {
    return Response.json({ error: "zoneid query parameter is required" }, { status: 400 });
  }

  try {
    const result = await listNetworks(zoneid) as { listnetworksresponse?: { network?: CloudStackNetworkRecord | CloudStackNetworkRecord[] } };
    const rawNetworks = result?.listnetworksresponse?.network;
    const networks = dedupeNetworks(asArray(rawNetworks));

    return Response.json({
      success: true,
      networks,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch networks";
    console.error("Failed to fetch networks:", error);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
