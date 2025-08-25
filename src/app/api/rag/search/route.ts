import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { LightweightBankingRAG } from '@/lib/rag/lightweight-search'
import { getAIProvider, createRiskManagementPrompt } from '@/lib/ai-providers'

// Initialize RAG system and AI provider
const ragSystem = new LightweightBankingRAG()
const aiProvider = getAIProvider()

// Load all documents into RAG on startup
async function initializeRAG() {
  try {
    const documents = await prisma.document.findMany({
      where: {
        isActive: true,
        isProcessed: true
      }
    })

    for (const doc of documents) {
      ragSystem.processDocument({
        id: doc.id,
        title: doc.title,
        content: doc.content || `${doc.title} ${doc.description} ${doc.tags}`,
        description: doc.description || undefined,
        tags: doc.tags || undefined,
        category: doc.category || undefined,
        createdAt: doc.createdAt,
        fileName: doc.fileName || undefined,
        fileSize: doc.fileSize || undefined,
        riskLevel: doc.riskLevel || undefined
      })
    }
    
    console.log(`Initialized RAG with ${documents.length} documents`)
  } catch (error) {
    console.error('Failed to initialize RAG:', error)
  }
}

// Initialize on server start
initializeRAG()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query, filters, useAI = true } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Perform RAG search
    const searchResults = ragSystem.search(query, {
      riskLevel: filters?.riskLevel,
      compliance: filters?.compliance,
      dateRange: filters?.dateRange
    })

    // Get alerts for the results
    const alerts = ragSystem.getAlerts(searchResults)

    // Generate summary
    const summary = ragSystem.generateSummary(searchResults)

    // If AI is enabled, generate enhanced response
    let aiResponse = null
    if (useAI && searchResults.length > 0) {
      try {
        // Prepare context from search results
        const context = searchResults
          .slice(0, 5) // Top 5 results
          .map(result => {
            const doc = result.document
            return `Document: ${doc.title}
Category: ${doc.category}
Risk Level: ${doc.riskLevel}
Content: ${doc.content?.substring(0, 500)}...
Risk Insights: ${result.riskInsights?.topRisks.join(', ') || 'N/A'}`
          })
          .join('\n\n---\n\n')

        // Generate AI response using configured provider
        const messages = createRiskManagementPrompt(context, query)
        aiResponse = await aiProvider.generateResponse(messages, {
          temperature: 0.3,
          maxTokens: 500
        })
      } catch (aiError) {
        console.error('AI generation failed:', aiError)
        // Continue without AI response
      }
    }

    // Log search activity
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SEARCH_PERFORMED',
        details: JSON.stringify({
          query,
          filters,
          resultsCount: searchResults.length,
          ragType: 'banking-risk',
          hasAIResponse: !!aiResponse
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    // Transform search results for response
    const results = searchResults.map(result => ({
      id: result.document.id,
      title: result.document.title,
      description: result.document.description,
      category: result.document.category,
      riskLevel: result.document.riskLevel,
      compliance: result.document.compliance,
      fileName: result.document.fileName,
      fileSize: result.document.fileSize,
      createdAt: result.document.createdAt,
      score: result.score,
      riskRelevance: result.riskRelevance,
      riskInsights: result.riskInsights,
      riskScores: result.document.riskScores,
      excerpt: result.document.content?.substring(0, 200) + '...'
    }))

    return NextResponse.json({
      query,
      results,
      total: results.length,
      alerts,
      summary,
      aiResponse,
      ragInfo: {
        type: 'Hybrid Banking RAG',
        features: [
          'Semantic search with banking terminology',
          'Risk level assessment',
          'Compliance framework detection',
          `AI-enhanced responses (${aiProvider.name})`,
          'Real-time alerts'
        ]
      }
    })
  } catch (error) {
    console.error('RAG search error:', error)
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Re-export initialization for other endpoints
export { initializeRAG }