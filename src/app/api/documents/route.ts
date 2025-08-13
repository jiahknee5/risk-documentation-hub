import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { buildSearchQuery, SearchFilters } from '@/lib/utils'

// GET /api/documents - List documents with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const riskLevel = searchParams.get('riskLevel') || ''
    const complianceStatus = searchParams.get('complianceStatus') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build search filters
    const filters: SearchFilters = {}
    if (category) filters.category = category
    if (riskLevel) filters.riskLevel = riskLevel
    if (complianceStatus) filters.complianceStatus = complianceStatus

    const where = {
      ...buildSearchQuery(filters),
      isActive: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { tags: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, name: true, email: true, department: true }
          },
          approver: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: {
              versions: true,
              comments: true,
              auditLogs: true
            }
          }
        }
      }),
      prisma.document.count({ where })
    ])

    // Log search activity
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SEARCH_PERFORMED',
        details: JSON.stringify({
          search,
          filters: { category, riskLevel, complianceStatus },
          resultsCount: documents.length
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Create new document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      subCategory,
      riskLevel,
      tags,
      filePath,
      fileName,
      fileSize,
      mimeType,
      content,
      expiryDate
    } = body

    // Validate required fields
    if (!title || !category || !riskLevel || !filePath || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        title,
        description,
        category,
        subCategory,
        riskLevel,
        tags: tags ? JSON.stringify(tags) : null,
        filePath,
        fileName,
        fileSize: fileSize || 0,
        mimeType: mimeType || 'application/octet-stream',
        content,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        uploadedBy: session.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, department: true }
        }
      }
    })

    // Log document creation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        documentId: document.id,
        action: 'DOCUMENT_UPLOAD',
        details: JSON.stringify({
          title,
          category,
          riskLevel,
          fileSize
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}