export interface Game {
  id: number
  mode: string
  room_code: string | null
  status: string
  entry_fee: number | null
  pool_amount: number | null
  player_count: number | null
  host_user_id: number | null
  host_funded: boolean
  host_funded_tx_hash: string | null
  winner_user_id?: number | null
  created_at: string
  started_at: string | null
  finished_at: string | null
  hostUser?: any
  winnerUser?: any
  gamePlayers?: GamePlayer[]
}

export interface GamePlayer {
  id: number
  game_id: number | null
  user_id: number | null
  status: string | null
  funded: boolean
  funded_tx_hash: string | null
  join_time: string
  user?: any
}

class GameService {
  private baseUrl = '/api/game'

  /**
   * Create a new game room
   */
  async createRoom(hostUserId: number, mode?: string, entryFee?: number): Promise<Game> {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host_user_id: hostUserId,
        mode: mode || 'battle_royale',
        entry_fee: entryFee || null,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create room')
    }

    return data.game
  }

  /**
   * Join an existing game room
   */
  async joinRoom(roomCode: string, userId: number): Promise<{ game: Game; player: GamePlayer }> {
    const response = await fetch(`${this.baseUrl}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_code: roomCode.toUpperCase(),
        user_id: userId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to join room')
    }

    return data
  }

  /**
   * Get game room details
   */
  async getRoom(roomCode: string): Promise<Game> {
    const response = await fetch(`${this.baseUrl}/${roomCode.toUpperCase()}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch room')
    }

    return data.game
  }

  /**
   * Leave game room
   */
  async leaveRoom(roomCode: string, userId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/${roomCode.toUpperCase()}?user_id=${userId}`,
      {
        method: 'DELETE',
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to leave room')
    }
  }

  /**
   * Fund the pool
   */
  async fundPool(roomCode: string, userId: number, txHash: string): Promise<{ allFunded: boolean }> {
    const response = await fetch(`${this.baseUrl}/fund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_code: roomCode.toUpperCase(),
        user_id: userId,
        tx_hash: txHash,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fund pool')
    }

    return data
  }

  /**
   * Start the game
   */
  async startGame(roomCode: string, hostUserId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_code: roomCode.toUpperCase(),
        host_user_id: hostUserId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to start game')
    }
  }

  /**
   * Lock room and prepare for funding
   */
  async lockRoom(roomCode: string, hostUserId: number, blockchainTxHash?: string): Promise<{ player_count: number }> {
    const response = await fetch(`${this.baseUrl}/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_code: roomCode.toUpperCase(),
        host_user_id: hostUserId,
        blockchain_tx_hash: blockchainTxHash,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to lock room')
    }

    return data
  }

  /**
   * Create a new round
   */
  async createRound(roomCode: string, roundNumber: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/round`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_code: roomCode.toUpperCase(),
        round_number: roundNumber,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create round')
    }

    return data.round
  }

  /**
   * Get current round
   */
  async getCurrentRound(roomCode: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/round?room_code=${roomCode.toUpperCase()}`
    )
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get round')
    }

    return data.round
  }

  /**
   * Submit answer
   */
  async submitAnswer(
    roomCode: string,
    userId: number,
    roundId: number,
    selectedOption: string,
    answerTimeMs: number
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_code: roomCode.toUpperCase(),
        user_id: userId,
        round_id: roundId,
        selected_option: selectedOption,
        answer_time_ms: answerTimeMs,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit answer')
    }

    return data
  }

  /**
   * Finish game
   */
  async finishGame(roomCode: string, hostUserId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_code: roomCode.toUpperCase(),
        host_user_id: hostUserId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to finish game')
    }

    return data
  }

  /**
   * Report tab switch (anti-cheat)
   */
  async reportTabSwitch(roomCode: string, userId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/disqualify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_code: roomCode.toUpperCase(),
        user_id: userId,
        reason: 'tab_switch',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to report tab switch')
    }

    return data
  }
}

export const gameService = new GameService()
