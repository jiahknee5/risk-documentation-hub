import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all unprocessed documents for the user
    const unprocessedDocuments = await prisma.document.findMany({
      where: {
        userId: session.user.id,
        isProcessed: false,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      unprocessedIds: unprocessedDocuments.map(doc => doc.id),
      unprocessedDocuments: unprocessedDocuments,
      count: unprocessedDocuments.length
    })
  } catch (error) {
    console.error('Error fetching unprocessed documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}