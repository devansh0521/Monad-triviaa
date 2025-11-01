'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, ArrowLeft, Loader2 } from 'lucide-react'
import { gameService } from '@/services/gameService'

export default function SpectateJoinPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleSpectateGame = async () => {
    if (!user) {
      setError('Please create a profile first')
      return
    }

    if (roomCode.length !== 6) {
      setError('Please enter a valid 6-character room code')
      return
    }

    setIsJoining(true)
    setError(null)

    try {
      // Check if game exists and is active
      const game = await gameService.getRoom(roomCode)

      if (!game) {
        throw new Error('Game not found')
      }

      if (game.status === 'finished') {
        setError('This game has already finished')
        setIsJoining(false)
        return
      }

      // Check if user is a player in this game
      const isPlayer = game.gamePlayers?.some((p: any) => p.user_id === user.id)
      if (isPlayer) {
        setError('You are a player in this game. Go to the game page instead.')
        setIsJoining(false)
        return
      }

      console.log('Spectating game:', game.room_code)

      // Redirect to spectate page
      router.push(`/spectate/${game.room_code}`)
    } catch (err: any) {
      console.error('Spectate game error:', err)
      setError(err.message || 'Failed to join game as spectator')
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 mb-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Spectate Game</h1>
          <p className="text-muted-foreground">
            Watch live gameplay and place predictions to win rewards
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        {/* Spectate Form */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Player Info */}
          <div>
            <label className="block text-sm font-medium mb-2">Spectating as</label>
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
              className="w-full px-6 py-4 text-center text-3xl font-bold tracking-widest rounded-lg border-2 border-border bg-background focus:outline-none focus:border-purple-500 transition-colors uppercase"
              maxLength={6}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {roomCode.length}/6 characters
            </p>
          </div>

          {/* Info */}
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <h3 className="font-semibold mb-2 text-sm">How Prediction Market Works</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Watch the first 5 questions to observe player performance</li>
              <li>• After question 5, prediction window opens</li>
              <li>• Place a 1 MONAD bet on who you think will win</li>
              <li>• If your prediction is correct, share 90% of the prediction pool</li>
              <li>• The winner gets 10% of the prediction pool as a bonus</li>
            </ul>
          </div>

          {/* Spectate Button */}
          <Button
            onClick={handleSpectateGame}
            disabled={isJoining || roomCode.length !== 6}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90"
            size="lg"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading Game...
              </>
            ) : (
              <>
                <Eye className="w-5 h-5 mr-2" />
                Start Spectating
              </>
            )}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-500" />
            Spectator Benefits
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• No entry fee required to spectate</li>
            <li>• Watch real-time trivia battles</li>
            <li>• Make informed predictions based on player performance</li>
            <li>• Win MONAD tokens if your prediction is correct</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
