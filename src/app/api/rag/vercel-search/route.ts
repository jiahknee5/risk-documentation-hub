import { NextRequest, NextResponse } from 'next/server'
import { LightweightBankingRAG } from '@/lib/rag/lightweight-search'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Initialize RAG (will be cached by Vercel)
const rag = new LightweightBankingRAG()
let initialized = false

async function initializeRAG() {
  if (initialized) return
  
  try {
    // Load all documents into memory (for small datasets)
    const documents = await prisma.document.findMany({
      where: { isActive: true },
      take: 1000, // Limit for memory
      orderBy: { createdAt: 'desc' }
    })
    
    // Clear existing documents
    rag.clear()
    
    // Process each document
    documents.forEach(doc => {
      rag.processDocument({
        id: doc.id,
        title: doc.title,
        content: `${doc.title} ${doc.description || ''} ${doc.tags || ''}`,
        description: doc.description || undefined,
        tags: doc.tags || undefined,
        category: doc.category || undefined,
        createdAt: doc.createdAt,
        fileName: doc.fileName || undefined,
        fileSize: doc.fileSize || undefined
      })
    })
    
    initialized = true
    console.log(`Initialized RAG with ${documents.length} documents`)
  } catch (error) {
    console.error('Failed to initialize RAG:', error)
    throw error
  }
}

// Force re-initialization when documents change
export async function reinitializeRAG() {
  initialized = false
  await initializeRAG()
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await initializeRAG()
    
    const body = await request.json()
    const { query, filters } = body
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }
    
    // Perform search
    const results = rag.search(query, filters)
    
    // Generate summary
    const summary = rag.generateSummary(results.slice(0, 10))
    
    // Get alerts
    const alerts = rag.getAlerts(results)
    
    // Format response to match enhanced search page expectations
    const formattedResults = results.slice(0, 20).map(result => ({
      id: result.document.id,
      title: result.document.title,
      description: result.document.description || result.document.content?.substring(0, 200) || '',
      category: result.document.category,
      tags: result.document.tags,
      fileName: result.document.fileName,
      fileSize: result.document.fileSize,
      createdAt: result.document.createdAt,
      score: result.score,
      riskLevel: result.document.riskLevel,
      riskInsights: result.riskInsights,
      compliance: result.document.compliance,
      riskScores: result.document.riskScores
    }))
    
    return NextResponse.json({
      results: formattedResults,
      riskSummary: summary,
      alerts,
      searchType: 'vercel_optimized_rag',
      documentCount: rag.getDocumentCount()
    })
    
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { 
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await initializeRAG()
    
    return NextResponse.json({
      status: 'ready',
      documentCount: rag.getDocumentCount(),
      searchType: 'vercel_optimized_rag'
    })
    
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { 
        error: 'Status check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}