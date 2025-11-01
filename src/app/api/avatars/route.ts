import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all available avatars
export async function GET(request: NextRequest) {
  try {
    const avatars = await prisma.avatar.findMany({
      where: { available: true },
      orderBy: { id: 'asc' },
    })

    return NextResponse.json({ avatars })
  } catch (error) {
    console.error('Avatars fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
