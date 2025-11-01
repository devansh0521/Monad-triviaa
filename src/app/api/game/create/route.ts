import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateRoomCode } from '@/lib/gameUtils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { host_user_id, mode, entry_fee } = body

    // Validate required fields
    if (!host_user_id) {
      return NextResponse.json(
        { error: 'Host user ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(host_user_id) },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate unique room code
    let roomCode = generateRoomCode()
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      const existingGame = await prisma.game.findUnique({
        where: { room_code: roomCode },
      })
      if (!existingGame) {
        isUnique = true
      } else {
        roomCode = generateRoomCode()
        attempts++
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique room code' },
        { status: 500 }
      )
    }

    // Calculate platform fee (5% of 2-player pool: 0.1 MON per game)
    const PLATFORM_FEE = 0.1

    // Create game room
    const game = await prisma.game.create({
      data: {
        mode: mode || 'battle_royale',
        room_code: roomCode,
        status: 'waiting',
        entry_fee: entry_fee ? parseFloat(entry_fee) : null,
        pool_amount: 0,
        platform_fee: PLATFORM_FEE, // Store actual platform fee
        player_count: 0,
        host_user_id: parseInt(host_user_id),
      },
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

    return NextResponse.json(
      {
        message: 'Game room created successfully',
        game,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create game error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
