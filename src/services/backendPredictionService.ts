/**
 * Backend Prediction Service
 *
 * This service handles blockchain prediction market interactions from the server-side.
 * Unlike the frontend predictionService, this uses a private key for signing.
 * Used for opening prediction pools and settling predictions.
 */

import { ethers } from 'ethers'

// Prediction Market Contract ABI
const PREDICTION_CONTRACT_ABI = [
  'function openPredictionPool(bytes32 gameId, address[] calldata gamePlayers) external',
  'function makePrediction(bytes32 gameId, address predictedPlayer) external payable',
  'function settlePredictions(bytes32 gameId, address actualWinner) external',
  'function claimPredictionReward(bytes32 gameId, uint256 predictionIndex) external',
  'function pools(bytes32) external view returns (bytes32 gameId, address winnerPlayer, uint256 totalPool, uint256 totalCorrectPredictors, bool settled)',
  'function predictions(bytes32, uint256) external view returns (address predictor, address predictedPlayer, uint256 amount, bool isCorrect, bool claimed, uint256 payout)',
  'event PredictionPoolOpened(bytes32 indexed gameId, uint256 timestamp)',
  'event PredictionMade(bytes32 indexed gameId, address predictor, address predictedPlayer)',
  'event PredictionPoolSettled(bytes32 indexed gameId, address winner, uint256 totalPool)',
  'event PredictionClaimed(bytes32 indexed gameId, address predictor, uint256 payout)'
]

// Contract configuration
const PREDICTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_CONTRACT_ADDRESS || '0xf9998a6092456a8e16c8dbc2034598fd68545935'
const MONAD_RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.ankr.com/monad_testnet'

export interface PredictionPool {
  gameId: string
  winnerPlayer: string
  totalPool: bigint
  totalCorrectPredictors: bigint
  settled: boolean
}

class BackendPredictionService {
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
    this.contract = new ethers.Contract(
      PREDICTION_CONTRACT_ADDRESS,
      PREDICTION_CONTRACT_ABI,
      this.wallet
    )

    console.log('🔐 Backend prediction service initialized')
    console.log('📝 Admin address:', this.wallet.address)
  }

  /**
   * Check if contract is initialized
   */
  private ensureInitialized(): void {
    if (!this.contract || !this.wallet) {
      throw new Error('Backend prediction service not initialized. Call initialize() first.')
    }
  }

  /**
   * Generate game ID from room code
   */
  private generateGameId(roomCode: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(roomCode))
  }

  /**
   * Open prediction pool on blockchain (SERVER-SIDE)
   * This is called from backend after question 5
   */
  async openPredictionPool(
    roomCode: string,
    playerAddresses: string[]
  ): Promise<{ gameId: string; txHash: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)

    console.log('🎯 Opening prediction pool on blockchain (backend):', {
      gameId,
      roomCode,
      playerCount: playerAddresses.length,
      players: playerAddresses
    })

    try {
      const tx = await this.contract!.openPredictionPool(gameId, playerAddresses)
      console.log('⏳ Transaction sent:', tx.hash)

      const receipt = await tx.wait()
      console.log('✅ Prediction pool opened on blockchain:', receipt.hash)

      return {
        gameId,
        txHash: receipt.hash
      }
    } catch (error: any) {
      console.error('❌ openPredictionPool transaction failed:', error)
      throw new Error(`Failed to open prediction pool on blockchain: ${error.message}`)
    }
  }

  /**
   * Settle predictions on blockchain (SERVER-SIDE)
   * This is called from backend when game finishes
   */
  async settlePredictions(
    roomCode: string,
    winnerAddress: string
  ): Promise<{ txHash: string; gasUsed: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)

    console.log('🎯 Settling predictions on blockchain (backend):', {
      gameId,
      roomCode,
      winnerAddress
    })

    try {
      const tx = await this.contract!.settlePredictions(gameId, winnerAddress)
      console.log('⏳ Transaction sent:', tx.hash)

      const receipt = await tx.wait()
      console.log('✅ Predictions settled on blockchain:', receipt.hash)

      return {
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      }
    } catch (error: any) {
      console.error('❌ settlePredictions transaction failed:', error)
      throw new Error(`Failed to settle predictions on blockchain: ${error.message}`)
    }
  }

  /**
   * Get prediction pool details from blockchain
   */
  async getPredictionPool(roomCode: string): Promise<PredictionPool> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)
    const pool = await this.contract!.pools(gameId)

    return {
      gameId: pool[0],
      winnerPlayer: pool[1],
      totalPool: pool[2],
      totalCorrectPredictors: pool[3],
      settled: pool[4]
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
export const backendPredictionService = new BackendPredictionService()
