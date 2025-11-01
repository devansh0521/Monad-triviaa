import { network } from "hardhat";
import { parseEther, keccak256, toBytes, getAddress, formatEther } from "viem";

/**
 * Script to interact with deployed MonadTriviaFlexiblePool contract
 *
 * Usage:
 *   npx hardhat run scripts/interact.ts --network sepolia
 *
 * Make sure to set CONTRACT_ADDRESS environment variable or update it in the script
 */

// Update this with your deployed contract address
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  console.log("\n🎮 Interacting with MonadTriviaFlexiblePool contract...\n");

  // Connect to network
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  // Get wallet clients
  const [owner, host, player1, player2] = await viem.getWalletClients();

  console.log("📝 Accounts:");
  console.log("   Owner:", owner.account.address);
  console.log("   Host:", host.account.address);
  console.log("   Player 1:", player1.account.address);
  console.log("   Player 2:", player2.account.address, "\n");

  // Get contract instance
  const contract = await viem.getContractAt(
    "MonadTriviaFlexiblePool",
    CONTRACT_ADDRESS as `0x${string}`
  );

  console.log("📋 Contract Address:", contract.address);
  console.log("👑 Contract Owner:", await contract.read.owner(), "\n");

  // Example: Create a game
  console.log("🎯 Creating a new game...");
  const gameId = keccak256(toBytes(`demo-game-${Date.now()}`));
  const playerCount = 2n;
  const entryAmount = parseEther("0.01"); // 0.01 ETH entry
  const platformFee = parseEther("0.001"); // 0.001 ETH platform fee

  const createGameHash = await contract.write.createGame(
    [gameId, playerCount, entryAmount, platformFee],
    { account: host.account }
  );

  await publicClient.waitForTransactionReceipt({ hash: createGameHash });
  console.log("✅ Game created! Transaction:", createGameHash);
  console.log("   Game ID:", gameId);
  console.log("   Player Count:", playerCount.toString());
  console.log("   Entry Amount:", formatEther(entryAmount), "ETH");
  console.log("   Platform Fee:", formatEther(platformFee), "ETH\n");

  // Get game info
  const game = await contract.read.games([gameId]);
  console.log("📊 Game Info:");
  console.log("   Host:", game[0]);
  console.log("   Player Count:", game[1].toString());
  console.log("   Entry Amount:", formatEther(game[2]), "ETH");
  console.log("   Platform Fee:", formatEther(game[3]), "ETH");
  console.log("   Winner:", game[4]);
  console.log("   Status:", ["Pending", "Funded", "Active", "Finished"][game[5]]);
  console.log("   Funded Count:", game[6].toString(), "\n");

  // Get players
  const players = await contract.read.getGamePlayers([gameId]);
  console.log("👥 Players in game:", players.length);
  players.forEach((player, index) => {
    console.log(`   Player ${index + 1}:`, player);
  });

  // Example: Join game
  console.log("\n🎮 Player 1 joining game...");
  const joinHash = await contract.write.joinGame([gameId], {
    account: player1.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: joinHash });
  console.log("✅ Player 1 joined! Transaction:", joinHash);

  // Get updated players list
  const updatedPlayers = await contract.read.getGamePlayers([gameId]);
  console.log("\n👥 Updated players:", updatedPlayers.length);
  updatedPlayers.forEach((player, index) => {
    console.log(`   Player ${index + 1}:`, player);
  });

  // Example: Fund pool
  console.log("\n💰 Funding pool...");
  console.log("   Host funding...");
  const hostFundHash = await contract.write.fundPool([gameId], {
    account: host.account,
    value: entryAmount,
  });
  await publicClient.waitForTransactionReceipt({ hash: hostFundHash });
  console.log("   ✅ Host funded! Transaction:", hostFundHash);

  console.log("   Player 1 funding...");
  const player1FundHash = await contract.write.fundPool([gameId], {
    account: player1.account,
    value: entryAmount,
  });
  await publicClient.waitForTransactionReceipt({ hash: player1FundHash });
  console.log("   ✅ Player 1 funded! Transaction:", player1FundHash);

  // Check game status
  const fundedGame = await contract.read.games([gameId]);
  console.log("\n📊 Game Status after funding:");
  console.log("   Status:", ["Pending", "Funded", "Active", "Finished"][fundedGame[5]]);
  console.log("   Funded Count:", fundedGame[6].toString());

  // Example: Start game
  console.log("\n🚀 Host starting game...");
  const startHash = await contract.write.startGame([gameId], {
    account: host.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: startHash });
  console.log("✅ Game started! Transaction:", startHash);

  // Check game status
  const activeGame = await contract.read.games([gameId]);
  console.log("\n📊 Game Status after start:");
  console.log("   Status:", ["Pending", "Funded", "Active", "Finished"][activeGame[5]]);

  // Example: Set winner
  console.log("\n🏆 Setting winner...");
  const player1BalanceBefore = await publicClient.getBalance({
    address: player1.account.address,
  });
  console.log("   Player 1 balance before:", formatEther(player1BalanceBefore), "ETH");

  const setWinnerHash = await contract.write.setWinner(
    [gameId, player1.account.address],
    { account: host.account }
  );
  await publicClient.waitForTransactionReceipt({ hash: setWinnerHash });
  console.log("✅ Winner set! Transaction:", setWinnerHash);

  const player1BalanceAfter = await publicClient.getBalance({
    address: player1.account.address,
  });
  console.log("   Player 1 balance after:", formatEther(player1BalanceAfter), "ETH");
  console.log(
    "   Prize received:",
    formatEther(player1BalanceAfter - player1BalanceBefore),
    "ETH"
  );

  // Final game status
  const finishedGame = await contract.read.games([gameId]);
  console.log("\n📊 Final Game Status:");
  console.log("   Status:", ["Pending", "Funded", "Active", "Finished"][finishedGame[5]]);
  console.log("   Winner:", finishedGame[4]);

  // Get contract balance
  const contractBalance = await publicClient.getBalance({
    address: contract.address,
  });
  console.log("\n💰 Contract Balance:", formatEther(contractBalance), "ETH");

  console.log("\n✨ Interaction complete!\n");
}

// Execute interaction
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });
