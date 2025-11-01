import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition deployment module for MonadTriviaFlexiblePool contract
 *
 * This module deploys the MonadTriviaFlexiblePool contract which manages
 * trivia games with flexible player pools and prize distribution.
 *
 * Usage:
 *   Local deployment: npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts
 *   Sepolia deployment: npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts --network sepolia
 */
const MonadTriviaFlexiblePoolModule = buildModule("MonadTriviaFlexiblePoolModule", (m) => {
  // Deploy the contract
  // The deployer's address will automatically become the owner
  const monadTriviaFlexiblePool = m.contract("MonadTriviaFlexiblePool");

  // Return the deployed contract
  return { monadTriviaFlexiblePool };
});

export default MonadTriviaFlexiblePoolModule;
