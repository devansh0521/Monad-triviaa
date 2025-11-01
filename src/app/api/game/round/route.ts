import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get current round for a game
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

    // Get the current active round
    const currentRound = await prisma.gameRound.findFirst({
      where: {
        game_id: game.id,
        finished_at: null,
      },
      include: {
        question: true,
        answers: true,
      },
      orderBy: {
        round_number: 'desc',
      },
    })

    if (!currentRound) {
      return NextResponse.json({ error: 'No active round' }, { status: 404 })
    }

    // Don't send the correct answer to the client
    const { correct_option, ...questionWithoutAnswer } = currentRound.question || {}

    return NextResponse.json({
      round: {
        ...currentRound,
        question: questionWithoutAnswer,
      },
    })
  } catch (error) {
    console.error('Get round error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new round (called internally or by host)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code, round_number } = body

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

    // Check if game is active
    if (game.status !== 'active') {
      return NextResponse.json(
        { error: 'Game is not active' },
        { status: 400 }
      )
    }

    // Close any existing active rounds
    await prisma.gameRound.updateMany({
      where: {
        game_id: game.id,
        finished_at: null,
      },
      data: {
        finished_at: new Date(),
      },
    })

    // Get a random question that hasn't been used in this game
    const usedQuestionIds = await prisma.gameRound.findMany({
      where: { game_id: game.id },
      select: { question_id: true },
    })

    const usedIds = usedQuestionIds.map((r) => r.question_id).filter(Boolean)

    // Get all available questions that haven't been used in this game
    // Prioritize questions that have been used less frequently
    const availableQuestions = await prisma.question.findMany({
      where: {
        id: {
          notIn: usedIds as number[],
        },
      },
      orderBy: [
        { times_used: 'asc' }, // Prioritize least used questions
        { last_used_at: 'asc' }, // Then prioritize questions used longest ago
      ],
      take: 50, // Get top 50 least used questions
    })

    if (availableQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No more questions available' },
        { status: 404 }
      )
    }

    // Randomly select one from the available questions
    const randomIndex = Math.floor(Math.random() * availableQuestions.length)
    const randomQuestion = availableQuestions[randomIndex]

    // Update question usage tracking
    await prisma.question.update({
      where: { id: randomQuestion.id },
      data: {
        times_used: { increment: 1 },
        last_used_at: new Date(),
      },
    })

    // Create new round
    const newRound = await prisma.gameRound.create({
      data: {
        game_id: game.id,
        round_number: round_number || 1,
        question_id: randomQuestion.id,
        started_at: new Date(),
      },
      include: {
        question: true,
      },
    })

    // Open prediction pool after question 5 (when creating question 6)
    if (round_number === 6) {
      try {
        // Check if prediction pool already exists
        const existingPool = await prisma.predictionPool.findUnique({
          where: { game_id: game.id },
        })

        if (!existingPool) {
          console.log('🎯 Opening prediction pool after question 5 completed...')

          // Get active players
          const activePlayers = await prisma.gamePlayer.findMany({
            where: {
              game_id: game.id,
              status: { not: 'eliminated' },
            },
            include: {
              user: true,
            },
          })

          // Get player wallet addresses for blockchain
          const playerAddresses = activePlayers
            .map(p => p.user?.wallet_address)
            .filter(Boolean) as string[]

          if (playerAddresses.length === 0) {
            console.log('⚠️ No active players with wallets, skipping prediction pool')
          } else {
            // Generate blockchain game ID
            const { ethers } = await import('ethers')
            const blockchainGameId = ethers.keccak256(ethers.toUtf8Bytes(game.room_code!))

            // Open prediction pool on blockchain
            let blockchainTxHash: string | null = null
            try {
              const { backendPredictionService } = await import('@/services/backendPredictionService')
              await backendPredictionService.initialize()

              const result = await backendPredictionService.openPredictionPool(
                game.room_code!,
                playerAddresses
              )
              blockchainTxHash = result.txHash
              console.log('✅ Prediction pool opened on blockchain:', blockchainTxHash)
            } catch (blockchainErr: any) {
              console.error('⚠️ Failed to open prediction pool on blockchain:', blockchainErr)
              // Continue anyway - we'll still create the database record
            }

            // Create prediction pool in database
            await prisma.predictionPool.create({
              data: {
                game_id: game.id,
                blockchain_game_id: blockchainGameId,
                opened_at: new Date(),
              },
            })

            console.log('✅ Prediction pool created in database')
          }
        }
      } catch (err) {
        console.error('❌ Failed to open prediction pool:', err)
        // Don't fail the round creation if prediction pool fails
      }
    }

    // Don't send the correct answer
    const { correct_option, ...questionWithoutAnswer } = newRound.question || {}

    return NextResponse.json({
      round: {
        ...newRound,
        question: questionWithoutAnswer,
      },
    })
  } catch (error) {
    console.error('Create round error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
