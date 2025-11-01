import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidRoomCode } from '@/lib/gameUtils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code, user_id } = body

    // Validate required fields
    if (!room_code || !user_id) {
      return NextResponse.json(
        { error: 'Room code and user ID are required' },
        { status: 400 }
      )
    }

    // Validate room code format
    if (!isValidRoomCode(room_code)) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
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

    // Check if game has already started
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already started or finished' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(user_id) },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is already in the game
    const existingPlayer = await prisma.gamePlayer.findFirst({
      where: {
        game_id: game.id,
        user_id: parseInt(user_id),
      },
    })

    if (existingPlayer) {
      return NextResponse.json(
        { error: 'You are already in this game' },
        { status: 400 }
      )
    }

    // Add player to game
    const gamePlayer = await prisma.gamePlayer.create({
      data: {
        game_id: game.id,
        user_id: parseInt(user_id),
        status: 'joined',
      },
      include: {
        user: {
          include: {
            avatar: true,
          },
        },
      },
    })

    // Update player count
    await prisma.game.update({
      where: { id: game.id },
      data: {
        player_count: game.gamePlayers.length + 1,
      },
    })

    // Fetch updated game data
    const updatedGame = await prisma.game.findUnique({
      where: { id: game.id },
      include: {
        hostUser: {
          include: {
            avatar: true,
          },
        },
        gamePlayers: {
          include: {
            user: {
              include: {
                avatar: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Successfully joined the game',
      game: updatedGame,
      player: gamePlayer,
    })
  } catch (error) {
    console.error('Join game error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
