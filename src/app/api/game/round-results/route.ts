import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get results for a finished round (for spectators)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const room_code = searchParams.get('room_code')
    const round_number = searchParams.get('round_number')

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

    // Get the round (current or specific round number)
    const whereClause: any = { game_id: game.id }

    if (round_number) {
      whereClause.round_number = parseInt(round_number)
    } else {
      // Get most recent round
      whereClause.finished_at = { not: null }
    }

    const round = await prisma.gameRound.findFirst({
      where: whereClause,
      include: {
        question: true,
        answers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                wallet_address: true,
              },
            },
          },
        },
      },
      orderBy: {
        round_number: 'desc',
      },
    })

    if (!round) {
      return NextResponse.json({ error: 'No round found' }, { status: 404 })
    }

    // For finished rounds, include the correct answer
    const roundData = {
      ...round,
      question: round.question,
      answers: round.answers.map((answer) => ({
        user_id: answer.user_id,
        username: answer.user?.username || null,
        wallet_address: answer.user?.wallet_address || null,
        selected_option: answer.selected_option,
        is_correct: answer.is_correct,
        answer_time_ms: answer.answer_time_ms,
      })),
    }

    return NextResponse.json({
      round: roundData,
      is_finished: round.finished_at !== null,
    })
  } catch (error) {
    console.error('Get round results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
