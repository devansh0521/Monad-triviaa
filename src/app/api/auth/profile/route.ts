import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_address = searchParams.get('wallet_address')

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { wallet_address: wallet_address.toLowerCase() },
      include: {
        avatar: true,
        leaderboards: true,
        achievements: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, username, avatar_id } = body

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { wallet_address: wallet_address.toLowerCase() },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (username !== undefined) updateData.username = username
    if (avatar_id !== undefined) updateData.avatar_id = avatar_id

    // Update user
    const user = await prisma.user.update({
      where: { wallet_address: wallet_address.toLowerCase() },
      data: updateData,
      include: {
        avatar: true,
        leaderboards: true,
      },
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
