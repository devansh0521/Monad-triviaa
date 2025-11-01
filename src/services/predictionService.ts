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
const PREDICTION_AMOUNT = '1.0' // 1 MONAD

export interface PredictionPool {
  gameId: string
  winnerPlayer: string
  totalPool: bigint
  totalCorrectPredictors: bigint
  settled: boolean
}

export interface Prediction {
  predictor: string
  predictedPlayer: string
  amount: bigint
  isCorrect: boolean
  claimed: boolean
  payout: bigint
}

class PredictionService {
  private contract: ethers.Contract | null = null
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  /**
   * Initialize connection to wallet and contract
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    // Create provider
    this.provider = new ethers.BrowserProvider(window.ethereum)

    // Get signer
    this.signer = await this.provider.getSigner()

    // Create contract instance
    this.contract = new ethers.Contract(
      PREDICTION_CONTRACT_ADDRESS,
      PREDICTION_CONTRACT_ABI,
      this.signer
    )
  }

  /**
   * Check if contract is initialized
   */
  private ensureInitialized(): void {
    if (!this.contract || !this.signer) {
      throw new Error('Prediction service not initialized. Call initialize() first.')
    }
  }

  /**
   * Generate game ID from room code
   */
  private generateGameId(roomCode: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(roomCode))
  }

  /**
   * Open prediction pool (called after question 5)
   */
  async openPredictionPool(
    roomCode: string,
    playerAddresses: string[]
  ): Promise<{ gameId: string; txHash: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)

    console.log('Opening prediction pool on blockchain:', {
      gameId,
      roomCode,
      playerAddresses
    })

    const tx = await this.contract!.openPredictionPool(gameId, playerAddresses)
    const receipt = await tx.wait()

    return {
      gameId,
      txHash: receipt.hash
    }
  }

  /**
   * Make a prediction (bet 1 MONAD on a player)
   */
  async makePrediction(
    roomCode: string,
    predictedPlayerAddress: string
  ): Promise<{ txHash: string; amount: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)
    const predictionAmountWei = ethers.parseEther(PREDICTION_AMOUNT)

    console.log('Making prediction on blockchain:', {
      gameId,
      roomCode,
      predictedPlayerAddress,
      amount: PREDICTION_AMOUNT
    })

    const tx = await this.contract!.makePrediction(gameId, predictedPlayerAddress, {
      value: predictionAmountWei
    })

    const receipt = await tx.wait()

    return {
      txHash: receipt.hash,
      amount: PREDICTION_AMOUNT
    }
  }

  /**
   * Settle predictions (called after game ends)
   */
  async settlePredictions(
    roomCode: string,
    winnerAddress: string
  ): Promise<{ txHash: string; gasUsed: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)

    console.log('Settling predictions on blockchain:', {
      gameId,
      roomCode,
      winnerAddress
    })

    const tx = await this.contract!.settlePredictions(gameId, winnerAddress)
    const receipt = await tx.wait()

    return {
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString()
    }
  }

  /**
   * Claim prediction reward
   */
  async claimPredictionReward(
    roomCode: string,
    predictionIndex: number
  ): Promise<{ txHash: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)

    console.log('Claiming prediction reward on blockchain:', {
      gameId,
      roomCode,
      predictionIndex
    })

    const tx = await this.contract!.claimPredictionReward(gameId, predictionIndex)
    const receipt = await tx.wait()

    return {
      txHash: receipt.hash
    }
  }

  /**
   * Get prediction pool details
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
   * Get prediction details
   */
  async getPrediction(roomCode: string, predictionIndex: number): Promise<Prediction> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)
    const prediction = await this.contract!.predictions(gameId, predictionIndex)

    return {
      predictor: prediction[0],
      predictedPlayer: prediction[1],
      amount: prediction[2],
      isCorrect: prediction[3],
      claimed: prediction[4],
      payout: prediction[5]
    }
  }

  /**
   * Get current wallet address
   */
  async getWalletAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized')
    }
    return await this.signer.getAddress()
  }

  /**
   * Get prediction amount constant
   */
  getPredictionAmount(): string {
    return PREDICTION_AMOUNT
  }
}

export const predictionService = new PredictionService()
