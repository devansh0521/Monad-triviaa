import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { backendContractService } from '@/services/backendContractService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code, host_user_id } = body

    if (!room_code || !host_user_id) {
      return NextResponse.json(
        { error: 'Room code and host user ID are required' },
        { status: 400 }
      )
    }

    // Find the game
    const game = await prisma.game.findUnique({
      where: { room_code: room_code.toUpperCase() },
      include: {
        gamePlayers: {
          include: {
            user: true,
          },
          orderBy: [
            { final_correct: 'desc' }, // Most correct answers first
            { final_time_ms: 'asc' },  // Fastest time as tiebreaker
          ],
        },
        hostUser: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Verify host
    if (game.host_user_id !== parseInt(host_user_id)) {
      return NextResponse.json(
        { error: 'Only the host can finish the game' },
        { status: 403 }
      )
    }

    // Check if game is active
    if (game.status !== 'active') {
      return NextResponse.json(
        { error: 'Game is not active' },
        { status: 400 }
      )
    }

    // Close any active rounds
    await prisma.gameRound.updateMany({
      where: {
        game_id: game.id,
        finished_at: null,
      },
      data: {
        finished_at: new Date(),
      },
    })

    // Determine winner
    // First, check if host has played (in some modes host might not play)
    // We'll include all players + host and determine winner

    let winner = null
    let winnerIsHost = false

    // For battle royale: winner is last player standing (not eliminated)
    if (game.mode === 'battle_royale') {
      const activePlayers = game.gamePlayers.filter(p => p.status !== 'eliminated')

      if (activePlayers.length === 1) {
        winner = activePlayers[0]
      } else if (activePlayers.length > 1) {
        // Multiple survivors - use correct answers and time as tiebreaker
        winner = activePlayers.sort((a, b) => {
          if (b.final_correct !== a.final_correct) {
            return b.final_correct - a.final_correct
          }
          return a.final_time_ms - b.final_time_ms
        })[0]
      } else {
        // No survivors - host wins by default (edge case)
        winnerIsHost = true
      }
    } else {
      // Quick play or other modes: highest score wins
      const allPlayers = game.gamePlayers

      if (allPlayers.length > 0) {
        // Sort by correct answers desc, then time asc
        winner = allPlayers[0] // Already sorted by query above
      } else {
        // Only host played
        winnerIsHost = true
      }
    }

    const winnerId = winnerIsHost ? game.host_user_id : winner?.user_id
    const winnerWalletAddress = winnerIsHost
      ? game.hostUser?.wallet_address
      : winner?.user?.wallet_address

    if (!winnerId || !winnerWalletAddress) {
      return NextResponse.json(
        { error: 'Could not determine winner' },
        { status: 400 }
      )
    }

    // Update game with winner
    await prisma.game.update({
      where: { id: game.id },
      data: {
        status: 'finished',
        winner_user_id: winnerId,
        finished_at: new Date(),
      },
    })

    // Update leaderboard for winner
    await prisma.leaderboard.upsert({
      where: {
        user_id: winnerId,
      },
      update: {
        total_wins: { increment: 1 },
        total_games: { increment: 1 },
        total_earnings: {
          increment: game.pool_amount ? Number(game.pool_amount) : 0
        },
      },
      create: {
        user_id: winnerId,
        total_wins: 1,
        total_games: 1,
        total_earnings: game.pool_amount ? Number(game.pool_amount) : 0,
      },
    })

    // Update leaderboard for losers
    const loserIds = game.gamePlayers
      .filter(p => p.user_id !== winnerId)
      .map(p => p.user_id)
      .filter(Boolean) as number[]

    for (const loserId of loserIds) {
      await prisma.leaderboard.upsert({
        where: { user_id: loserId },
        update: {
          total_games: { increment: 1 },
        },
        create: {
          user_id: loserId,
          total_wins: 0,
          total_games: 1,
          total_earnings: 0,
        },
      })
    }

    // If host played and lost, update their stats too
    if (!winnerIsHost && game.host_user_id) {
      await prisma.leaderboard.upsert({
        where: { user_id: game.host_user_id },
        update: {
          total_games: { increment: 1 },
        },
        create: {
          user_id: game.host_user_id,
          total_wins: 0,
          total_games: 1,
          total_earnings: 0,
        },
      })
    }

    // Create event log
    await prisma.eventLog.create({
      data: {
        user_id: winnerId,
        game_id: game.id,
        event_type: 'game_won',
        details: {
          room_code: game.room_code,
          winner_wallet: winnerWalletAddress,
          prize_amount: game.pool_amount ? Number(game.pool_amount) : 0,
          correct_answers: winnerIsHost ? 0 : winner?.final_correct || 0,
          total_time_ms: winnerIsHost ? 0 : winner?.final_time_ms || 0,
        },
      },
    })

    // Ensure prediction pool exists (create if missing)
    let predictionPool = await prisma.predictionPool.findUnique({
      where: { game_id: game.id },
      include: {
        predictions: true,
      },
    })

    if (!predictionPool) {
      // Create prediction pool if it doesn't exist yet
      console.log('📝 Creating prediction pool at game finish (was missing)...')

      // Get active players for blockchain
      const activePlayers = game.gamePlayers.filter(p => p.status !== 'eliminated')
      const playerAddresses = activePlayers
        .map(p => p.user?.wallet_address)
        .filter(Boolean) as string[]

      // Try to open on blockchain
      let blockchainTxHash: string | null = null
      if (playerAddresses.length > 0) {
        try {
          const { backendPredictionService } = await import('@/services/backendPredictionService')
          await backendPredictionService.initialize()

          const result = await backendPredictionService.openPredictionPool(
            game.room_code!,
            playerAddresses
          )
          blockchainTxHash = result.txHash
          console.log('✅ Prediction pool opened on blockchain (late):', blockchainTxHash)
        } catch (blockchainErr: any) {
          console.error('⚠️ Failed to open prediction pool on blockchain:', blockchainErr)
        }
      }

      const { ethers } = await import('ethers')
      const blockchainGameId = ethers.keccak256(ethers.toUtf8Bytes(game.room_code!))

      predictionPool = await prisma.predictionPool.create({
        data: {
          game_id: game.id,
          blockchain_game_id: blockchainGameId,
          opened_at: new Date(),
          closed_at: new Date(),
        },
        include: {
          predictions: true,
        },
      })
      console.log('✅ Prediction pool created in database')
    }

    // Settle prediction pool if exists
    let predictionResults = null
    try {
      if (predictionPool && !predictionPool.settled && predictionPool.predictions.length > 0) {
        console.log('🎯 Settling prediction pool...')

        // Settle on blockchain first
        let settlementTxHash: string | null = null
        try {
          const { backendPredictionService } = await import('@/services/backendPredictionService')
          await backendPredictionService.initialize()

          const result = await backendPredictionService.settlePredictions(
            game.room_code!,
            winnerWalletAddress
          )
          settlementTxHash = result.txHash
          console.log('✅ Predictions settled on blockchain:', settlementTxHash)
        } catch (blockchainErr: any) {
          console.error('⚠️ Failed to settle predictions on blockchain:', blockchainErr)
          // Continue with database settlement even if blockchain fails
        }

        // Count correct predictions
        const correctPredictions = predictionPool.predictions.filter(
          p => p.predicted_player_id === winnerId
        )

        const totalPoolAmount = Number(predictionPool.total_pool_amount)
        const winnerRewardPercentage = 10 // 10%
        const winnerReward = (totalPoolAmount * winnerRewardPercentage) / 100
        const predictionRewardPool = totalPoolAmount - winnerReward

        let payoutPerPredictor = 0
        if (correctPredictions.length > 0) {
          payoutPerPredictor = predictionRewardPool / correctPredictions.length
        }

        // Update predictions with results
        for (const prediction of predictionPool.predictions) {
          const isCorrect = prediction.predicted_player_id === winnerId

          await prisma.prediction.update({
            where: { id: prediction.id },
            data: {
              is_correct: isCorrect,
              payout_amount: isCorrect ? payoutPerPredictor : 0,
            },
          })
        }

        // Update prediction pool
        await prisma.predictionPool.update({
          where: { id: predictionPool.id },
          data: {
            winner_player_id: winnerId,
            winner_reward_amount: winnerReward,
            prediction_pool_amount: predictionRewardPool,
            settled: true,
            settled_at: new Date(),
            closed_at: predictionPool.closed_at || new Date(),
            settlement_tx_hash: settlementTxHash,
          },
        })

        predictionResults = {
          total_pool_amount: totalPoolAmount,
          winner_reward: winnerReward,
          prediction_pool: predictionRewardPool,
          correct_predictions_count: correctPredictions.length,
          payout_per_correct_predictor: payoutPerPredictor,
        }

        console.log('✅ Prediction pool settled successfully')
      }
    } catch (predErr: any) {
      console.error('❌ Failed to settle prediction pool:', predErr)
      // Don't fail the entire request if prediction settlement fails
    }

    // Distribute prize via smart contract (BACKEND - RELIABLE)
    let txHash: string | null = null
    let contractError: string | null = null

    try {
      console.log('💰 Distributing prize via smart contract (backend)...')
      await backendContractService.initialize()

      const result = await backendContractService.setWinner(
        game.room_code,
        winnerWalletAddress
      )

      txHash = result.txHash
      console.log('✅ Prize distributed successfully! TX:', txHash)
      console.log('⛽ Gas used:', result.gasUsed)

      // Update game with transaction hash
      await prisma.game.update({
        where: { id: game.id },
        data: {
          tokens_sent: true,
        },
      })
    } catch (contractErr: any) {
      console.error('❌ Failed to distribute prize via contract:', contractErr)
      contractError = contractErr.message

      // Log the error but don't fail the entire request
      await prisma.eventLog.create({
        data: {
          game_id: game.id,
          event_type: 'prize_distribution_failed',
          details: {
            room_code: game.room_code,
            winner_wallet: winnerWalletAddress,
            error: contractErr.message,
          },
        },
      })
    }

    return NextResponse.json({
      message: 'Game finished successfully',
      winner: {
        user_id: winnerId,
        wallet_address: winnerWalletAddress,
        is_host: winnerIsHost,
        correct_answers: winnerIsHost ? 0 : winner?.final_correct || 0,
        total_time_ms: winnerIsHost ? 0 : winner?.final_time_ms || 0,
      },
      pool_amount: game.pool_amount,
      room_code: game.room_code,
      prize_distribution: {
        success: txHash !== null,
        tx_hash: txHash,
        error: contractError,
      },
      prediction_results: predictionResults,
    })
  } catch (error) {
    console.error('Finish game error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
