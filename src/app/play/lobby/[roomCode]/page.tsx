'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, Copy, Check, Crown, Loader2, LogOut, Play, RefreshCw, Wallet, CheckCircle, AlertCircle } from 'lucide-react'
import { gameService, Game } from '@/services/gameService'
import { contractService } from '@/services/contractService'

export default function LobbyPage() {
  const router = useRouter()
  const params = useParams()
  const roomCode = params.roomCode as string

  const [user, setUser] = useState<any>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [blockchainPlayerCount, setBlockchainPlayerCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isFunding, setIsFunding] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('monad_trivia_user')
    if (!storedUser) {
      router.push('/profile/create')
      return
    }
    setUser(JSON.parse(storedUser))
  }, [router])

  // Fetch game data and blockchain info
  const fetchGame = useCallback(async () => {
    if (!roomCode) return

    try {
      const gameData = await gameService.getRoom(roomCode)
      setGame(gameData)
      setError(null)

      // Fetch blockchain player count
      try {
        await contractService.initialize()
        const blockchainGame = await contractService.getGame(roomCode)
        setBlockchainPlayerCount(Number(blockchainGame.playerCount))
      } catch (err) {
        console.log('Could not fetch blockchain data:', err)
      }
    } catch (err: any) {
      console.error('Fetch game error:', err)
      setError(err.message || 'Failed to load game room')
    } finally {
      setIsLoading(false)
    }
  }, [roomCode])

  // Initial load
  useEffect(() => {
    if (user) {
      fetchGame()
    }
  }, [user, fetchGame])

  // Auto-refresh every 3 seconds
  useEffect(() => {
    if (!user || !game) return

    const interval = setInterval(() => {
      fetchGame()
    }, 3000)

    return () => clearInterval(interval)
  }, [user, game, fetchGame])

  // Auto-redirect when game starts
  useEffect(() => {
    if (game && game.status === 'active') {
      console.log('Game is active, redirecting to game page...')
      router.push(`/play/game/${game.room_code}`)
    }
  }, [game?.status, game?.room_code, router])

  const handleCopyCode = () => {
    if (!game?.room_code) return
    navigator.clipboard.writeText(game.room_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeaveRoom = async () => {
    if (!user || !game?.room_code) return

    setIsLeaving(true)
    try {
      await gameService.leaveRoom(game.room_code, user.id)
      router.push('/play')
    } catch (err: any) {
      console.error('Leave room error:', err)
      setError(err.message || 'Failed to leave room')
    } finally {
      setIsLeaving(false)
    }
  }

  const handleFundPool = async () => {
    if (!user || !game?.room_code || !game.entry_fee) return

    setIsFunding(true)
    try {
      // Initialize contract service
      await contractService.initialize()

      // Fund pool on blockchain
      const { txHash } = await contractService.fundPool(
        game.room_code,
        game.entry_fee.toString()
      )

      // Record funding in backend
      await gameService.fundPool(game.room_code, user.id, txHash)

      // Refresh game data
      await fetchGame()
    } catch (err: any) {
      console.error('Fund pool error:', err)
      alert(err.message || 'Failed to fund pool. Make sure all players have joined.')
    } finally {
      setIsFunding(false)
    }
  }

  const handleStartGame = async () => {
    if (!user || !game?.room_code) return

    setIsStarting(true)
    try {
      // Initialize contract service
      await contractService.initialize()

      // Start game on blockchain
      await contractService.startGame(game.room_code)

      // Update backend
      await gameService.startGame(game.room_code, user.id)

      // Redirect to game page
      router.push(`/play/game/${game.room_code}`)
    } catch (err: any) {
      console.error('Start game error:', err)
      alert(err.message || 'Failed to start game')
    } finally {
      setIsStarting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Room Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/play')}>Back to Play</Button>
        </div>
      </div>
    )
  }

  if (!game) return null

  const players = game.gamePlayers || []
  const totalPlayers = players.length + 1 // +1 for host
  const isHost = user && game && game.host_user_id === user.id
  const targetPlayerCount = blockchainPlayerCount || 2
  const isRoomFull = totalPlayers >= targetPlayerCount

  // Check funding status
  const currentUserPlayer = players.find(p => p.user_id === user?.id)
  const currentUserFunded = isHost ? game.host_funded : (currentUserPlayer?.funded || false)
  const hostFunded = game.host_funded
  const allPlayersFunded = players.every(p => p.funded)
  const allFunded = hostFunded && allPlayersFunded && isRoomFull

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Game Lobby</h1>
          <p className="text-muted-foreground">
            {!isRoomFull && `Waiting for players... (${totalPlayers}/${targetPlayerCount})`}
            {isRoomFull && !allFunded && 'Room full! Players funding pool...'}
            {allFunded && 'All players funded! Ready to start!'}
          </p>
        </div>

        {/* Room Status Alert */}
        {!isRoomFull && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-500">
                Waiting for Players ({totalPlayers}/{targetPlayerCount})
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Share the room code. Funding will begin once all {targetPlayerCount} players join.
              </p>
            </div>
          </div>
        )}

        {isRoomFull && !allFunded && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Wallet className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-500">
                Room Full! Fund the Pool
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Entry Fee: {game.entry_fee} MON per player • All players must fund to start
              </p>
            </div>
          </div>
        )}

        {allFunded && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-500">
                Pool Fully Funded!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total Pool: {game.pool_amount} MON • Host can start the game
              </p>
            </div>
          </div>
        )}

        {/* Room Code Card */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 rounded-lg p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Room Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-bold tracking-widest">
                {game.room_code}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="ml-2"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share this code with your friends
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Players List */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players ({totalPlayers}/{targetPlayerCount})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchGame}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>

              <div className="space-y-3">
                {/* Host */}
                {game.hostUser && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    {game.hostUser.avatar?.image_url && (
                      <img
                        src={game.hostUser.avatar.image_url}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{game.hostUser.username || 'Host'}</p>
                        <Crown className="w-4 h-4 text-yellow-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">Host</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {game.hostUser.premium && (
                        <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent font-semibold">
                          PRO
                        </span>
                      )}
                      {hostFunded && (
                        <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Funded
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Other Players */}
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    {player.user?.avatar?.image_url && (
                      <img
                        src={player.user.avatar.image_url}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{player.user?.username || 'Player'}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(player.join_time).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.user?.premium && (
                        <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent font-semibold">
                          PRO
                        </span>
                      )}
                      {player.funded && (
                        <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Funded
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {players.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No other players have joined yet</p>
                    <p className="text-sm mt-1">Share the room code to invite friends</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game Info & Actions */}
          <div className="space-y-4">
            {/* Game Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Game Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="font-medium capitalize">
                    {game.mode.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">
                    {!isRoomFull ? 'Waiting' : allFunded ? 'Ready' : 'Funding'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Fee:</span>
                  <span className="font-medium">{game.entry_fee || 0} MON</span>
                </div>
                {game.pool_amount && game.pool_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pool:</span>
                    <span className="font-medium">{game.pool_amount} MON</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              {/* Waiting for Players */}
              {!isRoomFull && (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Waiting for {targetPlayerCount - totalPlayers} more player(s)...
                  </p>
                </div>
              )}

              {/* Fund Pool Button */}
              {isRoomFull && !currentUserFunded && (
                <Button
                  onClick={handleFundPool}
                  disabled={isFunding}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90"
                  size="lg"
                >
                  {isFunding ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Funding...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 mr-2" />
                      Fund Pool ({game.entry_fee} MON)
                    </>
                  )}
                </Button>
              )}

              {/* Already Funded Message */}
              {isRoomFull && currentUserFunded && !allFunded && (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-500">
                    You've funded the pool!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Waiting for other players...
                  </p>
                </div>
              )}

              {/* Start Game Button (Host Only) */}
              {isHost && allFunded && (
                <Button
                  onClick={handleStartGame}
                  disabled={isStarting}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Game
                    </>
                  )}
                </Button>
              )}

              {/* Waiting for Host (Non-Host) */}
              {!isHost && allFunded && (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Waiting for host to start...
                  </p>
                </div>
              )}

              {/* Leave Room Button */}
              <Button
                variant="outline"
                onClick={handleLeaveRoom}
                disabled={isLeaving || currentUserFunded}
                className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                {isLeaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    {currentUserFunded ? 'Cannot Leave (Funded)' : 'Leave Room'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
