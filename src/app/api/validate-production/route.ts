import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    // Database connection test
    let dbConnected = false
    let documentCount = 0
    let userCount = 0
    let auditLogCount = 0
    
    try {
      documentCount = await prisma.document.count()
      userCount = await prisma.user.count()
      auditLogCount = await prisma.auditLog.count()
      dbConnected = true
    } catch (error) {
      console.error('Database connection error:', error)
    }
    
    // Check for mock data patterns
    const mockPatterns = ['mock', 'test', 'demo', 'sample', 'example']
    let mockDataFound = false
    let mockDocuments: any[] = []
    
    if (dbConnected) {
      // Check documents for mock data
      const suspiciousDocuments = await prisma.document.findMany({
        where: {
          OR: [
            { id: { contains: 'mock' } },
            { id: { contains: 'test' } },
            { title: { contains: 'Mock' } },
            { title: { contains: 'Test' } },
            { uploadedBy: 'system' }
          ]
        },
        take: 10
      })
      
      if (suspiciousDocuments.length > 0) {
        mockDataFound = true
        mockDocuments = suspiciousDocuments.map(doc => ({
          id: doc.id,
          title: doc.title,
          uploadedBy: doc.uploadedBy,
          createdAt: doc.createdAt
        }))
      }
    }
    
    // Check recent activity
    const recentDocuments = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        uploadedBy: true
      }
    })
    
    const recentAuditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        action: true,
        createdAt: true,
        userId: true,
        ipAddress: true
      }
    })
    
    // Check for hardcoded IPs or user IDs
    const suspiciousAuditLogs = recentAuditLogs.filter(log => 
      log.ipAddress === '127.0.0.1' || 
      log.ipAddress === 'localhost' ||
      log.userId === 'system' ||
      log.userId === 'mock-user'
    )
    
    // Performance check
    const responseTime = Date.now() - startTime
    
    // Generate validation report
    const validationReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      authentication: {
        hasSession: !!session,
        userEmail: session?.user?.email || null,
        isAuthenticated: !!session?.user
      },
      database: {
        connected: dbConnected,
        documentCount,
        userCount,
        auditLogCount
      },
      dataValidation: {
        mockDataFound,
        mockDocuments,
        suspiciousAuditLogs: suspiciousAuditLogs.length,
        recentDocuments: recentDocuments.map(doc => ({
          ...doc,
          isLikelyMock: mockPatterns.some(pattern => 
            doc.id.toLowerCase().includes(pattern) || 
            doc.title.toLowerCase().includes(pattern)
          )
        }))
      },
      systemHealth: {
        responseTimeMs: responseTime,
        hasDocuments: documentCount > 0,
        hasUsers: userCount > 0,
        hasAuditLogs: auditLogCount > 0,
        allSystemsOperational: dbConnected && !mockDataFound
      },
      recommendations: []
    }
    
    // Add recommendations based on findings
    if (!dbConnected) {
      validationReport.recommendations.push('Database connection failed - check Prisma configuration')
    }
    if (mockDataFound) {
      validationReport.recommendations.push('Mock data detected - clean up test data from production')
    }
    if (documentCount === 0) {
      validationReport.recommendations.push('No documents found - system may be newly deployed')
    }
    if (suspiciousAuditLogs.length > 0) {
      validationReport.recommendations.push('Suspicious audit logs found - check for hardcoded values')
    }
    
    // Overall status
    const status = {
      isProduction: !mockDataFound && dbConnected,
      confidence: mockDataFound ? 0 : (documentCount > 0 ? 100 : 50),
      message: mockDataFound 
        ? 'WARNING: Mock or test data detected in production!'
        : 'Production data validation passed'
    }
    
    return NextResponse.json({
      status,
      report: validationReport
    })
    
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({
      status: {
        isProduction: false,
        confidence: 0,
        message: 'Validation failed due to error'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}