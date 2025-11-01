import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Make a prediction (bet 1 MONAD on a player)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code, predictor_user_id, predicted_player_id, blockchain_tx_hash } = body

    if (!room_code || !predictor_user_id || !predicted_player_id) {
      return NextResponse.json(
        { error: 'Room code, predictor user ID, and predicted player ID are required' },
        { status: 400 }
      )
    }

    // Find the game
    const game = await prisma.game.findUnique({
      where: { room_code: room_code.toUpperCase() },
      include: {
        gamePlayers: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if game is active
    if (game.status !== 'active') {
      return NextResponse.json(
        { error: 'Game is not active' },
        { status: 400 }
      )
    }

    // Get prediction pool
    const predictionPool = await prisma.predictionPool.findUnique({
      where: { game_id: game.id },
    })

    if (!predictionPool) {
      return NextResponse.json(
        { error: 'Prediction pool not open yet' },
        { status: 400 }
      )
    }

    // Check if pool is still open (not closed)
    if (predictionPool.closed_at) {
      return NextResponse.json(
        { error: 'Prediction pool is closed' },
        { status: 400 }
      )
    }

    // Check if predictor is a player in the game (they shouldn't be)
    const isPlayer = game.gamePlayers.some(p => p.user_id === parseInt(predictor_user_id))
    if (isPlayer) {
      return NextResponse.json(
        { error: 'Players cannot make predictions on their own game' },
        { status: 400 }
      )
    }

    // Check if predicted player is actually in the game
    const isPredictedPlayerInGame = game.gamePlayers.some(p => p.user_id === parseInt(predicted_player_id))
    if (!isPredictedPlayerInGame) {
      return NextResponse.json(
        { error: 'Predicted player is not in this game' },
        { status: 400 }
      )
    }

    // Check if user already made a prediction for this game
    const existingPrediction = await prisma.prediction.findFirst({
      where: {
        prediction_pool_id: predictionPool.id,
        predictor_user_id: parseInt(predictor_user_id),
      },
    })

    if (existingPrediction) {
      return NextResponse.json(
        { error: 'You have already made a prediction for this game' },
        { status: 400 }
      )
    }

    // Create prediction
    const prediction = await prisma.prediction.create({
      data: {
        prediction_pool_id: predictionPool.id,
        predictor_user_id: parseInt(predictor_user_id),
        predicted_player_id: parseInt(predicted_player_id),
        amount: 1, // 1 MONAD
        blockchain_tx_hash: blockchain_tx_hash || null,
      },
      include: {
        predictor: true,
        predictedPlayer: true,
      },
    })

    // Update total pool amount
    await prisma.predictionPool.update({
      where: { id: predictionPool.id },
      data: {
        total_pool_amount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      message: 'Prediction made successfully',
      prediction: {
        id: prediction.id,
        predictor_username: prediction.predictor?.username,
        predicted_player_username: prediction.predictedPlayer?.username,
        amount: prediction.amount,
        created_at: prediction.created_at,
      },
    })
  } catch (error) {
    console.error('Make prediction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
