import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  console.log('[Documents List] Fetching documents...')
  
  try {
    // Simple query without authentication check or complex relations
    const documents = await prisma.document.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        riskLevel: true,
        fileName: true,
        fileSize: true,
        createdAt: true,
        uploadedBy: true,
        tags: true
      }
    })
    
    console.log(`[Documents List] Found ${documents.length} documents`)
    
    return NextResponse.json({
      success: true,
      documents: documents,
      count: documents.length
    })
  } catch (error) {
    console.error('[Documents List] Error:', error)
    
    // If database error, return empty list
    if (error instanceof Error && error.message.includes('no such table')) {
      console.log('[Documents List] Database not initialized, returning empty list')
      return NextResponse.json({
        success: true,
        documents: [],
        count: 0,
        error: 'Database not initialized'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch documents',
      documents: []
    }, { status: 500 })
  }
}