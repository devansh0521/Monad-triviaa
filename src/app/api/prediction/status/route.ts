import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get prediction pool status for a game
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const room_code = searchParams.get('room_code')

    if (!room_code) {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      )
    }

    // Find the game
    const game = await prisma.game.findUnique({
      where: { room_code: room_code.toUpperCase() },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Get prediction pool
    const predictionPool = await prisma.predictionPool.findUnique({
      where: { game_id: game.id },
      include: {
        predictions: {
          include: {
            predictor: true,
            predictedPlayer: true,
          },
        },
        game: {
          include: {
            gamePlayers: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    if (!predictionPool) {
      return NextResponse.json({
        predictionPool: null,
        predictions: [],
        activePlayers: [],
      })
    }

    // Get active players for prediction
    const activePlayers = predictionPool.game.gamePlayers
      .filter(p => p.status !== 'eliminated')
      .map(p => ({
        user_id: p.user_id,
        username: p.user?.username,
        wallet_address: p.user?.wallet_address,
      }))

    // Format predictions
    const predictions = predictionPool.predictions.map(p => ({
      id: p.id,
      predictor_username: p.predictor?.username,
      predictor_wallet: p.predictor?.wallet_address,
      predicted_player_username: p.predictedPlayer?.username,
      predicted_player_wallet: p.predictedPlayer?.wallet_address,
      amount: p.amount,
      is_correct: p.is_correct,
      claimed: p.claimed,
      payout_amount: p.payout_amount,
      created_at: p.created_at,
    }))

    return NextResponse.json({
      predictionPool: {
        id: predictionPool.id,
        game_id: predictionPool.game_id,
        blockchain_game_id: predictionPool.blockchain_game_id,
        opened_at: predictionPool.opened_at,
        closed_at: predictionPool.closed_at,
        settled_at: predictionPool.settled_at,
        total_pool_amount: predictionPool.total_pool_amount,
        winner_player_id: predictionPool.winner_player_id,
        winner_reward_amount: predictionPool.winner_reward_amount,
        prediction_pool_amount: predictionPool.prediction_pool_amount,
        settled: predictionPool.settled,
      },
      predictions,
      activePlayers,
    })
  } catch (error) {
    console.error('Get prediction pool status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
