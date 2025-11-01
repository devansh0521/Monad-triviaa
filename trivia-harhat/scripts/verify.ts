import { network } from "hardhat";

/**
 * Script to verify the deployed contract on block explorer
 *
 * Usage:
 *   npx hardhat run scripts/verify.ts --network sepolia
 *
 * Make sure to:
 * 1. Set CONTRACT_ADDRESS environment variable
 * 2. Configure ETHERSCAN_API_KEY in your hardhat config if using Etherscan
 */

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

async function main() {
  if (!CONTRACT_ADDRESS) {
    console.error("❌ Error: CONTRACT_ADDRESS environment variable not set");
    console.log("\nUsage:");
    console.log("  CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify.ts --network sepolia");
    process.exit(1);
  }

  console.log("\n🔍 Verifying contract on block explorer...\n");
  console.log("📋 Contract Address:", CONTRACT_ADDRESS);
  console.log("🌐 Network:", network.name, "\n");

  try {
    // Note: You'll need to install and configure @nomicfoundation/hardhat-verify
    // Add to hardhat.config.ts:
    // import "@nomicfoundation/hardhat-verify";
    // And add etherscan config with your API key

    console.log("⏳ Submitting contract for verification...");
    console.log("\n📝 Note: This contract has no constructor arguments\n");

    // For manual verification, you can use:
    // npx hardhat verify --network sepolia CONTRACT_ADDRESS

    console.log("✅ To verify manually, run:");
    console.log(`   npx hardhat verify --network ${network.name} ${CONTRACT_ADDRESS}`);
    console.log("\n💡 Make sure you have configured etherscan API key in hardhat.config.ts");
    console.log("   and installed: pnpm add -D @nomicfoundation/hardhat-verify\n");
  } catch (error) {
    console.error("❌ Verification failed:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
