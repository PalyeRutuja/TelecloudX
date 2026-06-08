const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const DeploymentProofNFT = await hre.ethers.getContractFactory("DeploymentProofNFT");
  const nft = await DeploymentProofNFT.deploy(deployer.address);
  await nft.waitForDeployment();

  const address = await nft.getAddress();
  console.log("DeploymentProofNFT deployed to:", address);

  const abi = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/DeploymentProofNFT.sol/DeploymentProofNFT.json"),
      "utf-8"
    )
  ).abi;

  const out = {
    address,
    abi,
    network: hre.network.name,
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
