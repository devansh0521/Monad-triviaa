import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userIdInt = parseInt(userId)

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
      include: {
        avatar: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get leaderboard stats
    const leaderboard = await prisma.leaderboard.findUnique({
      where: { user_id: userIdInt },
    })

    // Get all games where user was host
    const hostedGames = await prisma.game.findMany({
      where: { host_user_id: userIdInt },
      include: {
        payments: {
          where: { user_id: userIdInt },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    // Get all games where user was a player
    const playerGames = await prisma.gamePlayer.findMany({
      where: { user_id: userIdInt },
      include: {
        game: {
          include: {
            payments: {
              where: { user_id: userIdInt },
            },
          },
        },
      },
      orderBy: { join_time: 'desc' },
    })

    // Combine all games
    const allGamesMap = new Map()

    // Add hosted games
    hostedGames.forEach((game) => {
      allGamesMap.set(game.id, {
        id: game.id,
        room_code: game.room_code,
        mode: game.mode,
        status: game.status,
        entry_fee: game.entry_fee,
        pool_amount: game.pool_amount,
        created_at: game.created_at,
        finished_at: game.finished_at,
        is_host: true,
        is_winner: game.winner_user_id === userIdInt,
        payment: game.payments[0] || null,
      })
    })

    // Add player games
    playerGames.forEach((gp) => {
      if (!allGamesMap.has(gp.game_id) && gp.game) {
        allGamesMap.set(gp.game_id, {
          id: gp.game.id,
          room_code: gp.game.room_code,
          mode: gp.game.mode,
          status: gp.game.status,
          entry_fee: gp.game.entry_fee,
          pool_amount: gp.game.pool_amount,
          created_at: gp.game.created_at,
          finished_at: gp.game.finished_at,
          is_host: false,
          is_winner: gp.game.winner_user_id === userIdInt,
          payment: gp.game.payments[0] || null,
        })
      }
    })

    const allGames = Array.from(allGamesMap.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Calculate total stats
    const totalGames = allGames.length
    const totalWins = allGames.filter((g) => g.is_winner).length
    const totalLosses = allGames.filter(
      (g) => g.status === 'finished' && !g.is_winner
    ).length

    // Calculate total staked (entry fees paid)
    const totalStaked = allGames.reduce((sum, game) => {
      if (game.payment && game.payment.type === 'entry_fee') {
        return sum + Number(game.payment.amount)
      }
      return sum
    }, 0)

    // Calculate total earnings (from leaderboard)
    const totalEarnings = leaderboard
      ? Number(leaderboard.total_earnings)
      : 0

    // Calculate profit/loss
    const profitLoss = totalEarnings - totalStaked

    // Get recent games (last 10)
    const recentGames = allGames.slice(0, 10)

    // Get pending games (waiting or active)
    const activeGames = allGames.filter(
      (g) => g.status === 'waiting' || g.status === 'active' || g.status === 'funded'
    )

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        wallet_address: user.wallet_address,
        avatar: user.avatar,
        premium: user.premium,
      },
      stats: {
        total_games: totalGames,
        total_wins: totalWins,
        total_losses: totalLosses,
        win_rate:
          totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0.0',
        total_staked: totalStaked.toFixed(4),
        total_earnings: totalEarnings.toFixed(4),
        profit_loss: profitLoss.toFixed(4),
        current_streak: leaderboard?.total_streak || 0,
      },
      recent_games: recentGames,
      active_games: activeGames,
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
