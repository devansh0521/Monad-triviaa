import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code, host_user_id, blockchain_tx_hash } = body

    // Validate required fields
    if (!room_code || !host_user_id) {
      return NextResponse.json(
        { error: 'Room code and host user ID are required' },
        { status: 400 }
      )
    }

    // Find game room
    const game = await prisma.game.findUnique({
      where: { room_code: room_code.toUpperCase() },
      include: {
        gamePlayers: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Verify user is the host
    if (game.host_user_id !== parseInt(host_user_id)) {
      return NextResponse.json(
        { error: 'Only the host can lock the room' },
        { status: 403 }
      )
    }

    // Check if game is in correct state
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already been locked or started' },
        { status: 400 }
      )
    }

    // Check if there's at least one other player
    if (game.gamePlayers.length === 0) {
      return NextResponse.json(
        { error: 'Need at least one player besides the host to start' },
        { status: 400 }
      )
    }

    // Update game status to funding_pending (room locked, ready for funding)
    await prisma.game.update({
      where: { id: game.id },
      data: {
        status: 'funding_pending',
        player_count: game.gamePlayers.length, // Lock the player count
      },
    })

    // Create event log
    await prisma.eventLog.create({
      data: {
        user_id: parseInt(host_user_id),
        game_id: game.id,
        event_type: 'room_locked',
        details: {
          room_code: game.room_code,
          player_count: game.gamePlayers.length + 1, // +1 for host
          blockchain_tx_hash,
        },
      },
    })

    return NextResponse.json({
      message: 'Room locked successfully. Players can now fund the pool.',
      player_count: game.gamePlayers.length + 1,
    })
  } catch (error) {
    console.error('Lock room error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
