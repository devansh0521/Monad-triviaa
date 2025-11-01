import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ethers } from 'ethers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, signature, message } = body

    // Validate required fields
    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Verify signature if provided (for security)
    if (signature && message) {
      try {
        const recoveredAddress = ethers.verifyMessage(message, signature)
        if (recoveredAddress.toLowerCase() !== wallet_address.toLowerCase()) {
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          )
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Signature verification failed' },
          { status: 401 }
        )
      }
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { wallet_address: wallet_address.toLowerCase() },
      include: {
        avatar: true,
        leaderboards: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', shouldRegister: true },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Login successful',
      user,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
