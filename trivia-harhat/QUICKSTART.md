# MonadTriviaFlexiblePool - Quick Start Guide

Get your trivia game smart contract deployed and running in minutes!

## 🚀 Quick Deploy

### Option 1: Hardhat Ignition (Recommended)

```bash
# Deploy to local network
npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts

# Deploy to Monad testnet (Recommended for this project!)
npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts --network monadTestnet

# Deploy to Sepolia testnet
npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts --network sepolia
```

### Option 2: Traditional Script

```bash
# Deploy to local network
npx hardhat run scripts/deploy.ts

# Deploy to Monad testnet
npx hardhat run scripts/deploy.ts --network monadTestnet

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia
```

## 🧪 Test the Contract

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/MonadTriviaFlexiblePool.test.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

## 🎮 Interact with Deployed Contract

```bash
# Set your contract address
export CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Run interaction script
npx hardhat run scripts/interact.ts
```

## 📋 Common Commands

```bash
# Compile contracts
npx hardhat compile

# Clean artifacts
npx hardhat clean

# Run tests
npx hardhat test

# Start local node
npx hardhat node

# Check contract size
npx hardhat compile && ls -lh artifacts/contracts/trivia.sol/*.json
```

## 🌐 Network Setup

### For Monad Testnet (Recommended!)

Monad offers ~1 second block times and up to 10,000 TPS - perfect for trivia games!

1. **Add Monad Testnet to MetaMask:**
   - Visit https://chainlist.org/chain/10143
   - Click "Connect Wallet" and "Add to MetaMask"
   - Or manually add: RPC `https://testnet-rpc.monad.xyz`, Chain ID `10143`

2. **Get testnet MON tokens:**
   - Check Monad Discord for faucet links
   - You'll need ~0.1 MON for deployment and testing

3. **Create `.env` file:**
```bash
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_TESTNET_PRIVATE_KEY=your_private_key_here
```

4. **Deploy:**
```bash
npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts --network monadTestnet
```

5. **View on Explorer:**
   - https://testnet.monadexplorer.com/

### For Sepolia Testnet (Alternative)

1. Get Sepolia ETH from a faucet:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia

2. Create `.env` file (if not exists):
```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here
```

3. Deploy:
```bash
npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts --network sepolia
```

## 🎯 Game Flow Example

```typescript
// 1. Create a game
const gameId = keccak256(toBytes("my-game"));
await contract.write.createGame([gameId, 3, parseEther("0.1"), parseEther("0.01")]);

// 2. Players join
await contract.write.joinGame([gameId], { account: player1.account });
await contract.write.joinGame([gameId], { account: player2.account });

// 3. Players fund the pool
await contract.write.fundPool([gameId], { account: host.account, value: parseEther("0.1") });
await contract.write.fundPool([gameId], { account: player1.account, value: parseEther("0.1") });
await contract.write.fundPool([gameId], { account: player2.account, value: parseEther("0.1") });

// 4. Host starts the game
await contract.write.startGame([gameId], { account: host.account });

// 5. Set winner after game ends
await contract.write.setWinner([gameId, winnerAddress], { account: host.account });
```

## 📊 Contract Details

- **Contract**: MonadTriviaFlexiblePool
- **Solidity Version**: 0.8.28
- **License**: MIT
- **Bytecode Size**: ~7.8 KB (within 24KB limit)

## 🔧 Troubleshooting

### Deployment fails with "insufficient funds"
- Fund your wallet with testnet ETH from a faucet

### "nonce too high" error
- Wait for pending transactions or reset MetaMask account

### Contract size exceeds limit
- Enable optimizer in hardhat config (already configured)

### Tests failing
- Run `npx hardhat clean` and `npx hardhat compile`
- Make sure dependencies are installed: `pnpm install`

## 📚 More Information

- Full deployment guide: See `DEPLOYMENT.md`
- Contract tests: See `test/MonadTriviaFlexiblePool.test.ts`
- Hardhat docs: https://hardhat.org

## 🎉 Success!

Your contract is now deployed and ready to use! The contract address will be displayed after deployment.

Example output:
```
Deployed Addresses
MonadTriviaFlexiblePoolModule#MonadTriviaFlexiblePool - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Save this address - you'll need it to interact with your contract!

---

**Need Help?** Check the full `DEPLOYMENT.md` guide for detailed instructions.
