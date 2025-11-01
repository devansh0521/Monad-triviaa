import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ethers } from 'ethers'

// Open prediction pool after question 5
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code } = body

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
        gamePlayers: {
          include: {
            user: true,
          },
        },
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

    // Check if prediction pool already exists
    const existingPool = await prisma.predictionPool.findUnique({
      where: { game_id: game.id },
    })

    if (existingPool) {
      return NextResponse.json(
        { error: 'Prediction pool already exists for this game' },
        { status: 400 }
      )
    }

    // Generate blockchain game ID
    const blockchainGameId = ethers.keccak256(ethers.toUtf8Bytes(room_code.toUpperCase()))

    // Create prediction pool
    const predictionPool = await prisma.predictionPool.create({
      data: {
        game_id: game.id,
        blockchain_game_id: blockchainGameId,
        opened_at: new Date(),
      },
      include: {
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

    // Get active players for prediction
    const activePlayers = predictionPool.game.gamePlayers
      .filter(p => p.status !== 'eliminated')
      .map(p => ({
        user_id: p.user_id,
        username: p.user?.username,
        wallet_address: p.user?.wallet_address,
      }))

    return NextResponse.json({
      message: 'Prediction pool opened',
      predictionPool: {
        id: predictionPool.id,
        game_id: predictionPool.game_id,
        blockchain_game_id: predictionPool.blockchain_game_id,
        opened_at: predictionPool.opened_at,
        total_pool_amount: predictionPool.total_pool_amount,
      },
      activePlayers,
    })
  } catch (error) {
    console.error('Open prediction pool error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
