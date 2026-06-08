/**
 * lib/nft.ts
 * ----------
 * Ethers.js helpers for minting DeploymentProofNFTs on XDC Network.
 */

import { ethers, JsonRpcProvider, Wallet, Contract } from "ethers";
import contractJson from "./contracts/DeploymentProofNFT.json";
import { uploadMetadataToIPFS, VMMetadata } from "./ipfs";
import { adminFirestore } from "./firebase-admin";

const RPC_URL = process.env.XDC_RPC_URL || "https://rpc.apothem.network";
const PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY || "";
const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || contractJson.address;

export interface MintResult {
  tokenId: string;
  txHash: string;
  tokenURI: string;
  ipfsHash: string;
  explorerUrl: string;
}

function getContract() {
  if (!PRIVATE_KEY) throw new Error("BACKEND_WALLET_PRIVATE_KEY not set");
  if (!CONTRACT_ADDRESS) throw new Error("NFT_CONTRACT_ADDRESS not set");

  const provider = new JsonRpcProvider(RPC_URL);
  const signer = new Wallet(PRIVATE_KEY, provider);
  return new Contract(CONTRACT_ADDRESS, contractJson.abi, signer);
}

/**
 * Mint a Deployment Proof NFT for a VM deployment.
 */
export async function mintDeploymentNFT(
  ownerWallet: string,
  vmMetadata: VMMetadata
): Promise<MintResult> {
  try {
    // 1. Upload metadata to IPFS
    const { uri, hash } = await uploadMetadataToIPFS(vmMetadata);
    console.log("[NFT] IPFS uploaded:", uri);

    // 2. Mint NFT
    const contract = getContract();
    const tx = await contract.mintDeploymentProof(ownerWallet, uri, vmMetadata.vmId);
    const receipt = await tx.wait();
    console.log("[NFT] Tx confirmed:", receipt.hash);

    // Extract tokenId from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "DeploymentProofMinted";
      } catch {
        return false;
      }
    });

    let tokenId = "0";
    if (event) {
      const parsed = contract.interface.parseLog(event);
      tokenId = parsed?.args?.tokenId?.toString() || "0";
    }

    const chainId = (await contract.runner?.provider?.getNetwork())?.chainId || BigInt(51);
    const explorerBase = chainId === BigInt(50)
      ? "https://xdcscan.io"
      : "https://apothem.xdcscan.io";

    const result: MintResult = {
      tokenId,
      txHash: receipt.hash,
      tokenURI: uri,
      ipfsHash: hash,
      explorerUrl: `${explorerBase}/tx/${receipt.hash}`,
    };

    // 3. Save to Firestore
    await adminFirestore.collection("deploymentNFTs").add({
      ...result,
      ...vmMetadata,
      ownerWallet,
      mintedAt: new Date().toISOString(),
      chainId: Number(chainId),
    });
    console.log("[NFT] Firestore saved");

    return result;
  } catch (error) {
    console.error("[NFT Error]", error);
    throw error;
  }
}

/**
 * Get all NFTs minted for a specific owner wallet.
 */
export async function getNFTsByOwner(ownerWallet: string) {
  const snap = await adminFirestore
    .collection("deploymentNFTs")
    .where("ownerWallet", "==", ownerWallet.toLowerCase())
    .orderBy("mintedAt", "desc")
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Get all NFTs minted for a specific userId (via Firestore doc query).
 */
export async function getNFTsByUserId(userId: string) {
  const snap = await adminFirestore
    .collection("deploymentNFTs")
    .where("userId", "==", userId)
    .orderBy("mintedAt", "desc")
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
