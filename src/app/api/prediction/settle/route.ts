import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Settle predictions after game finishes (called automatically after game ends)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code, settlement_tx_hash } = body

    if (!room_code) {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      )
    }

    // Find the game
    const game = await prisma.game.findUnique({
      where: { room_code: room_code.toUpperCase() },
      include: {
        winnerUser: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if game is finished
    if (game.status !== 'finished') {
      return NextResponse.json(
        { error: 'Game is not finished yet' },
        { status: 400 }
      )
    }

    // Get prediction pool
    const predictionPool = await prisma.predictionPool.findUnique({
      where: { game_id: game.id },
      include: {
        predictions: true,
      },
    })

    if (!predictionPool) {
      return NextResponse.json(
        { error: 'No prediction pool found for this game' },
        { status: 404 }
      )
    }

    // Check if already settled
    if (predictionPool.settled) {
      return NextResponse.json(
        { error: 'Predictions already settled' },
        { status: 400 }
      )
    }

    // Check if there are any predictions
    if (predictionPool.predictions.length === 0) {
      // No predictions made, just close the pool
      await prisma.predictionPool.update({
        where: { id: predictionPool.id },
        data: {
          settled: true,
          settled_at: new Date(),
          closed_at: predictionPool.closed_at || new Date(),
        },
      })

      return NextResponse.json({
        message: 'Prediction pool closed (no predictions made)',
      })
    }

    const winnerId = game.winner_user_id
    if (!winnerId) {
      return NextResponse.json(
        { error: 'No winner found for this game' },
        { status: 400 }
      )
    }

    // Count correct predictions
    const correctPredictions = predictionPool.predictions.filter(
      p => p.predicted_player_id === winnerId
    )

    const totalPoolAmount = Number(predictionPool.total_pool_amount)

    // Calculate rewards
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
        settlement_tx_hash: settlement_tx_hash || null,
        closed_at: predictionPool.closed_at || new Date(),
      },
    })

    return NextResponse.json({
      message: 'Predictions settled successfully',
      results: {
        total_pool_amount: totalPoolAmount,
        winner_reward: winnerReward,
        prediction_pool: predictionRewardPool,
        correct_predictions_count: correctPredictions.length,
        payout_per_correct_predictor: payoutPerPredictor,
        winner_user_id: winnerId,
        winner_wallet: game.winnerUser?.wallet_address,
      },
    })
  } catch (error) {
    console.error('Settle predictions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
