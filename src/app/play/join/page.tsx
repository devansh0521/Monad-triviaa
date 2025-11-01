'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DoorOpen, ArrowLeft, Loader2 } from 'lucide-react'
import { gameService } from '@/services/gameService'
import { contractService } from '@/services/contractService'
import { useWallet } from '@/hooks/useWallet'

export default function JoinRoomPage() {
  const router = useRouter()
  const { address, isConnected, connectWallet } = useWallet()
  const [user, setUser] = useState<any>(null)
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'joining' | 'contract' | 'done'>('joining')

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

  const handleRoomCodeChange = (value: string) => {
    // Only allow uppercase letters and numbers, max 6 characters
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setRoomCode(cleaned)
    setError(null)
  }

  const handleJoinRoom = async () => {
    if (!user) {
      setError('Please create a profile first')
      return
    }

    if (roomCode.length !== 6) {
      setError('Please enter a valid 6-character room code')
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

    setIsJoining(true)
    setError(null)

    try {
      // Step 1: Join room in database
      setStep('joining')
      const { game } = await gameService.joinRoom(roomCode, user.id)

      console.log('Joined room in database:', game.room_code)

      // Step 2: Join game on blockchain
      setStep('contract')
      try {
        await contractService.initialize()

        const { txHash } = await contractService.joinGame(game.room_code!)

        console.log('Joined game on blockchain:', {
          txHash,
          roomCode: game.room_code
        })

        setStep('done')

        // Redirect to lobby
        router.push(`/play/lobby/${game.room_code}`)
      } catch (contractErr: any) {
        console.error('Contract error:', contractErr)
        // Still redirect to lobby even if contract fails
        setError('Joined room but blockchain transaction failed.')
        setTimeout(() => {
          router.push(`/play/lobby/${game.room_code}`)
        }, 2000)
      }
    } catch (err: any) {
      console.error('Join room error:', err)
      setError(err.message || 'Failed to join room')
      setIsJoining(false)
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary mb-4">
            <DoorOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Join Game Room</h1>
          <p className="text-muted-foreground">
            Enter the room code to join your friends
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        {/* Join Form */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Player Info */}
          <div>
            <label className="block text-sm font-medium mb-2">Joining as</label>
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

          {/* Room Code Input */}
          <div>
            <label className="block text-sm font-medium mb-3">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => handleRoomCodeChange(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-6 py-4 text-center text-3xl font-bold tracking-widest rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors uppercase"
              maxLength={6}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {roomCode.length}/6 characters
            </p>
          </div>

          {/* Info */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h3 className="font-semibold mb-2 text-sm">How to Join</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Get the room code from your friend</li>
              <li>• Enter the 6-character code above</li>
              <li>• Click "Join Room" to enter the lobby</li>
              <li>• Wait for the host to start the game</li>
            </ul>
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoinRoom}
            disabled={isJoining || roomCode.length !== 6}
            className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
            size="lg"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {step === 'joining' && 'Joining Room...'}
                {step === 'contract' && 'Connecting to Blockchain...'}
                {step === 'done' && 'Done!'}
              </>
            ) : (
              <>
                <DoorOpen className="w-5 h-5 mr-2" />
                Join Room
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
