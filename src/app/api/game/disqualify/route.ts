import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { backendContractService } from '@/services/backendContractService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_code, user_id, reason } = body

    if (!room_code || !user_id) {
      return NextResponse.json(
        { error: 'Room code and user ID are required' },
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

    // Mark player as eliminated
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

    // Get current active players (not eliminated)
    const activePlayers = await prisma.gamePlayer.findMany({
      where: {
        game_id: game.id,
        status: { not: 'eliminated' },
      },
      include: {
        user: true,
      },
    })

    console.log(`Player ${user_id} disqualified. Active players remaining: ${activePlayers.length}`)

    // SCENARIO 1: Only 2 players total, one got disqualified -> other wins immediately
    if (game.player_count === 2) {
      console.log('2-player game: Declaring remaining player as winner')

      const winner = activePlayers[0]

      // Update game status to finished
      await prisma.game.update({
        where: { id: game.id },
        data: {
          status: 'finished',
          finished_at: new Date(),
          winner_user_id: winner.user_id,
        },
      })

      // Update winner's leaderboard stats
      await updateLeaderboard(winner.user_id!, game.pool_amount || 0)

      // Send prize to winner via smart contract (BACKEND - RELIABLE)
      if (winner.user && winner.user.wallet_address) {
        try {
          await backendContractService.initialize()
          const result = await backendContractService.setWinner(room_code, winner.user.wallet_address)
          console.log('✅ Winner prize sent via smart contract. TX:', result.txHash)

          // Update game to mark tokens as sent
          await prisma.game.update({
            where: { id: game.id },
            data: { tokens_sent: true },
          })
        } catch (contractErr) {
          console.error('❌ Failed to send prize via contract:', contractErr)

          // Log the error
          await prisma.eventLog.create({
            data: {
              game_id: game.id,
              event_type: 'prize_distribution_failed',
              details: {
                room_code: room_code,
                winner_wallet: winner.user.wallet_address,
                error: String(contractErr),
              },
            },
          })
        }
      }

      return NextResponse.json({
        message: 'Player disqualified',
        game_ended: true,
        winner_user_id: winner.user_id,
        winner_wallet_address: winner.user?.wallet_address,
        winner_is_host: winner.user_id === game.host_user_id,
      })
    }

    // SCENARIO 2: More than 2 players - game continues with remaining players
    // If only 1 player left after disqualification, they win
    if (activePlayers.length === 1) {
      console.log('Only 1 player remaining after disqualification: Declaring winner')

      const winner = activePlayers[0]

      // Update game status to finished
      await prisma.game.update({
        where: { id: game.id },
        data: {
          status: 'finished',
          finished_at: new Date(),
          winner_user_id: winner.user_id,
        },
      })

      // Update winner's leaderboard stats
      await updateLeaderboard(winner.user_id!, game.pool_amount || 0)

      // Send prize to winner via smart contract (BACKEND - RELIABLE)
      if (winner.user && winner.user.wallet_address) {
        try {
          await backendContractService.initialize()
          const result = await backendContractService.setWinner(room_code, winner.user.wallet_address)
          console.log('✅ Winner prize sent via smart contract. TX:', result.txHash)

          // Update game to mark tokens as sent
          await prisma.game.update({
            where: { id: game.id },
            data: { tokens_sent: true },
          })
        } catch (contractErr) {
          console.error('❌ Failed to send prize via contract:', contractErr)

          // Log the error
          await prisma.eventLog.create({
            data: {
              game_id: game.id,
              event_type: 'prize_distribution_failed',
              details: {
                room_code: room_code,
                winner_wallet: winner.user.wallet_address,
                error: String(contractErr),
              },
            },
          })
        }
      }

      return NextResponse.json({
        message: 'Player disqualified',
        game_ended: true,
        winner_user_id: winner.user_id,
        winner_wallet_address: winner.user?.wallet_address,
        winner_is_host: winner.user_id === game.host_user_id,
      })
    }

    // Game continues with remaining players
    return NextResponse.json({
      message: 'Player disqualified, game continues',
      game_ended: false,
      active_players_count: activePlayers.length,
    })
  } catch (error) {
    console.error('Disqualify player error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to update leaderboard
async function updateLeaderboard(userId: number, earnings: number | bigint) {
  try {
    const leaderboard = await prisma.leaderboard.findUnique({
      where: { user_id: userId },
    })

    if (leaderboard) {
      await prisma.leaderboard.update({
        where: { user_id: userId },
        data: {
          total_wins: { increment: 1 },
          total_games: { increment: 1 },
          total_earnings: { increment: Number(earnings) },
          total_streak: { increment: 1 },
        },
      })
    } else {
      await prisma.leaderboard.create({
        data: {
          user_id: userId,
          total_wins: 1,
          total_games: 1,
          total_earnings: Number(earnings),
          total_streak: 1,
        },
      })
    }
  } catch (err) {
    console.error('Update leaderboard error:', err)
  }
}
