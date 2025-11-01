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

class ContractService {
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
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer)
  }

  /**
   * Check if contract is initialized
   */
  private ensureInitialized(): void {
    if (!this.contract || !this.signer) {
      throw new Error('Contract service not initialized. Call initialize() first.')
    }
  }

  /**
   * Generate game ID from room code
   */
  private generateGameId(roomCode: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(roomCode))
  }

  /**
   * Create a new game on the blockchain
   */
  async createGame(
    roomCode: string,
    playerCount: number,
    entryAmount: string, // in ETH
    platformFee: string  // in ETH
  ): Promise<{ gameId: string; txHash: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)
    const entryAmountWei = ethers.parseEther(entryAmount)
    const platformFeeWei = ethers.parseEther(platformFee)

    console.log('Creating game on blockchain:', {
      gameId,
      roomCode,
      playerCount,
      entryAmount,
      platformFee
    })

    const tx = await this.contract!.createGame(
      gameId,
      playerCount,
      entryAmountWei,
      platformFeeWei
    )

    const receipt = await tx.wait()

    return {
      gameId,
      txHash: receipt.hash
    }
  }

  /**
   * Join an existing game on the blockchain
   */
  async joinGame(roomCode: string): Promise<{ txHash: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)

    console.log('Joining game on blockchain:', {
      gameId,
      roomCode
    })

    const tx = await this.contract!.joinGame(gameId)
    const receipt = await tx.wait()

    return {
      txHash: receipt.hash
    }
  }

  /**
   * Fund the pool for a game
   */
  async fundPool(roomCode: string, entryAmount: string): Promise<{ txHash: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)
    const entryAmountWei = ethers.parseEther(entryAmount)

    console.log('Funding pool on blockchain:', {
      gameId,
      roomCode,
      entryAmount
    })

    const tx = await this.contract!.fundPool(gameId, {
      value: entryAmountWei
    })

    const receipt = await tx.wait()

    return {
      txHash: receipt.hash
    }
  }

  /**
   * Start a game (host only)
   */
  async startGame(roomCode: string): Promise<{ txHash: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)

    console.log('Starting game on blockchain:', {
      gameId,
      roomCode
    })

    const tx = await this.contract!.startGame(gameId)
    const receipt = await tx.wait()

    return {
      txHash: receipt.hash
    }
  }

  /**
   * Set winner and distribute prizes
   */
  async setWinner(roomCode: string, winnerAddress: string): Promise<{ txHash: string }> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)

    console.log('Setting winner on blockchain:', {
      gameId,
      roomCode,
      winnerAddress
    })

    const tx = await this.contract!.setWinner(gameId, winnerAddress)
    const receipt = await tx.wait()

    return {
      txHash: receipt.hash
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
   * Get players in a game
   */
  async getGamePlayers(roomCode: string): Promise<string[]> {
    this.ensureInitialized()

    const gameId = this.generateGameId(roomCode)
    const players = await this.contract!.getGamePlayers(gameId)

    return players
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
}

export const contractService = new ContractService()
