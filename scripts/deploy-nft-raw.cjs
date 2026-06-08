const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const RPC_URL = process.env.XDC_RPC_URL || "https://rpc.apothem.network";
const PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY;

// Compiled contract bytecode and ABI from Hardhat artifacts
const artifactPath = path.join(__dirname, "../artifacts/contracts/DeploymentProofNFT.sol/DeploymentProofNFT.json");

async function main() {
  if (!PRIVATE_KEY) {
    console.error("Missing BACKEND_WALLET_PRIVATE_KEY in .env.local");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(`0x${PRIVATE_KEY.replace(/^0x/, "")}`, provider);

  console.log("Deployer address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "XDC");

  if (balance === 0n) {
    console.error("Wallet has no XDC. Fund it first at https://faucet.apothem.network/");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  console.log("Deploying DeploymentProofNFT...");
  const contract = await factory.deploy(wallet.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Deployed to:", address);

  // Save to lib/contracts
  const out = {
    address,
    abi: artifact.abi,
    network: "xdcapothem",
    deployedAt: new Date().toISOString(),
  };
  const outPath = path.join(__dirname, "../lib/contracts/DeploymentProofNFT.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log("Saved to:", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
