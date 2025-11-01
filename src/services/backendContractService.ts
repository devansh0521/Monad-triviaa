/**
 * Backend Contract Service
 *
 * This service handles blockchain interactions from the server-side.
 * Unlike the frontend contractService, this uses a private key for signing.
 * Used for automated prize distribution and platform fee collection.
 */

import { ethers } from 'ethers'

// Contract ABI - essential functions only
const CONTRACT_ABI = [
  'function createGame(bytes32 gameId, uint256 playerCount, uint256 entryAmount, uint256 platformFee) external',
  'function joinGame(bytes32 gameId) external',
  'function fundPool(bytes32 gameId) external payable',
  'function startGame(bytes32 gameId) external',
  'function setWinner(bytes32 gameId, address winner) external',
  'function getGamePlayers(bytes32 gameId) external view returns (address[] memory)',
  'function games(bytes32) external view returns (address host, uint256 playerCount, uint256 entryAmount, uint256 platformFee, address winner, uint8 status, uint256 fundedCount)',
  'event GameCreated(bytes32 indexed gameId, address host, uint256 playerCount, uint256 entryAmount, uint256 platformFee)',
  'event PlayerJoined(bytes32 indexed gameId, address player)',
  'event PoolFunded(bytes32 indexed gameId, address by)',
  'event GameStarted(bytes32 indexed gameId)',
  'event WinnerPaid(bytes32 indexed gameId, address winner, uint256 prize, uint256 fee)'
]

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x8957d86B15D194D6eaA1eEe82735B68908c5c8A1'
const MONAD_RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.ankr.com/monad_testnet'

export enum GameStatus {
  Pending = 0,
  Funded = 1,
  Active = 2,
  Finished = 3
}

export interface ContractGame {
  host: string
  playerCount: bigint
  entryAmount: bigint
  platformFee: bigint
  winner: string
  status: GameStatus
  fundedCount: bigint
}

class BackendContractService {
  private contract: ethers.Contract | null = null
  private provider: ethers.JsonRpcProvider | null = null
  private wallet: ethers.Wallet | null = null

  /**
   * Initialize connection with private key
   */
  async initialize(): Promise<void> {
    // Check for admin private key in environment
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY

    if (!adminPrivateKey) {
      throw new Error('ADMIN_PRIVATE_KEY not set in environment variables')
    }

    // Create provider
    this.provider = new ethers.JsonRpcProvider(MONAD_RPC_URL)

    // Create wallet from private key
    this.wallet = new ethers.Wallet(adminPrivateKey, this.provider)

    // Create contract instance
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet)

    console.log('🔐 Backend contract service initialized')
    console.log('📝 Admin address:', this.wallet.address)
  }

  /**
   * Check if contract is initialized
   */
  private ensureInitialized(): void {
    if (!this.contract || !this.wallet) {
      throw new Error('Backend contract service not initialized. Call initialize() first.')
    }
  }

  /**
   * Generate game ID from room code
   */
  private generateGameId(roomCode: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(roomCode))
  }

  /**
   * Set winner and distribute prizes (SERVER-SIDE)
   * This is called from backend endpoints to ensure reliable prize distribution
   */
  async setWinner(roomCode: string, winnerAddress: string): Promise<{ txHash: string; gasUsed: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)

    console.log('🎯 Setting winner on blockchain (backend):', {
      gameId,
      roomCode,
      winnerAddress
    })

    try {
      const tx = await this.contract!.setWinner(gameId, winnerAddress)
      console.log('⏳ Transaction sent:', tx.hash)

      const receipt = await tx.wait()
      console.log('✅ Transaction confirmed:', receipt.hash)

      return {
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      }
    } catch (error: any) {
      console.error('❌ setWinner transaction failed:', error)
      throw new Error(`Failed to set winner on blockchain: ${error.message}`)
    }
  }

  /**
   * Get game details from blockchain
   */
  async getGame(roomCode: string): Promise<ContractGame> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)
    const game = await this.contract!.games(gameId)

    return {
      host: game[0],
      playerCount: game[1],
      entryAmount: game[2],
      platformFee: game[3],
      winner: game[4],
      status: game[5],
      fundedCount: game[6]
    }
  }

  /**
   * Get admin wallet address
   */
  getAdminAddress(): string {
    if (!this.wallet) {
      throw new Error('Wallet not initialized')
    }
    return this.wallet.address
  }
}

// Export singleton instance
export const backendContractService = new BackendContractService()
