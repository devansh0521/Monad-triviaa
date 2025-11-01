import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code, tx_hash } = body

    if (!room_code || !tx_hash) {
      return NextResponse.json(
        { error: 'Room code and transaction hash are required' },
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

    // Mark as tokens sent
    await prisma.game.update({
      where: { id: game.id },
      data: {
        tokens_sent: true,
        fee_deducted: true,
      },
    })

    // Create event log for prize distribution
    await prisma.eventLog.create({
      data: {
        user_id: game.winner_user_id,
        game_id: game.id,
        event_type: 'prize_distributed',
        details: {
          room_code: game.room_code,
          tx_hash: tx_hash,
          pool_amount: game.pool_amount ? Number(game.pool_amount) : 0,
        },
      },
    })

    return NextResponse.json({
      message: 'Prize distribution recorded successfully',
    })
  } catch (error) {
    console.error('Record distribution error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
