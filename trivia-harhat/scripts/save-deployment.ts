import fs from "fs";
import path from "path";

/**
 * Helper script to save deployment information
 *
 * Usage:
 *   After deployment, run:
 *   CONTRACT_ADDRESS=0x... NETWORK=sepolia npx hardhat run scripts/save-deployment.ts
 */

interface DeploymentInfo {
  contractAddress: string;
  network: string;
  deploymentDate: string;
  deployer?: string;
  blockNumber?: string;
  transactionHash?: string;
}

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const network = process.env.NETWORK || "unknown";

  if (!contractAddress) {
    console.error("❌ Error: CONTRACT_ADDRESS environment variable not set");
    console.log("\nUsage:");
    console.log("  CONTRACT_ADDRESS=0x... NETWORK=sepolia npx hardhat run scripts/save-deployment.ts");
    process.exit(1);
  }

  console.log("\n💾 Saving deployment information...\n");

  const deploymentInfo: DeploymentInfo = {
    contractAddress,
    network,
    deploymentDate: new Date().toISOString(),
    deployer: process.env.DEPLOYER_ADDRESS,
    blockNumber: process.env.BLOCK_NUMBER,
    transactionHash: process.env.TRANSACTION_HASH,
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save to network-specific file
  const fileName = `${network}-deployment.json`;
  const filePath = path.join(deploymentsDir, fileName);

  // Read existing deployments if file exists
  let deployments: DeploymentInfo[] = [];
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    deployments = JSON.parse(fileContent);
  }

  // Add new deployment
  deployments.push(deploymentInfo);

  // Save to file
  fs.writeFileSync(filePath, JSON.stringify(deployments, null, 2));

  console.log("✅ Deployment saved!");
  console.log("📁 File:", filePath);
  console.log("\n📋 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Also save to a latest.json file for easy access
  const latestPath = path.join(deploymentsDir, `${network}-latest.json`);
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✅ Latest deployment also saved to:", latestPath);

  console.log("\n💡 To load this deployment in your scripts:");
  console.log(`   const deployment = require('./deployments/${network}-latest.json');`);
  console.log(`   const contractAddress = deployment.contractAddress;`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
