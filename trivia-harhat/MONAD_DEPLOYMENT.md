# Deploying to Monad Testnet

Complete guide for deploying MonadTriviaFlexiblePool contract to Monad Testnet.

## 🌐 Monad Testnet Information

- **Network Name:** Monad Testnet
- **Chain ID:** 10143
- **RPC URL:** https://testnet-rpc.monad.xyz
- **Currency:** MON
- **Block Explorer:** https://testnet.monadexplorer.com/
- **Performance:** ~1 second block times, up to 10,000 TPS

## 📋 Prerequisites

### 1. Get Monad Testnet MON Tokens

You'll need MON tokens to pay for gas fees. Here are the ways to get testnet MON:

**Option A: Monad Faucet**
- Visit the official Monad faucet (check Monad Discord or docs for current faucet URL)
- Connect your wallet
- Request testnet MON tokens

**Option B: Community Faucets**
- Check the Monad Discord server for community faucets
- Visit https://faucet.monad.xyz (if available)

**Recommended Amount:** Request at least 0.1 MON for deployment and testing

### 2. Setup Environment Variables

Create a `.env` file in the `trivia-harhat` directory:

```bash
# Monad Testnet Configuration
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_TESTNET_PRIVATE_KEY=your_private_key_here

# Optional: For contract verification (if supported)
MONAD_EXPLORER_API_KEY=your_api_key_here
```

**⚠️ Security Warning:**
- Never commit your `.env` file to git
- Never share your private key
- Use a test wallet for testnet deployments

### 3. Add Monad Testnet to MetaMask

**Method 1: Via ChainList**
1. Visit https://chainlist.org/chain/10143
2. Click "Connect Wallet"
3. Click "Add to MetaMask"

**Method 2: Manual Configuration**
1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Enter the following details:
   - Network Name: `Monad Testnet`
   - RPC URL: `https://testnet-rpc.monad.xyz`
   - Chain ID: `10143`
   - Currency Symbol: `MON`
   - Block Explorer: `https://testnet.monadexplorer.com/`
4. Click "Save"

## 🚀 Deployment Steps

### Step 1: Verify Configuration

Check that your Hardhat config is set up correctly:

```bash
# View available networks
npx hardhat help

# The output should include 'monadTestnet' in the networks list
```

### Step 2: Compile Contract

```bash
# Clean previous builds
npx hardhat clean

# Compile with production settings
npx hardhat compile
```

### Step 3: Run Tests (Optional but Recommended)

```bash
# Run all tests
npx hardhat test

# This ensures your contract works correctly before deploying
```

### Step 4: Deploy to Monad Testnet

**Option A: Using Hardhat Ignition (Recommended)**

```bash
npx hardhat ignition deploy ignition/modules/MonadTriviaFlexiblePool.ts --network monadTestnet
```

**Option B: Using Traditional Deployment Script**

```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

### Step 5: Save Deployment Information

After deployment, save the contract address:

```bash
# Save deployment info
CONTRACT_ADDRESS=0xYourContractAddress \
NETWORK=monadTestnet \
npx hardhat run scripts/save-deployment.ts
```

## 📊 Expected Deployment Output

```
🚀 Starting MonadTriviaFlexiblePool deployment...

📝 Deployer address: 0x...
💰 Deployer balance: 0.5 MON

🌐 Network Chain ID: 10143
🌐 Network name: Monad Testnet

⏳ Deploying MonadTriviaFlexiblePool contract...
✅ Contract deployed successfully!
⏱️  Deployment time: ~1000ms

📋 Deployment Details:
   Contract Address: 0x...
   Contract Owner: 0x...
   Deployer matches Owner: true
   Bytecode Size: 7811 bytes
   Max Size (24KB): ✅ Within limit

✨ Deployment complete!
```

## 🔍 Verify Contract on Monad Explorer

After deployment, verify your contract on the Monad block explorer:

1. Visit https://testnet.monadexplorer.com/
2. Search for your contract address
3. Navigate to the "Contract" tab
4. Follow verification instructions (if supported)

Alternatively, if Monad supports Hardhat verification:

```bash
npx hardhat verify --network monadTestnet YOUR_CONTRACT_ADDRESS
```

## 🎮 Interact with Deployed Contract

### Quick Test

```bash
# Set contract address
export CONTRACT_ADDRESS=0xYourContractAddress

