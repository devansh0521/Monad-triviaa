import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code, user_id, round_id, selected_option, answer_time_ms } = body

    // Validate required fields
    if (!room_code || !user_id || !round_id || !selected_option) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Get the round with question
    const round = await prisma.gameRound.findUnique({
      where: { id: round_id },
      include: { question: true },
    })

    if (!round || !round.question) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }

    // Check if round is still active
    if (round.finished_at) {
      return NextResponse.json(
        { error: 'Round has already finished' },
        { status: 400 }
      )
    }

    // Check if user already answered
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        round_id: round_id,
        user_id: parseInt(user_id),
      },
    })

    if (existingAnswer) {
      return NextResponse.json(
        { error: 'Already answered this question' },
        { status: 400 }
      )
    }

    // Check if answer is correct
    const isCorrect = selected_option === round.question.correct_option

    // Save the answer
    const answer = await prisma.answer.create({
      data: {
        round_id: round_id,
        user_id: parseInt(user_id),
        selected_option: selected_option,
        is_correct: isCorrect,
        answer_time_ms: answer_time_ms || 0,
        submitted_at: new Date(),
      },
    })

    // Update player stats if correct
    if (isCorrect) {
      await prisma.$executeRaw`
        UPDATE "GamePlayer"
        SET final_correct = final_correct + 1,
            final_time_ms = final_time_ms + ${answer_time_ms || 0}
        WHERE game_id = ${game.id} AND user_id = ${parseInt(user_id)}
      `
    } else {
      // In Battle Royale mode, mark player as eliminated
      if (game.mode === 'battle_royale') {
        await prisma.gamePlayer.updateMany({
          where: {
            game_id: game.id,
            user_id: parseInt(user_id),
          },
          data: {
            status: 'eliminated',
            elimination_time: new Date(),
          },
        })
      }
    }

    return NextResponse.json({
      answer,
      is_correct: isCorrect,
      correct_option: round.question.correct_option, // Reveal correct answer after submission
    })
  } catch (error) {
    console.error('Submit answer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
