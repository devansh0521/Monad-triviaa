import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code, host_user_id } = body

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
        { error: 'Only the host can start the game' },
        { status: 403 }
      )
    }

    // Check if game is funded
    if (game.status !== 'funded') {
      return NextResponse.json(
        { error: 'All players must fund the pool before starting' },
        { status: 400 }
      )
    }

    // Update game status to active
    await prisma.game.update({
      where: { id: game.id },
      data: {
        status: 'active',
        started_at: new Date(),
      },
    })

    // Update all players status to active
    await prisma.gamePlayer.updateMany({
      where: { game_id: game.id },
      data: {
        status: 'active',
      },
    })

    return NextResponse.json({
      message: 'Game started successfully',
    })
  } catch (error) {
    console.error('Start game error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
