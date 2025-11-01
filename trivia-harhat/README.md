# MonadTriviaFlexiblePool Smart Contract

A high-performance trivia game smart contract designed for the Monad blockchain, supporting flexible player pools and automated prize distribution.

## 🎮 Overview

MonadTriviaFlexiblePool is an EVM-compatible smart contract that manages trivia game sessions with:
- Flexible player counts (2-20 players per game)
- Pooled entry fees with automatic winner payouts
- Platform fee collection
- Complete game lifecycle management
- EVM compatibility for deployment on any EVM chain

## ✨ Features

- **Flexible Game Creation**: Hosts can create games with 2-20 players
- **Secure Fund Management**: Entry fees held in contract until game completion
- **Automated Payouts**: Winners receive pooled funds minus platform fee
- **Access Control**: Host-controlled game flow and owner-controlled admin functions
- **Event Logging**: Comprehensive events for frontend integration
- **Gas Optimized**: Bytecode size ~7.8KB, well within 24KB limit

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
pnpm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

### Deploy to Monad Testnet

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your private key

# 2. Get testnet MON from faucet
# Check Monad Discord for faucet links

# 3. Deploy
npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts --network monadTestnet

# 4. View on explorer
# https://testnet.monadexplorer.com/
```

## 📋 Contract Details

### Network Information

**Monad Testnet:**
- Chain ID: `10143`
- RPC URL: `https://testnet-rpc.monad.xyz`
- Explorer: `https://testnet.monadexplorer.com/`
- Currency: `MON`
- Block Time: ~1 second
- TPS: Up to 10,000

### Contract Specifications

- **Solidity Version**: 0.8.28
- **License**: MIT
- **Bytecode Size**: 7,811 bytes
- **Gas Optimized**: Production settings enabled
- **Test Coverage**: 31 comprehensive tests

## 🎯 Game Flow

```typescript
1. Host creates game
   → createGame(gameId, playerCount, entryAmount, platformFee)

2. Players join
   → joinGame(gameId)

3. All players fund pool
   → fundPool(gameId) { value: entryAmount }

4. Host starts game
   → startGame(gameId)

5. Off-chain: Players answer trivia questions

6. Host sets winner
   → setWinner(gameId, winnerAddress)
   → Automatic payout to winner and platform
```

## 📁 Project Structure

```
trivia-harhat/
├── contracts/
│   └── trivia.sol                    # Main contract
├── test/
│   └── MonadTriviaFlexiblePool.test.ts  # Comprehensive tests
├── scripts/
│   ├── deploy.ts                     # Deployment script
│   ├── interact.ts                   # Interaction demo
│   ├── verify.ts                     # Verification helper
│   └── save-deployment.ts            # Deployment tracking
├── ignition/
│   └── modules/
│       └── MonadTriviaFlexiblePool.ts   # Ignition module
├── QUICKSTART.md                     # Quick reference
├── DEPLOYMENT.md                     # Full deployment guide
├── MONAD_DEPLOYMENT.md               # Monad-specific guide
└── hardhat.config.ts                 # Hardhat configuration
```

## 🧪 Testing

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/MonadTriviaFlexiblePool.test.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

### Test Results

```
✅ 31 passing tests
- Deployment: 1 test
- Game Creation: 6 tests
- Joining Games: 5 tests
- Funding Pool: 7 tests
- Starting Games: 4 tests
- Winner & Payouts: 6 tests
- Owner Functions: 2 tests
- Full Game Flow: 1 test
```

## 🔧 Configuration

### Supported Networks

- `hardhatMainnet`: Local simulated L1
- `hardhatOp`: Local simulated OP Stack
- `monadTestnet`: Monad Testnet (Chain ID: 10143)
- `sepolia`: Ethereum Sepolia testnet
- `localhost`: Local Hardhat node

### Environment Variables

```bash
# Monad Testnet
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_TESTNET_PRIVATE_KEY=your_private_key

# Sepolia (optional)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
SEPOLIA_PRIVATE_KEY=your_private_key

# Contract address (after deployment)
CONTRACT_ADDRESS=0x8957d86B15D194D6eaA1eEe82735B68908c5c8A1
```



## 🔐 Security

### Best Practices

- ✅ Tested with 31 comprehensive test cases
- ✅ Access control on critical functions
- ✅ Reentrancy protection via checks-effects-interactions pattern
- ✅ Input validation on all public functions
- ✅ Event logging for transparency
- ✅ Gas optimized with production compiler settings

### Audit Recommendations

Before mainnet deployment:
1. Professional security audit
2. Extensive testnet testing
3. Bug bounty program
4. Gradual rollout with limits

## 💡 Why Monad?

Monad offers exceptional performance for trivia games:

- **Fast Block Times**: ~1 second (vs 12s on Ethereum)
- **High Throughput**: Up to 10,000 TPS
- **Low Latency**: Near-instant transaction confirmation
- **Lower Costs**: Reduced gas fees
- **EVM Compatible**: Use existing Solidity code and tools

Perfect for interactive, real-time trivia experiences!

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Compile contracts
npx hardhat compile

# Clean build artifacts
npx hardhat clean

# Start local node
npx hardhat node

# Deploy locally
npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts

# Run interaction script
npx hardhat run scripts/interact.ts --network monadTestnet
```

## 📊 Gas Costs (Estimated)

| Operation | Gas Cost | MON Cost* |
|-----------|----------|-----------|
| Deploy Contract | ~1,200,000 | ~0.0012 MON |
| Create Game | ~150,000 | ~0.00015 MON |
| Join Game | ~80,000 | ~0.00008 MON |
| Fund Pool | ~70,000 | ~0.00007 MON |
| Start Game | ~50,000 | ~0.00005 MON |
| Set Winner | ~100,000 | ~0.0001 MON |

*Estimated assuming 1 Gwei gas price

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Resources

- **Monad Docs**: https://docs.monad.xyz
- **Monad Discord**: Community support and faucet
- **Hardhat Docs**: https://hardhat.org
- **Block Explorer**: https://testnet.monadexplorer.com/

## 🆘 Support

- Check [MONAD_DEPLOYMENT.md](./MONAD_DEPLOYMENT.md) for troubleshooting
- Visit Monad Discord for network support
- Review test files for usage examples
- Create GitHub issues for bugs

## 🎉 Acknowledgments

Built with:
- Hardhat 3.x
- Viem for Ethereum interactions
- Solidity 0.8.28
- Deployed on Monad Testnet

---

**Ready to deploy?** See [QUICKSTART.md](./QUICKSTART.md) for step-by-step instructions!
