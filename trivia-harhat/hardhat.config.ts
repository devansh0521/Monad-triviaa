import type { HardhatUserConfig } from "hardhat/config";
import { config as dotenvConfig } from "dotenv";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

// Load environment variables from .env file
dotenvConfig();

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    monadTestnet: {
      type: "http",
      chainType: "l1",
      url: process.env.MONAD_TESTNET_RPC_URL || "https://testnet-rpc.monad.xyz",
      accounts: process.env.MONAD_TESTNET_PRIVATE_KEY ? [process.env.MONAD_TESTNET_PRIVATE_KEY] : [],
      chainId: 10143,
    },
  },
};

export default config;
