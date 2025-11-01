'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Trophy, Eye, TrendingUp, Coins, CheckCircle, Users } from 'lucide-react'
import { gameService } from '@/services/gameService'
import { predictionService } from '@/services/predictionService'

const POLL_INTERVAL = 2000 // Poll every 2 seconds

export default function SpectatePage() {
  const router = useRouter()
  const params = useParams()
  const roomCode = params.roomCode as string

  const [user, setUser] = useState<any>(null)
  const [game, setGame] = useState<any>(null)
  const [currentRound, setCurrentRound] = useState<any>(null)
  const [roundResults, setRoundResults] = useState<any>(null)
  const [roundNumber, setRoundNumber] = useState(0)
  const [predictionPool, setPredictionPool] = useState<any>(null)
  const [activePlayers, setActivePlayers] = useState<any[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasPredicted, setHasPredicted] = useState(false)
  const [myPrediction, setMyPrediction] = useState<any>(null)
  const [gameFinished, setGameFinished] = useState(false)
  const [winner, setWinner] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user
  useEffect(() => {
    const storedUser = localStorage.getItem('monad_trivia_user')
    if (!storedUser) {
      router.push('/profile/create')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
  }, [router])

  // Poll for game state and prediction pool
  useEffect(() => {
    if (!user) return

    const pollGameState = async () => {
      try {
        // Get game data
        const gameData = await gameService.getRoom(roomCode)
        setGame(gameData)

        if (gameData.status === 'finished') {
          setGameFinished(true)
          if (gameData.winner_user_id) {
            setWinner({
              user_id: gameData.winner_user_id,
              wallet_address: gameData.winnerUser?.wallet_address || null,
            })
          }
        }

        // Get current round
        try {
          const round = await gameService.getCurrentRound(roomCode)
          setCurrentRound(round)
          if (round.round_number) {
            setRoundNumber(round.round_number)
          }
        } catch (err) {
          // No active round
        }

        // Get round results (includes correct answer and player responses)
        try {
          const resultsResponse = await fetch(`/api/game/round-results?room_code=${roomCode}`)
          if (resultsResponse.ok) {
            const resultsData = await resultsResponse.json()
            setRoundResults(resultsData)
          }
        } catch (err) {
          // No round results available yet
        }

        // Check for prediction pool (opens after Q5 or when game is finished)
        try {
          const response = await fetch(`/api/prediction/status?room_code=${roomCode}`)
          if (response.ok) {
            const data = await response.json()
            if (data.predictionPool) {
              setPredictionPool(data.predictionPool)
              setActivePlayers(data.activePlayers)

              // Check if user has already predicted
              const userPrediction = data.predictions.find(
                (p: any) => p.predictor_wallet === user.wallet_address
              )
              if (userPrediction) {
                setHasPredicted(true)
                setMyPrediction(userPrediction)
              }
            }
          }
        } catch (err) {
          // Prediction pool not open yet
        }

        setIsLoading(false)
      } catch (err: any) {
        console.error('Poll game state error:', err)
        setError(err.message)
        setIsLoading(false)
      }
    }

    pollGameState()
    const interval = setInterval(pollGameState, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [user, roomCode, roundNumber])

  const handleMakePrediction = async () => {
    if (!user || !selectedPlayer || !predictionPool) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Initialize prediction service
      await predictionService.initialize()

      // Get selected player wallet
      const selectedPlayerData = activePlayers.find(p => p.user_id === selectedPlayer)
      if (!selectedPlayerData) {
        throw new Error('Selected player not found')
      }

      // Make prediction on blockchain
      console.log('Making prediction on blockchain...')
      const { txHash, amount } = await predictionService.makePrediction(
        roomCode,
        selectedPlayerData.wallet_address
      )

      console.log('Prediction made on blockchain:', txHash)

      // Record prediction in database
      const response = await fetch('/api/prediction/make', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_code: roomCode,
          predictor_user_id: user.id,
          predicted_player_id: selectedPlayer,
          blockchain_tx_hash: txHash,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to make prediction')
      }

      setHasPredicted(true)
      setMyPrediction({
        predicted_player_username: selectedPlayerData.username,
        amount: 1,
      })

      alert(`Prediction submitted successfully! You bet ${amount} MONAD on ${selectedPlayerData.username}`)
    } catch (err: any) {
      console.error('Make prediction error:', err)
      setError(err.message || 'Failed to make prediction')
      alert('Failed to make prediction: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    )
  }

  if (gameFinished) {
    const didWin = myPrediction?.is_correct
    const payout = myPrediction?.payout_amount

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <Eye className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-2">Game Finished!</h1>
            <p className="text-muted-foreground">Room: {roomCode}</p>
          </div>

          {/* Winner announcement */}
          {winner && (
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h2 className="text-2xl font-bold">Winner</h2>
              </div>
              <p className="text-lg">Player ID: {winner.user_id}</p>
              <p className="text-sm text-muted-foreground truncate">
                Wallet: {winner.wallet_address}
              </p>
            </div>
          )}

          {/* Prediction result */}
          {hasPredicted && myPrediction && (
            <div className={`border-2 rounded-2xl p-6 mb-6 ${
              didWin
                ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20'
                : 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {didWin ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <Trophy className="w-8 h-8 text-red-500" />
                )}
                <h2 className="text-2xl font-bold">
                  {didWin ? 'Prediction Correct!' : 'Prediction Incorrect'}
                </h2>
              </div>

              <p className="text-lg mb-2">
                You predicted: <span className="font-bold">{myPrediction.predicted_player_username}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Bet amount: {myPrediction.amount} MONAD
              </p>

              {didWin && payout && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Your Payout</p>
                  <p className="text-3xl font-bold text-green-500">
                    {Number(payout).toFixed(3)} MONAD
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use the claim button to withdraw your winnings
                  </p>
                </div>
              )}
            </div>
          )}

          {!hasPredicted && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <p className="text-center text-muted-foreground">
                You didn't make a prediction for this game
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
              size="lg"
            >
              Return to Dashboard
            </Button>
            <Button
              onClick={() => router.push('/play')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Watch Another Game
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Prediction window (after Q5)
  if (predictionPool && !predictionPool.settled && !hasPredicted) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Prediction Market</h1>
            <p className="text-lg text-muted-foreground">
              Bet 1 MONAD on who you think will win!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Room: {roomCode} | Question: {roundNumber}/10
            </p>
          </div>

          {/* Pool info */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Prediction Pool</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Pool</p>
                <p className="text-2xl font-bold text-primary">
                  {Number(predictionPool.total_pool_amount).toFixed(2)} MONAD
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bet Amount</p>
                <p className="text-2xl font-bold text-accent">1.0 MONAD</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">
                90% of the pool goes to correct predictors (split equally)
                <br />
                10% goes to the winning player as a bonus
              </p>
            </div>
          </div>

          {/* Player selection */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select a Player to Bet On
            </h3>

            <div className="space-y-3">
              {activePlayers.map((player) => (
                <button
                  key={player.user_id}
                  onClick={() => setSelectedPlayer(player.user_id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPlayer === player.user_id
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{player.username || `Player ${player.user_id}`}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {player.wallet_address}
                      </p>
                    </div>
                    {selectedPlayer === player.user_id && (
                      <CheckCircle className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive mb-6">
              {error}
            </div>
          )}

          {/* Submit button */}
          <Button
            onClick={handleMakePrediction}
            disabled={!selectedPlayer || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting Prediction...
              </>
            ) : (
              <>
                <Coins className="w-5 h-5 mr-2" />
                Place Bet (1 MONAD)
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Make sure you have at least 1 MONAD in your wallet
          </p>
        </div>
      </div>
    )
  }

  // Watching game or waiting for prediction window
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Eye className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Spectating Game</h1>
          <p className="text-lg text-muted-foreground">Room: {roomCode}</p>
        </div>

        {/* Game status */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Current Question</p>
            <p className="text-4xl font-bold mb-4">{roundNumber}/10</p>

            {hasPredicted ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-green-500">Prediction Submitted!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You bet on: {myPrediction?.predicted_player_username}
                </p>
              </div>
            ) : predictionPool && !predictionPool.settled ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <TrendingUp className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="font-semibold text-amber-500">Prediction Window Open!</p>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  The prediction market is now available!
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Go to Prediction Market
                </Button>
              </div>
            ) : roundNumber < 5 ? (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                <p className="font-semibold text-blue-500">Watching Game...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Prediction window opens after question 5
                </p>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <TrendingUp className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="font-semibold text-amber-500">Prediction Window Opening...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Waiting for prediction pool to open...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Current question info (if available) */}
        {currentRound && currentRound.question && (
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 rounded-2xl p-6 mb-6">
            <div className="mb-4">
              {currentRound.question.category && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-2">
                  {currentRound.question.category}
                </span>
              )}
            </div>
            <p className="text-lg font-medium">{currentRound.question.question_text}</p>
            <p className="text-sm text-muted-foreground mt-3">
              Players are currently answering this question...
            </p>
          </div>
        )}

        {/* Round results (correct answer and player responses) */}
        {roundResults && roundResults.is_finished && roundResults.round && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Last Round Results</h3>

            {/* Question and correct answer */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-2">Question {roundResults.round.round_number}</p>
              <p className="font-medium mb-3">{roundResults.round.question?.question_text}</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-500 font-semibold">
                  Correct Answer: {roundResults.round.question?.correct_option}
                </p>
              </div>
            </div>

            {/* Player responses */}
            {roundResults.round.answers && roundResults.round.answers.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Player Responses:</h4>
                {roundResults.round.answers.map((answer: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      answer.is_correct
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {answer.is_correct ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-red-500" />
                        )}
                        <span className="font-medium">
                          {answer.username || `Player ${answer.user_id}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          answer.is_correct ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {answer.selected_option}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(answer.answer_time_ms / 1000).toFixed(1)}s
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
