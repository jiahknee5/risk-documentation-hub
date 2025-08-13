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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, semantic, exact
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query.trim()) {
      return NextResponse.json({ results: [] })
    }

    let searchResults: any[] = []

    if (type === 'all' || type === 'exact') {
      // Full-text search across multiple fields
      const documents = await prisma.document.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { tags: { contains: query, mode: 'insensitive' } },
            { summary: { contains: query, mode: 'insensitive' } },
            { keyPoints: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true, department: true }
          }
        },
        orderBy: [
          // Prioritize title matches
          { title: 'desc' },
          { createdAt: 'desc' }
        ]
      })

      searchResults = documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        riskLevel: doc.riskLevel,
        complianceStatus: doc.complianceStatus,
        createdAt: doc.createdAt,
        user: doc.user,
        relevanceScore: calculateRelevanceScore(doc, query),
        matchType: getMatchType(doc, query)
      }))
    }

    // Sort by relevance score
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Log search activity
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SEARCH_PERFORMED',
        details: JSON.stringify({
          query,
          type,
          resultsCount: searchResults.length
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      query,
      results: searchResults,
      total: searchResults.length
    })
  } catch (error) {
    console.error('Error performing search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateRelevanceScore(document: any, query: string): number {
  let score = 0
  const queryLower = query.toLowerCase()

  // Title matches get highest score
  if (document.title?.toLowerCase().includes(queryLower)) {
    score += 10
    // Exact title match gets even more points
    if (document.title?.toLowerCase() === queryLower) {
      score += 20
    }
  }

  // Description matches
  if (document.description?.toLowerCase().includes(queryLower)) {
    score += 5
  }

  // Content matches (but less important due to potential noise)
  if (document.content?.toLowerCase().includes(queryLower)) {
    score += 2
  }

  // Summary matches (AI-generated, likely relevant)
  if (document.summary?.toLowerCase().includes(queryLower)) {
    score += 7
  }

  // Tag matches
  if (document.tags?.toLowerCase().includes(queryLower)) {
    score += 8
  }

  // Key points matches
  if (document.keyPoints?.toLowerCase().includes(queryLower)) {
    score += 6
  }

  // Boost score for recent documents
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(document.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSinceCreated < 30) {
    score += 2
  }

  // Boost score for high-risk documents (more likely to be important)
  if (document.riskLevel === 'CRITICAL') {
    score += 3
  } else if (document.riskLevel === 'HIGH') {
    score += 2
  }

  return score
}

function getMatchType(document: any, query: string): string {
  const queryLower = query.toLowerCase()

  if (document.title?.toLowerCase().includes(queryLower)) {
    return 'title'
  }
  if (document.description?.toLowerCase().includes(queryLower)) {
    return 'description'
  }
  if (document.summary?.toLowerCase().includes(queryLower)) {
    return 'summary'
  }
  if (document.tags?.toLowerCase().includes(queryLower)) {
    return 'tags'
  }
  if (document.keyPoints?.toLowerCase().includes(queryLower)) {
    return 'key_points'
  }
  if (document.content?.toLowerCase().includes(queryLower)) {
    return 'content'
  }

  return 'unknown'
}

// Advanced search with filters
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      query,
      filters = {},
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = body

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    // Add text search
    if (query && query.trim()) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { tags: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } }
      ]
    }

    // Add filters
    if (filters.category) {
      where.category = filters.category
    }
    if (filters.riskLevel) {
      where.riskLevel = filters.riskLevel
    }
    if (filters.complianceStatus) {
      where.complianceStatus = filters.complianceStatus
    }
    if (filters.department) {
      where.user = {
        department: filters.department
      }
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo)
      }
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'title') {
      orderBy = { title: sortOrder }
    } else if (sortBy === 'date') {
      orderBy = { createdAt: sortOrder }
    } else if (sortBy === 'risk') {
      orderBy = { riskLevel: sortOrder }
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: { id: true, name: true, email: true, department: true }
          }
        }
      }),
      prisma.document.count({ where })
    ])

    // Calculate relevance scores if query provided
    let results = documents
    if (query && query.trim()) {
      results = documents.map(doc => ({
        ...doc,
        relevanceScore: calculateRelevanceScore(doc, query),
        matchType: getMatchType(doc, query)
      }))

      if (sortBy === 'relevance') {
        results.sort((a, b) => b.relevanceScore - a.relevanceScore)
      }
    }

    // Log advanced search
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SEARCH_PERFORMED',
        details: JSON.stringify({
          query,
          filters,
          sortBy,
          resultsCount: results.length
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error performing advanced search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}