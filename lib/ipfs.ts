/**
 * lib/ipfs.ts
 * -----------
 * Pinata IPFS upload helpers for NFT metadata JSON.
 */

const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

export interface VMMetadata {
  vmId: string;
  ownerWallet: string;
  region: string;
  cpu: number;
  ram: number;
  os: string;
  deploymentTimestamp: string;
  name?: string;
}

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload VM deployment metadata JSON to IPFS via Pinata.
 */
export async function uploadMetadataToIPFS(
  metadata: VMMetadata
): Promise<{ uri: string; hash: string }> {
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("Pinata API keys not configured");
  }

  const payload = {
    pinataContent: {
      name: `TeleCloudX VM Deployment #${metadata.vmId}`,
      description: `Proof of deployment for VM ${metadata.name || metadata.vmId} on TeleCloudX`,
      image: "https://telecloudx.io/nft-default.png",
      attributes: [
        { trait_type: "VM ID", value: metadata.vmId },
        { trait_type: "Region", value: metadata.region },
        { trait_type: "CPU", value: metadata.cpu, display_type: "number" },
        { trait_type: "RAM (MB)", value: metadata.ram, display_type: "number" },
        { trait_type: "OS", value: metadata.os },
        { trait_type: "Deployed At", value: metadata.deploymentTimestamp },
      ],
      ...metadata,
    },
    pinataMetadata: {
      name: `telecloudx-vm-${metadata.vmId}`,
    },
  };

  const res = await fetch(PINATA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata upload failed: ${res.status} ${text}`);
  }

  const data: PinataResponse = await res.json();
  const uri = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;

  return { uri, hash: data.IpfsHash };
}
