import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Claim prediction winnings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prediction_id, user_id, claim_tx_hash } = body

    if (!prediction_id || !user_id) {
      return NextResponse.json(
        { error: 'Prediction ID and user ID are required' },
        { status: 400 }
      )
    }

    // Find the prediction
    const prediction = await prisma.prediction.findUnique({
      where: { id: parseInt(prediction_id) },
      include: {
        predictionPool: true,
        predictor: true,
      },
    })

    if (!prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      )
    }

    // Verify user owns this prediction
    if (prediction.predictor_user_id !== parseInt(user_id)) {
      return NextResponse.json(
        { error: 'You do not own this prediction' },
        { status: 403 }
      )
    }

    // Check if prediction pool is settled
    if (!prediction.predictionPool.settled) {
      return NextResponse.json(
        { error: 'Predictions not settled yet' },
        { status: 400 }
      )
    }

    // Check if prediction was correct
    if (!prediction.is_correct) {
      return NextResponse.json(
        { error: 'Your prediction was incorrect' },
        { status: 400 }
      )
    }

    // Check if already claimed
    if (prediction.claimed) {
      return NextResponse.json(
        { error: 'Reward already claimed' },
        { status: 400 }
      )
    }

    // Check if there's a payout
    if (!prediction.payout_amount || Number(prediction.payout_amount) <= 0) {
      return NextResponse.json(
        { error: 'No payout available' },
        { status: 400 }
      )
    }

    // Mark as claimed
    await prisma.prediction.update({
      where: { id: prediction.id },
      data: {
        claimed: true,
        claimed_tx_hash: claim_tx_hash || null,
      },
    })

    return NextResponse.json({
      message: 'Reward claimed successfully',
      payout_amount: prediction.payout_amount,
    })
  } catch (error) {
    console.error('Claim prediction reward error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
