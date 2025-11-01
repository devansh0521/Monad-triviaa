import { network } from "hardhat";
import { formatEther } from "viem";

/**
 * Traditional deployment script for MonadTriviaFlexiblePool contract
 *
 * Usage:
 *   Local: npx hardhat run scripts/deploy.ts
 *   Sepolia: npx hardhat run scripts/deploy.ts --network sepolia
 */
async function main() {
  console.log("\n🚀 Starting MonadTriviaFlexiblePool deployment...\n");

  // Connect to the network
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  // Get deployer account
  const [deployer] = await viem.getWalletClients();
  console.log("📝 Deployer address:", deployer.account.address);

  // Get deployer balance
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log("💰 Deployer balance:", formatEther(balance), "ETH\n");

  // Get network info
  const chainId = await publicClient.getChainId();
  console.log("🌐 Network Chain ID:", chainId);
  console.log("🌐 Network name:", publicClient.chain?.name || "Unknown\n");

  // Deploy the contract
  console.log("⏳ Deploying MonadTriviaFlexiblePool contract...");
  const startTime = Date.now();

  const contract = await viem.deployContract("MonadTriviaFlexiblePool");

  const deployTime = Date.now() - startTime;
  console.log("✅ Contract deployed successfully!");
  console.log("⏱️  Deployment time:", `${deployTime}ms\n`);

  // Get deployment details
  console.log("📋 Deployment Details:");
  console.log("   Contract Address:", contract.address);
  console.log("   Contract Owner:", await contract.read.owner());
  console.log("   Deployer matches Owner:", deployer.account.address.toLowerCase() === (await contract.read.owner()).toLowerCase());

  // Get contract bytecode size
  const code = await publicClient.getCode({ address: contract.address });
  const codeSize = code ? (code.length - 2) / 2 : 0; // Remove '0x' and convert hex to bytes
  console.log("   Bytecode Size:", codeSize, "bytes");
  console.log("   Max Size (24KB):", codeSize <= 24576 ? "✅ Within limit" : "❌ Exceeds limit");

  console.log("\n✨ Deployment complete!\n");

  // Save deployment info
  const blockNumber = await publicClient.getBlockNumber();
  const deploymentInfo = {
    network: publicClient.chain?.name || "unknown",
    chainId: Number(chainId),
    contractAddress: contract.address,
    deployerAddress: deployer.account.address,
    owner: await contract.read.owner(),
    deploymentTime: new Date().toISOString(),
    blockNumber: blockNumber.toString(),
  };

  console.log("💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
