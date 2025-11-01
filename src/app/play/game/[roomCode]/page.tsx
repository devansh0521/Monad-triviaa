'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Trophy, CheckCircle, XCircle, Timer, Crown } from 'lucide-react'
import { gameService } from '@/services/gameService'
import { contractService } from '@/services/contractService'

const TOTAL_ROUNDS = 10 // Total number of questions
const TIME_PER_QUESTION = 20 // 20 seconds per question
const POLL_INTERVAL = 2000 // Poll every 2 seconds for new rounds

export default function GamePage() {
  const router = useRouter()
  const params = useParams()
  const roomCode = params.roomCode as string

  const [user, setUser] = useState<any>(null)
  const [game, setGame] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [currentRound, setCurrentRound] = useState<any>(null)
  const [roundNumber, setRoundNumber] = useState(1)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [answerResult, setAnswerResult] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [questionStartTime, setQuestionStartTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFinishing, setIsFinishing] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [winner, setWinner] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [waitingForNextRound, setWaitingForNextRound] = useState(false)

  // Refs to prevent duplicate operations
  const isCreatingRound = useRef(false)
  const isFinishingGame = useRef(false)
  const lastProcessedRoundId = useRef<number | null>(null)
  const hasReportedTabSwitch = useRef(false)
  const [isDisqualified, setIsDisqualified] = useState(false)

  // Load user and game
  useEffect(() => {
    const storedUser = localStorage.getItem('monad_trivia_user')
    if (!storedUser) {
      router.push('/profile/create')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)

    // Load game info
    loadGameInfo(userData)
  }, [router])

  const loadGameInfo = async (userData: any) => {
    try {
      const gameData = await gameService.getRoom(roomCode)
      setGame(gameData)
      setIsHost(gameData.host_user_id === userData.id)
    } catch (err: any) {
      console.error('Load game error:', err)
      setError('Failed to load game')
    }
  }

  // Host creates first round when game loads
  useEffect(() => {
    if (user && isHost && game && !isCreatingRound.current && !currentRound) {
      console.log('Host initializing first round...')
      createNewRound(1)
    }
  }, [user, isHost, game])

  // All players poll for current round and game status
  useEffect(() => {
    if (!user || !game || gameFinished) return

    const pollGameState = async () => {
      try {
        // First, check if game has finished
        const gameData = await gameService.getRoom(roomCode)

        if (gameData.status === 'finished') {
          console.log('Game finished! Showing results...')

          // Determine if current user is the winner
          const isUserWinner = gameData.winner_user_id === user.id

          setWinner({
            user_id: gameData.winner_user_id,
            wallet_address: gameData.winnerUser?.wallet_address || null,
            is_host: gameData.winner_user_id === gameData.host_user_id,
            correct_answers: 0,
            total_time_ms: 0
          })
          setGameFinished(true)
          setWaitingForNextRound(false)
          setIsLoading(false)
          return
        }

        // Then check for new rounds
        const round = await gameService.getCurrentRound(roomCode)

        // Check if this is a new round we haven't processed yet
        if (round && round.id !== lastProcessedRoundId.current) {
          console.log('New round detected:', round.id, 'Round number:', round.round_number)
          lastProcessedRoundId.current = round.id

          setCurrentRound(round)
          setQuestionStartTime(Date.now())
          setTimeLeft(TIME_PER_QUESTION)
          setSelectedOption(null)
          setHasAnswered(false)
          setAnswerResult(null)
          setWaitingForNextRound(false)
          setIsLoading(false)
          setIsSubmitting(false)

          // Update round number
          if (round.round_number) {
            setRoundNumber(round.round_number)
          }
        }
      } catch (err: any) {
        // No active round yet - host might be creating it
        console.log('Waiting for round...', err.message)
      }
    }

    // Poll immediately
    pollGameState()

    // Then poll at intervals
    const interval = setInterval(pollGameState, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [user, game, roomCode, gameFinished])

  // Timer countdown
  useEffect(() => {
    if (!currentRound || hasAnswered || timeLeft <= 0 || waitingForNextRound) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentRound, hasAnswered, timeLeft, waitingForNextRound])

  // Tab visibility detection - anti-cheat
  useEffect(() => {
    if (!user || !game || gameFinished || isDisqualified || hasReportedTabSwitch.current) return
    if (game.status !== 'active') return // Only monitor during active gameplay

    const handleVisibilityChange = async () => {
      if (document.hidden && !hasReportedTabSwitch.current) {
        console.log('⚠️ TAB SWITCH DETECTED! Player will be disqualified.')
        hasReportedTabSwitch.current = true
        setIsDisqualified(true)

        try {
          // Report tab switch to server
          const result = await gameService.reportTabSwitch(roomCode, user.id)

          if (result.game_ended) {
            // Game ended with a winner (2-player scenario)
            setWinner({
              user_id: result.winner_user_id,
              wallet_address: result.winner_wallet_address,
              is_host: result.winner_is_host,
              correct_answers: 0,
              total_time_ms: 0
            })
            setGameFinished(true)
          }

          // Show disqualification message
          setError('You have been disqualified for switching tabs. Your entry fee is forfeited.')
        } catch (err: any) {
          console.error('Report tab switch error:', err)
          setError('Disqualified for tab switching')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, game, roomCode, gameFinished, isDisqualified])

  const createNewRound = async (round: number) => {
    if (!isHost || isCreatingRound.current) return

    isCreatingRound.current = true
    try {
      console.log('Host creating round:', round)
      const newRound = await gameService.createRound(roomCode, round)
      console.log('Round created successfully:', newRound.id)

      // Update local state immediately for host
      lastProcessedRoundId.current = newRound.id
      setCurrentRound(newRound)
      setQuestionStartTime(Date.now())
      setTimeLeft(TIME_PER_QUESTION)
      setSelectedOption(null)
      setHasAnswered(false)
      setAnswerResult(null)
      setWaitingForNextRound(false)
      setIsLoading(false)
      setIsSubmitting(false)

      if (newRound.round_number) {
        setRoundNumber(newRound.round_number)
      }
    } catch (err: any) {
      console.error('Create round error:', err)
      setError(err.message || 'Failed to create round')
    } finally {
      isCreatingRound.current = false
    }
  }

  const handleTimeUp = () => {
    if (hasAnswered || waitingForNextRound) return
    console.log('Time up for round:', roundNumber)

    setHasAnswered(true)
    setWaitingForNextRound(true)

    // Host controls progression
    if (isHost) {
      setTimeout(() => {
        if (roundNumber < TOTAL_ROUNDS) {
          createNewRound(roundNumber + 1)
        } else {
          finishGame()
        }
      }, 3000)
    }
  }

  const handleSubmitAnswer = async (option: string) => {
    if (!user || !currentRound || hasAnswered || isSubmitting) {
      console.log('Submit blocked:', { hasAnswered, isSubmitting })
      return
    }

    setIsSubmitting(true)
    console.log('Submitting answer:', option)

    try {
      const answerTimeMs = Date.now() - questionStartTime

      const result = await gameService.submitAnswer(
        roomCode,
        user.id,
        currentRound.id,
        option,
        answerTimeMs
      )

      console.log('Answer result:', result)
      setAnswerResult(result)
      setHasAnswered(true)
      setWaitingForNextRound(true)
      setIsSubmitting(false)

      // Host controls progression
      if (isHost) {
        setTimeout(() => {
          if (roundNumber < TOTAL_ROUNDS) {
            createNewRound(roundNumber + 1)
          } else {
            finishGame()
          }
        }, 3000)
      }
    } catch (err: any) {
      console.error('Submit answer error:', err)
      setError(err.message || 'Failed to submit answer')
      setIsSubmitting(false)
      setWaitingForNextRound(false)
      setHasAnswered(false)
    }
  }

  const finishGame = async () => {
    if (!user || isFinishing || isFinishingGame.current) return

    isFinishingGame.current = true
    setIsFinishing(true)
    console.log('Finishing game...')

    try {
      const result = await gameService.finishGame(roomCode, user.id)
      console.log('Game finished, winner:', result.winner)

      setWinner(result.winner)
      setGameFinished(true)

      // Distribute prize via smart contract (only host)
      if (isHost && result.winner.wallet_address) {
        console.log('Host distributing prize to:', result.winner.wallet_address)
        await distributePrize(result)
      }
    } catch (err: any) {
      console.error('Finish game error:', err)
      alert('Failed to finish game: ' + err.message)
    } finally {
      setIsFinishing(false)
      isFinishingGame.current = false
    }
  }

  const distributePrize = async (gameResult: any) => {
    try {
      console.log('Initializing contract service for prize distribution...')
      await contractService.initialize()

      console.log('Calling setWinner on smart contract...')
      const { txHash } = await contractService.setWinner(
        roomCode,
        gameResult.winner.wallet_address
      )

      console.log('Prize distributed successfully! TX:', txHash)

      // Record distribution in backend
      await fetch('/api/game/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_code: roomCode,
          tx_hash: txHash,
        }),
      })

      console.log('Prize distribution recorded in database')
    } catch (err: any) {
      console.error('Prize distribution error:', err)
      alert('Prize distribution failed: ' + err.message + '. Winner: ' + gameResult.winner.wallet_address)
    }
  }

  // Show disqualification screen
  if (isDisqualified && !gameFinished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-red-500/20">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-3xl font-bold mb-2 text-red-500">Disqualified!</h1>
          <p className="text-lg text-muted-foreground mb-6">
            You switched tabs during the game and have been disqualified.
          </p>

          <div className="bg-card border border-red-500/30 rounded-lg p-6 mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              <strong className="text-red-400">Rule Violation:</strong> Tab switching is not allowed during gameplay
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-red-400">Penalty:</strong> Entry fee forfeited
            </p>
          </div>

          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading && !currentRound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isHost ? 'Loading question...' : 'Waiting for host to start...'}
          </p>
        </div>
      </div>
    )
  }

  if (gameFinished) {
    const isWinner = user && winner && winner.user_id === user.id

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Winner/Loser Icon */}
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            isWinner
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
              : 'bg-gradient-to-br from-gray-400 to-gray-600'
          }`}>
            <Trophy className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-2">
            {isWinner ? '🎉 Congratulations!' : 'Game Over'}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {isWinner
              ? 'You won the game!'
              : 'Better luck next time!'}
          </p>

          {/* Winner Info Card */}
          {winner && (
            <div className={`border rounded-lg p-6 mb-6 ${
              isWinner
                ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20'
                : 'bg-card border-border'
            }`}>
              <p className="text-sm text-muted-foreground mb-2">
                {isWinner ? '👑 You are the Champion!' : '🏆 Winner'}
              </p>
              {!isWinner && (
                <p className="text-2xl font-bold mb-4">
                  {winner.is_host && <Crown className="w-6 h-6 inline mr-2 text-yellow-500" />}
                  Player {winner.user_id}
                </p>
              )}

              {game && game.pool_amount && (
                <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-muted-foreground mb-1">
                    {isWinner ? 'Prize Awarded' : 'Prize Pool'}
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    {Number(game.pool_amount).toFixed(3)} MON
                  </p>
                </div>
              )}

              {isWinner && (
                <p className="text-xs text-muted-foreground mt-3">
                  The prize has been sent to your wallet
                </p>
              )}
            </div>
          )}

          {/* Your Stats (for losers) */}
          {!isWinner && (
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-3">Your Performance</p>
              <div className="flex items-center justify-center gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Entry Fee</p>
                  <p className="text-lg font-semibold text-red-400">
                    {game?.entry_fee ? Number(game.entry_fee).toFixed(2) : '1'} MON
                  </p>
                </div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                  <p className="text-lg font-semibold text-muted-foreground">
                    0 MON
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Keep practicing to improve your skills!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              size="lg"
            >
              View Dashboard
            </Button>
            <Button
              onClick={() => router.push('/play')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Play Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (waitingForNextRound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isHost ? 'Preparing next question...' : 'Waiting for next question...'}
          </p>
          {answerResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              answerResult.is_correct ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              <p className={`font-semibold ${
                answerResult.is_correct ? 'text-green-500' : 'text-red-500'
              }`}>
                {answerResult.is_correct ? '✓ Correct!' : '✗ Wrong Answer'}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!currentRound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    )
  }

  const question = currentRound.question
  const options = question?.options || {}

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 px-4 py-2 rounded-lg">
              <p className="text-sm text-muted-foreground">Question</p>
              <p className="text-2xl font-bold">{roundNumber}/{TOTAL_ROUNDS}</p>
            </div>
            {isHost && (
              <div className="bg-yellow-500/10 px-3 py-2 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <p className="text-xs font-medium text-yellow-500">HOST</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg ${
              timeLeft <= 5 ? 'bg-red-500/10 border border-red-500/20' : 'bg-blue-500/10 border border-blue-500/20'
            }`}>
              <div className="flex items-center gap-2">
                <Timer className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-500' : 'text-blue-500'}`} />
                <p className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-blue-500'}`}>
                  {timeLeft}s
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Anti-Cheat Warning */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-xs font-medium text-amber-500">
              ⚠️ Warning: Switching tabs will result in immediate disqualification and loss of entry fee
            </p>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 rounded-2xl p-8 mb-8">
          <div className="mb-4">
            {question?.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-3">
                {question.category}
              </span>
            )}
            {question?.difficulty && (
              <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium mb-3 ml-2">
                {question.difficulty}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-6">{question?.question_text}</h2>

          {/* Options */}
          <div className="space-y-3">
            {Object.entries(options).map(([key, value]: [string, any]) => {
              const isSelected = selectedOption === key
              const isCorrect = answerResult?.correct_option === key
              const isWrong = hasAnswered && selectedOption === key && !isCorrect

              return (
                <button
                  key={key}
                  onClick={() => {
                    if (!hasAnswered && !isSubmitting) {
                      setSelectedOption(key)
                    }
                  }}
                  disabled={hasAnswered || isSubmitting}
                  className={`w-full p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3 ${
                    isCorrect
                      ? 'border-green-500 bg-green-500/10'
                      : isWrong
                      ? 'border-red-500 bg-red-500/10'
                      : isSelected
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border hover:border-muted-foreground/30'
                  } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isCorrect
                      ? 'bg-green-500 text-white'
                      : isWrong
                      ? 'bg-red-500 text-white'
                      : isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {key}
                  </div>
                  <span className="flex-1">{value}</span>
                  {isCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {isWrong && <XCircle className="w-6 h-6 text-red-500" />}
                </button>
              )
            })}
          </div>

          {/* Submit Button */}
          {!hasAnswered && (
            <div className="mt-6">
              <Button
                onClick={() => {
                  if (selectedOption) {
                    handleSubmitAnswer(selectedOption)
                  }
                }}
                disabled={!selectedOption || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Answer'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Result Message */}
        {hasAnswered && answerResult && (
          <div className={`p-4 rounded-lg border-2 text-center ${
            answerResult.is_correct
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            <p className={`text-lg font-semibold ${
              answerResult.is_correct ? 'text-green-500' : 'text-red-500'
            }`}>
              {answerResult.is_correct ? '✓ Correct!' : '✗ Wrong Answer'}
            </p>
            {!answerResult.is_correct && answerResult.correct_option && (
              <p className="text-sm text-muted-foreground mt-2">
                Correct answer: <span className="font-semibold">{answerResult.correct_option}</span> - {options[answerResult.correct_option]}
              </p>
            )}
            {answerResult.is_correct && (
              <p className="text-sm text-green-600 mt-1">
                You answered in {((Date.now() - questionStartTime) / 1000).toFixed(1)}s
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
