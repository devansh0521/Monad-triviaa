import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode: rawRoomCode } = await params
    const roomCode = rawRoomCode.toUpperCase()

    const game = await prisma.game.findUnique({
      where: { room_code: roomCode },
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
          orderBy: {
            join_time: 'asc',
          },
        },
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json({ game })
  } catch (error) {
    console.error('Get game error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Leave game room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { roomCode: rawRoomCode } = await params
    const roomCode = rawRoomCode.toUpperCase()

    const game = await prisma.game.findUnique({
      where: { room_code: roomCode },
      include: {
        gamePlayers: {
          orderBy: {
            join_time: 'asc',
          },
        },
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const userId = parseInt(user_id)
    const isHost = game.host_user_id === userId

    // If the user is the host
    if (isHost) {
      const otherPlayers = game.gamePlayers

      // If no other players, delete the entire game
      if (otherPlayers.length === 0) {
        await prisma.game.delete({
          where: { id: game.id },
        })

        return NextResponse.json({
          message: 'Game room deleted successfully',
        })
      }

      // If there are other players, transfer host to the first player
      const newHost = otherPlayers[0]

      // Remove the new host from gamePlayers and make them the host
      await prisma.gamePlayer.delete({
        where: { id: newHost.id },
      })

      // Update game with new host and player count
      await prisma.game.update({
        where: { id: game.id },
        data: {
          host_user_id: newHost.user_id,
          player_count: otherPlayers.length - 1,
        },
      })

      return NextResponse.json({
        message: 'Host transferred and left successfully',
      })
    }

    // If the user is a regular player (not host)
    const deletedPlayer = await prisma.gamePlayer.deleteMany({
      where: {
        game_id: game.id,
        user_id: userId,
      },
    })

    if (deletedPlayer.count === 0) {
      return NextResponse.json(
        { error: 'Player not found in this game' },
        { status: 404 }
      )
    }

    // Update player count
    const remainingPlayers = await prisma.gamePlayer.count({
      where: { game_id: game.id },
    })

    await prisma.game.update({
      where: { id: game.id },
      data: {
        player_count: remainingPlayers,
      },
    })

    return NextResponse.json({
      message: 'Successfully left the game',
    })
  } catch (error) {
    console.error('Leave game error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
