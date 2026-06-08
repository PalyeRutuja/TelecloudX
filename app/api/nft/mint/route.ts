export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/middleware";
import { mintDeploymentNFT } from "@/lib/nft";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const {
      ownerWallet,
      vmId,
      region,
      cpu,
      ram,
      os,
      deploymentTimestamp,
      name,
    } = body;

    if (!ownerWallet || !vmId) {
      return Response.json(
        { error: "ownerWallet and vmId are required" },
        { status: 400 }
      );
    }

    const result = await mintDeploymentNFT(ownerWallet, {
      vmId,
      ownerWallet,
      region: region || "Unknown",
      cpu: cpu || 0,
      ram: ram || 0,
      os: os || "Unknown",
      deploymentTimestamp: deploymentTimestamp || new Date().toISOString(),
      name,
    });

    return Response.json({
      success: true,
      nft: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "NFT minting failed";
    console.error("[NFT Mint] Error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
