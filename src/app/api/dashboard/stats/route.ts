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

    // Get document statistics
    const [
      totalDocuments,
      pendingApprovals,
      expiringSoon,
      criticalRisk,
      recentUploads,
      approvedDocuments
    ] = await Promise.all([
      // Total active documents
      prisma.document.count({
        where: { isActive: true }
      }),
      
      // Documents pending approval
      prisma.document.count({
        where: {
          isActive: true,
          complianceStatus: 'PENDING'
        }
      }),
      
      // Documents expiring in next 30 days
      prisma.document.count({
        where: {
          isActive: true,
          expiryDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Critical risk documents
      prisma.document.count({
        where: {
          isActive: true,
          riskLevel: 'CRITICAL'
        }
      }),
      
      // Documents uploaded in last 7 days
      prisma.document.count({
        where: {
          isActive: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Approved documents for compliance rate
      prisma.document.count({
        where: {
          isActive: true,
          complianceStatus: 'APPROVED'
        }
      })
    ])

    // Calculate compliance rate
    const complianceRate = totalDocuments > 0 
      ? Math.round((approvedDocuments / totalDocuments) * 100)
      : 0

    const stats = {
      totalDocuments,
      pendingApprovals,
      expiringSoon,
      criticalRisk,
      recentUploads,
      complianceRate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}