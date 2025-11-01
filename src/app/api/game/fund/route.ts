import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code, user_id, tx_hash } = body

    // Validate required fields
    if (!room_code || !user_id || !tx_hash) {
      return NextResponse.json(
        { error: 'Room code, user ID, and transaction hash are required' },
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

    // Check if game is in correct state
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already started or finished' },
        { status: 400 }
      )
    }

    const userId = parseInt(user_id)
    const isHost = game.host_user_id === userId

    // Handle host funding
    if (isHost) {
      if (game.host_funded) {
        return NextResponse.json(
          { error: 'Host has already funded' },
          { status: 400 }
        )
      }

      // Update host funded status
      await prisma.game.update({
        where: { id: game.id },
        data: {
          host_funded: true,
          host_funded_tx_hash: tx_hash,
        },
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          game_id: game.id,
          user_id: userId,
          amount: game.entry_fee,
          tx_hash: tx_hash,
          confirmed: true,
          type: 'entry_fee',
        },
      })
    } else {
      // Handle regular player funding
      const gamePlayer = await prisma.gamePlayer.findFirst({
        where: {
          game_id: game.id,
          user_id: userId,
        },
      })

      if (!gamePlayer) {
        return NextResponse.json(
          { error: 'Player not found in this game' },
          { status: 404 }
        )
      }

      if (gamePlayer.funded) {
        return NextResponse.json(
          { error: 'Player has already funded' },
          { status: 400 }
        )
      }

      // Update player funded status
      await prisma.gamePlayer.update({
        where: { id: gamePlayer.id },
        data: {
          funded: true,
          funded_tx_hash: tx_hash,
        },
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          game_id: game.id,
          user_id: userId,
          amount: game.entry_fee,
          tx_hash: tx_hash,
          confirmed: true,
          type: 'entry_fee',
        },
      })
    }

    // Check if all players have funded
    const updatedGame = await prisma.game.findUnique({
      where: { id: game.id },
      include: {
        gamePlayers: true,
      },
    })

    if (!updatedGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const allPlayersFunded = updatedGame.gamePlayers.every((p) => p.funded)
    const hostFunded = updatedGame.host_funded
    const allFunded = allPlayersFunded && hostFunded

    // Update pool amount if all funded
    if (allFunded && updatedGame.entry_fee) {
      const totalPlayers = updatedGame.gamePlayers.length + 1 // +1 for host
      const poolAmount = Number(updatedGame.entry_fee) * totalPlayers

      await prisma.game.update({
        where: { id: game.id },
        data: {
          pool_amount: poolAmount,
          status: allFunded ? 'funded' : 'waiting',
        },
      })
    }

    return NextResponse.json({
      message: 'Successfully funded the pool',
      allFunded,
    })
  } catch (error) {
    console.error('Fund pool error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
