'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, ArrowLeft, Loader2 } from 'lucide-react'
import { gameService } from '@/services/gameService'
import { contractService } from '@/services/contractService'
import { useWallet } from '@/hooks/useWallet'

export default function CreateRoomPage() {
  const router = useRouter()
  const { address, isConnected, connectWallet } = useWallet()
  const [user, setUser] = useState<any>(null)
  const [mode, setMode] = useState('battle_royale')
  const [playerCount, setPlayerCount] = useState(2) // Default 2 players
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'creating' | 'contract' | 'done'>('creating')

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('monad_trivia_user')
    if (!storedUser) {
      // Redirect to create profile if no user
      router.push('/profile/create')
      return
    }
    setUser(JSON.parse(storedUser))
  }, [router])

  const handleCreateRoom = async () => {
    if (!user) {
      setError('Please create a profile first')
      return
    }

    // Check if wallet is connected
    if (!isConnected) {
      setError('Please connect your wallet first')
      try {
        await connectWallet()
      } catch (err: any) {
        console.error('Wallet connection error:', err)
        setError(err.message || 'Failed to connect wallet')
        return
      }
    }

    setIsCreating(true)
    setError(null)

    try {
      // Step 1: Create room in database
      setStep('creating')
      const game = await gameService.createRoom(user.id, mode, 1) // entry fee: 1 MON

      console.log('Room created in database:', game.room_code)

      // Step 2: Create game on blockchain
      setStep('contract')
      try {
        await contractService.initialize()

        const { gameId, txHash } = await contractService.createGame(
          game.room_code!,
          playerCount, // Use selected player count
          '1', // entry amount: 1 MON per player
          '0.1' // platform fee: 0.1 MON (5% of 2-player pool)
        )

        console.log('Game created on blockchain:', {
          gameId,
          txHash,
          roomCode: game.room_code,
          playerCount
        })

        setStep('done')

        // Redirect to lobby
        router.push(`/play/lobby/${game.room_code}`)
      } catch (contractErr: any) {
        console.error('Contract error:', contractErr)
        // Still redirect to lobby even if contract fails
        setError('Room created but blockchain transaction failed.')
        setTimeout(() => {
          router.push(`/play/lobby/${game.room_code}`)
        }, 2000)
      }
    } catch (err: any) {
      console.error('Create room error:', err)
      setError(err.message || 'Failed to create room')
      setIsCreating(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/play')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Game Room</h1>
          <p className="text-muted-foreground">
            Set up your game and invite friends
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        {/* Room Settings */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Host Info */}
          <div>
            <label className="block text-sm font-medium mb-2">Host</label>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              {user.avatar?.image_url && (
                <img
                  src={user.avatar.image_url}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{user.username || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground">
                  {user.wallet_address?.slice(0, 6)}...{user.wallet_address?.slice(-4)}
                </p>
              </div>
            </div>
          </div>

          {/* Player Count Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Number of Players (including you)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  onClick={() => setPlayerCount(count)}
                  className={`p-3 rounded-lg border-2 transition-all text-center font-semibold ${
                    playerCount === count
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              The game will start once {playerCount} players join and fund the pool
            </p>
          </div>

          {/* Game Mode */}
          <div>
            <label className="block text-sm font-medium mb-3">Game Mode</label>
            <div className="space-y-2">
              <button
                onClick={() => setMode('battle_royale')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  mode === 'battle_royale'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium mb-1">Battle Royale</div>
                <p className="text-sm text-muted-foreground">
                  Last player standing wins! Answer wrong and you're out.
                </p>
              </button>

              <button
                onClick={() => setMode('quick_play')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  mode === 'quick_play'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium mb-1">Quick Play</div>
                <p className="text-sm text-muted-foreground">
                  Fast-paced game. Highest score wins in 10 questions!
                </p>
              </button>
            </div>
          </div>

          {/* Entry Fee Info */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h3 className="font-semibold mb-2 text-sm text-blue-500">Entry Fee</h3>
            <p className="text-sm text-muted-foreground">
              1 MON per player • Winner takes {(1 * playerCount - 0.1).toFixed(2)} MON
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Platform fee: 0.1 MON (5% of pool)
            </p>
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {step === 'creating' && 'Creating Room...'}
                {step === 'contract' && 'Connecting to Blockchain...'}
                {step === 'done' && 'Done!'}
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Create Room for {playerCount} Players
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
