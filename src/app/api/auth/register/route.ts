import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ethers } from 'ethers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, username, avatar_id, signature, message } = body

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { wallet_address: wallet_address.toLowerCase() },
      include: {
        avatar: true,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists', user: existingUser },
        { status: 409 }
      )
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        wallet_address: wallet_address.toLowerCase(),
        username: username || null,
        avatar_id: avatar_id || null,
      },
      include: {
        avatar: true,
      },
    })

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
