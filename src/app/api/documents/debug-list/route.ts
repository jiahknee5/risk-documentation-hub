import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  console.log('[Debug Documents List] Starting...')
  
  try {
    // First, check if we can connect to the database
    const count = await prisma.document.count()
    console.log(`[Debug Documents List] Total documents in DB: ${count}`)
    
    // Get all documents without any filters to debug
    const allDocuments = await prisma.document.findMany({
      take: 100, // Limit to 100 for safety
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`[Debug Documents List] Retrieved ${allDocuments.length} documents`)
    console.log('[Debug Documents List] Sample document:', allDocuments[0])
    
    // Also check active vs inactive
    const activeCount = await prisma.document.count({
      where: { isActive: true }
    })
    const inactiveCount = await prisma.document.count({
      where: { isActive: false }
    })
    
    return NextResponse.json({
      success: true,
      debug: {
        totalCount: count,
        activeCount,
        inactiveCount,
        retrievedCount: allDocuments.length,
        hasDocuments: count > 0
      },
      documents: allDocuments.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        riskLevel: doc.riskLevel,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        createdAt: doc.createdAt,
        isActive: doc.isActive,
        uploadedBy: doc.uploadedBy,
        tags: doc.tags
      }))
    })
  } catch (error) {
    console.error('[Debug Documents List] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name,
      errorStack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}