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

    // Only admins and managers can view audit logs
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const documentId = searchParams.get('documentId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (action) {
      where.action = action
    }

    if (userId) {
      where.userId = userId
    }

    if (documentId) {
      where.documentId = documentId
    }

    if (dateFrom || dateTo) {
      where.timestamp = {}
      if (dateFrom) {
        where.timestamp.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.timestamp.lte = new Date(dateTo)
      }
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, department: true }
          },
          document: {
            select: { id: true, title: true, category: true }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ])

    return NextResponse.json({
      auditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export audit report
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can export audit reports
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { dateFrom, dateTo, actions, userIds, documentIds } = body

    // Build where clause for export
    const where: any = {}

    if (dateFrom || dateTo) {
      where.timestamp = {}
      if (dateFrom) {
        where.timestamp.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.timestamp.lte = new Date(dateTo)
      }
    }

    if (actions && actions.length > 0) {
      where.action = { in: actions }
    }

    if (userIds && userIds.length > 0) {
      where.userId = { in: userIds }
    }

    if (documentIds && documentIds.length > 0) {
      where.documentId = { in: documentIds }
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, department: true }
        },
        document: {
          select: { id: true, title: true, category: true }
        }
      }
    })

    // Generate summary statistics
    const summary = {
      totalEvents: auditLogs.length,
      uniqueUsers: new Set(auditLogs.map(log => log.userId).filter(Boolean)).size,
      uniqueDocuments: new Set(auditLogs.map(log => log.documentId).filter(Boolean)).size,
      actionBreakdown: auditLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      timeRange: {
        from: dateFrom || auditLogs[auditLogs.length - 1]?.timestamp,
        to: dateTo || auditLogs[0]?.timestamp
      }
    }

    // Log the audit export
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'AUDIT_EXPORT' as any,
        details: JSON.stringify({
          filters: { dateFrom, dateTo, actions, userIds, documentIds },
          recordsExported: auditLogs.length
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      summary,
      auditLogs,
      exportedAt: new Date(),
      exportedBy: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      }
    })
  } catch (error) {
    console.error('Error exporting audit report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}