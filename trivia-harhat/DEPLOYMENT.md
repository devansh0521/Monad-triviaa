# MonadTriviaFlexiblePool Deployment Guide

This guide explains how to deploy and interact with the MonadTriviaFlexiblePool smart contract.

## Prerequisites

1. Node.js and pnpm installed
2. Hardhat project set up (already done)
3. Network configuration in `hardhat.config.ts`
4. Private key and RPC URL for target network

## Deployment Methods

### Method 1: Hardhat Ignition (Recommended)

Hardhat Ignition is the recommended deployment system for Hardhat 3.x. It provides declarative deployments with built-in validation and verification.

#### Local Network Deployment

```bash
# Start local Hardhat node in a separate terminal
npx hardhat node

# Deploy using Ignition
npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts --network localhost
```

#### Testnet Deployment (Sepolia)

```bash
# Make sure you have configured SEPOLIA_RPC_URL and SEPOLIA_PRIVATE_KEY
npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts --network sepolia
```

The deployment information will be saved in `ignition/deployments/` directory.

### Method 2: Traditional Deployment Script

Use the traditional deployment script for more control and detailed output.

#### Local Network Deployment

```bash
# Start local Hardhat node in a separate terminal
npx hardhat node

# Deploy
npx hardhat run scripts/deploy.ts --network localhost
```

#### Testnet Deployment (Sepolia)

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

## Environment Variables

Create a `.env` file in the `trivia-harhat` directory (if not already present):

```env
# Sepolia Testnet
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here

# Optional: For contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: For deployed contract interaction
CONTRACT_ADDRESS=0x...
```

**⚠️ Security Warning**: Never commit your `.env` file or expose your private keys!

## Post-Deployment

### 1. Verify Contract (Optional but Recommended)

For Sepolia or other public networks, verify your contract on Etherscan:

```bash
# Install verification plugin
pnpm add -D @nomicfoundation/hardhat-verify

# Add to hardhat.config.ts:
# import "@nomicfoundation/hardhat-verify";
# etherscan: {
#   apiKey: configVariable("ETHERSCAN_API_KEY")
# }

# Verify contract
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

Or use the verify script:

```bash
CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify.ts --network sepolia
```

### 2. Interact with Deployed Contract

Use the interaction script to test your deployed contract:

```bash
# Set contract address
export CONTRACT_ADDRESS=0x...

# Run interaction script
npx hardhat run scripts/interact.ts --network sepolia
```

This script will:
- Create a demo game
- Add players
- Fund the pool
- Start the game
- Set a winner
- Distribute prizes

## Network Configuration

### Supported Networks

- **hardhatMainnet**: Local simulated L1 network
- **hardhatOp**: Local simulated OP Stack network
- **sepolia**: Ethereum Sepolia testnet
- **localhost**: Local Hardhat node

### Adding More Networks

Add network configurations to `hardhat.config.ts`:

```typescript
networks: {
  mainnet: {
    type: "http",
    chainType: "l1",
    url: configVariable("MAINNET_RPC_URL"),
    accounts: [configVariable("MAINNET_PRIVATE_KEY")],
  },
  // Add more networks...
}
```

## Deployment Checklist

- [ ] Compile contracts: `npx hardhat compile`
- [ ] Run tests: `npx hardhat test`
- [ ] Configure network in `hardhat.config.ts`
- [ ] Set environment variables (RPC URL, Private Key)
- [ ] Fund deployer account with native tokens
- [ ] Deploy contract using Ignition or deployment script
- [ ] Save contract address
- [ ] Verify contract on block explorer (optional)
- [ ] Test contract interaction
- [ ] Document deployment details

## Deployment Output

After successful deployment, you'll see:

```
🚀 Starting MonadTriviaFlexiblePool deployment...

📝 Deployer address: 0x...
💰 Deployer balance: 1.5 ETH

🌐 Network Chain ID: 11155111
🌐 Network name: Sepolia

⏳ Deploying MonadTriviaFlexiblePool contract...
✅ Contract deployed successfully!
⏱️  Deployment time: 2500ms

📋 Deployment Details:
   Contract Address: 0x...
   Contract Owner: 0x...
   Deployer matches Owner: true
   Bytecode Size: 4521 bytes
   Max Size (24KB): ✅ Within limit

✨ Deployment complete!
```

## Troubleshooting

### Issue: Insufficient funds

```
Error: insufficient funds for gas
```

**Solution**: Fund your deployer account with native tokens (ETH for Sepolia).

### Issue: Nonce too high

```
Error: nonce has already been used
```

**Solution**: Wait for pending transactions or reset your account in MetaMask.

### Issue: RPC connection failed

```
Error: could not detect network
```

**Solution**: Check your RPC URL in `.env` file and ensure the endpoint is accessible.

### Issue: Contract size exceeds limit

```
Error: contract size exceeds 24KB
```

**Solution**: Enable optimizer in `hardhat.config.ts` with higher runs:

```typescript
solidity: {
  version: "0.8.28",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
}
```

## Gas Optimization Tips

1. Use `production` solidity profile for mainnet deployments
2. Adjust optimizer runs based on usage frequency
3. Test gas costs on testnet first
4. Consider EIP-1559 transaction parameters

## Security Considerations

1. **Private Key Management**: Never expose private keys in code or version control
2. **Contract Verification**: Always verify contracts on block explorers
3. **Testing**: Run comprehensive tests before mainnet deployment
4. **Access Control**: Verify that the correct address is the contract owner
5. **Audit**: Consider a security audit for mainnet deployments

## Support

For issues or questions:
- Check Hardhat documentation: https://hardhat.org
- Review test files for usage examples
- Check contract events and logs for debugging

---

**Last Updated**: January 2025
