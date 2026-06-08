export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/middleware";
import { getNFTsByUserId } from "@/lib/nft";

interface NFTItem {
  id: string;
  vmId: string;
  region: string;
  cpu: number;
  ram: number;
  os: string;
  deploymentTimestamp: string;
  ipfsHash: string;
  tokenURI: string;
  txHash?: string;
  explorerUrl?: string;
  source: "firestore" | "pinata";
}

async function fetchPinataFallback(): Promise<NFTItem[]> {
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.log("[NFT List] Pinata credentials not configured, skipping fallback");
    return [];
  }

  try {
    const res = await fetch(
      "https://api.pinata.cloud/data/pinList?status=pinned",
      {
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: secretKey,
        },
      }
    );

    if (!res.ok) {
      console.error("[NFT List] Pinata pinList failed:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    const rows = data.rows || [];

    const telecloudPins = rows.filter((row: any) => {
      const name = row.metadata?.name || "";
      return name.startsWith("telecloudx-vm-");
    });

    const items: NFTItem[] = [];

    for (const pin of telecloudPins) {
      const ipfsHash = pin.ipfs_pin_hash;
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      let metadata: any = {};
      try {
        const metaRes = await fetch(tokenURI, { cache: "no-store" });
        if (metaRes.ok) {
          metadata = await metaRes.json();
        }
      } catch (e) {
        console.error("[NFT List] Failed to fetch IPFS metadata for", ipfsHash, e);
      }

      const attrs: Record<string, any> = {};
      if (Array.isArray(metadata.attributes)) {
        for (const attr of metadata.attributes) {
          if (attr.trait_type && attr.value !== undefined) {
            attrs[attr.trait_type] = attr.value;
          }
        }
      }

      items.push({
        id: `pinata_${ipfsHash}`,
        vmId: metadata.vmId || attrs["VM ID"] || pin.metadata?.name?.replace("telecloudx-vm-", "") || "unknown",
        region: metadata.region || attrs["Region"] || "Unknown",
        cpu: metadata.cpu ?? attrs["CPU"] ?? 0,
        ram: metadata.ram ?? attrs["RAM (MB)"] ?? 0,
        os: metadata.os || attrs["OS"] || "Unknown",
        deploymentTimestamp: metadata.deploymentTimestamp || attrs["Deployed At"] || pin.date_pinned || new Date().toISOString(),
        ipfsHash,
        tokenURI,
        source: "pinata",
      });
    }

    return items;
  } catch (error) {
    console.error("[NFT List] Pinata fallback error:", error);
    return [];
  }
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    let nfts: NFTItem[] = [];

    try {
      const firestoreNfts = await getNFTsByUserId(auth.userId);
      nfts = firestoreNfts.map((doc: any) => ({
        id: doc.id || `firestore_${doc.ipfsHash}`,
        vmId: doc.vmId || "unknown",
        region: doc.region || "Unknown",
        cpu: doc.cpu || 0,
        ram: doc.ram || 0,
        os: doc.os || "Unknown",
        deploymentTimestamp: doc.deploymentTimestamp || doc.mintedAt || new Date().toISOString(),
        ipfsHash: doc.ipfsHash || "",
        tokenURI: doc.tokenURI || `https://gateway.pinata.cloud/ipfs/${doc.ipfsHash || ""}`,
        txHash: doc.txHash,
        explorerUrl: doc.explorerUrl,
        source: "firestore" as const,
      }));
    } catch (firestoreError) {
      console.error("[NFT List] Firestore fetch failed:", firestoreError);
    }

    if (nfts.length === 0) {
      console.log("[NFT List] Firestore empty or failed, falling back to Pinata");
      nfts = await fetchPinataFallback();
    }

    return Response.json({ success: true, nfts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch NFTs";
    console.error("[NFT List] Unexpected error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