# Run interaction script
npx hardhat run scripts/interact.ts --network monadTestnet
```

### Manual Interaction via Console

```bash
# Open Hardhat console
npx hardhat console --network monadTestnet

# In the console:
const { viem } = await network.connect();
const contract = await viem.getContractAt(
  "MonadTriviaFlexiblePool",
  "0xYourContractAddress"
);

// Check owner
const owner = await contract.read.owner();
console.log("Owner:", owner);

// Create a game
const { keccak256, toBytes, parseEther } = require("viem");
const gameId = keccak256(toBytes("test-game"));
await contract.write.createGame([gameId, 2n, parseEther("0.01"), parseEther("0.001")]);
```

## 💡 Performance Expectations

Monad Testnet offers exceptional performance:

- **Block Time:** ~1 second
- **Finality:** Very fast compared to Ethereum
- **Gas Costs:** Lower than Ethereum
- **Throughput:** Up to 10,000 TPS

This makes it ideal for testing high-frequency trivia games and rapid game cycles!

## 🛠️ Troubleshooting

### Issue: "Insufficient funds for gas"

```
Error: insufficient funds for gas * price + value
```

**Solution:**
- Get more MON from the faucet
- Check your wallet balance: `npx hardhat console --network monadTestnet` then `await publicClient.getBalance({address: "0x..."})`

### Issue: "Network connection failed"

```
Error: could not detect network
```

**Solutions:**
1. Check RPC URL is correct: `https://testnet-rpc.monad.xyz`
2. Verify your internet connection
3. Try alternative RPC (check Monad docs for backup RPCs)
4. Check if Monad testnet is experiencing downtime

### Issue: "Nonce too high"

```
Error: nonce has already been used
```

**Solution:**
- Wait a few seconds and retry
- Reset MetaMask account (Settings → Advanced → Clear activity data)

### Issue: Transaction taking too long

**Solution:**
- Monad has fast block times (~1s), but occasionally:
  - Network might be congested
  - Increase gas price in the transaction
  - Wait 10-30 seconds and check block explorer

### Issue: Contract verification not working

**Solution:**
- Monad testnet may have limited verification support
- Manually verify by uploading source code
- Check Monad Discord for latest verification tools

## 📝 Example .env File

```env
# Monad Testnet
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_TESTNET_PRIVATE_KEY=0x1234567890abcdef...  # Your test wallet private key

# Optional: Alternative RPC (check Monad docs)
# MONAD_TESTNET_RPC_URL=https://alternative-rpc.monad.xyz

# Optional: For contract verification
MONAD_EXPLORER_API_KEY=your_api_key

# Keep your Sepolia config if you have it
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here
```

## 🎯 Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract address saved
- [ ] Contract verified on explorer (if supported)
- [ ] Deployment info documented
- [ ] Test transaction executed successfully
- [ ] Contract ownership verified
- [ ] Gas costs documented for future reference
- [ ] Frontend/backend updated with contract address

## 🔗 Useful Resources

- **Monad Documentation:** https://docs.monad.xyz
- **Monad Discord:** Join for support and faucet access
- **Block Explorer:** https://testnet.monadexplorer.com/
- **ChainList:** https://chainlist.org/chain/10143
- **Monad GitHub:** Check for developer tools and examples

## 🚨 Important Notes

1. **Testnet Tokens:** Testnet MON has no value, use freely for testing
2. **Network Changes:** Monad testnet may be reset or updated, check announcements
3. **Performance:** Take advantage of Monad's high TPS for stress testing
4. **Mainnet:** When deploying to mainnet, review all security considerations

## 🎉 Success!

Once deployed, your MonadTriviaFlexiblePool contract will be running on one of the fastest EVM-compatible networks available! The high throughput and low latency make it perfect for your trivia game application.

**Next Steps:**
1. Test the full game flow (create, join, fund, start, finish)
2. Monitor gas costs and performance
3. Integrate with your frontend
4. Consider deploying additional game-related contracts

---

**Need Help?**
- Check the Monad Discord community
- Review the main DEPLOYMENT.md guide
- Test on local Hardhat network first

**Last Updated:** January 2025
