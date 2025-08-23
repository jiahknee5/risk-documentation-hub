import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ensureDatabase } from '@/lib/db-init'

export async function GET(request: NextRequest) {
  try {
    // Initialize database
    await ensureDatabase()
    
    // Check if we have any documents
    const documentCount = await prisma.document.count()
    
    if (documentCount === 0) {
      // Create some test documents for search
      const testUser = await prisma.user.findFirst({
        where: { email: 'demo@riskdocs.com' }
      })
      
      if (testUser) {
        const testDocuments = [
          {
            title: 'Risk Management Policy 2025',
            description: 'Comprehensive risk management policy for the organization',
            category: 'POLICY' as const,
            filePath: 'test-policy.pdf',
            fileName: 'test-policy.pdf',
            fileSize: 1024000,
            mimeType: 'application/pdf',
            riskLevel: 'HIGH' as const,
            tags: 'risk,policy,management,2025',
            content: 'This document outlines our comprehensive risk management approach',
            summary: 'Risk management policy covering operational, financial, and cybersecurity risks',
            keyPoints: JSON.stringify(['Risk assessment', 'Mitigation strategies', 'Compliance requirements']),
            uploadedBy: testUser.id
          },
          {
            title: 'Cybersecurity Incident Response Plan',
            description: 'Detailed procedures for handling cybersecurity incidents',
            category: 'CYBERSECURITY' as const,
            filePath: 'cyber-response.pdf',
            fileName: 'cyber-response.pdf',
            fileSize: 2048000,
            mimeType: 'application/pdf',
            riskLevel: 'CRITICAL' as const,
            tags: 'cybersecurity,incident,response,security',
            content: 'Step-by-step guide for responding to security incidents and data breaches',
            summary: 'Incident response procedures including detection, containment, and recovery',
            keyPoints: JSON.stringify(['Detection procedures', 'Incident classification', 'Recovery steps']),
            uploadedBy: testUser.id
          },
          {
            title: 'Financial Risk Assessment Q4 2024',
            description: 'Quarterly financial risk assessment report',
            category: 'FINANCIAL_RISK' as const,
            filePath: 'financial-q4.pdf',
            fileName: 'financial-q4.pdf',
            fileSize: 3072000,
            mimeType: 'application/pdf',
            riskLevel: 'MEDIUM' as const,
            tags: 'financial,risk,assessment,quarterly,2024',
            content: 'Analysis of financial risks including market, credit, and liquidity risks',
            summary: 'Q4 2024 financial risk assessment with focus on market volatility',
            keyPoints: JSON.stringify(['Market risk analysis', 'Credit exposure', 'Liquidity metrics']),
            uploadedBy: testUser.id
          },
          {
            title: 'GDPR Compliance Checklist',
            description: 'Complete checklist for GDPR compliance verification',
            category: 'COMPLIANCE' as const,
            filePath: 'gdpr-checklist.pdf',
            fileName: 'gdpr-checklist.pdf',
            fileSize: 512000,
            mimeType: 'application/pdf',
            riskLevel: 'HIGH' as const,
            tags: 'gdpr,compliance,privacy,data protection',
            content: 'Comprehensive checklist covering all GDPR requirements for data processing',
            summary: 'GDPR compliance verification checklist with implementation guidelines',
            keyPoints: JSON.stringify(['Data inventory', 'Privacy notices', 'Consent mechanisms']),
            uploadedBy: testUser.id
          },
          {
            title: 'Business Continuity Plan 2025',
            description: 'Updated business continuity and disaster recovery plan',
            category: 'OPERATIONAL_RISK' as const,
            filePath: 'bcp-2025.pdf',
            fileName: 'bcp-2025.pdf',
            fileSize: 4096000,
            mimeType: 'application/pdf',
            riskLevel: 'HIGH' as const,
            tags: 'business continuity,disaster recovery,operational,planning',
            content: 'Detailed procedures for maintaining operations during disruptions',
            summary: 'Business continuity plan covering all critical business functions',
            keyPoints: JSON.stringify(['Critical functions', 'Recovery objectives', 'Communication plans']),
            uploadedBy: testUser.id
          }
        ]
        
        // Create all test documents
        for (const doc of testDocuments) {
          await prisma.document.create({ data: doc })
        }
      }
    }
    
    // Test search functionality
    const searchQuery = request.nextUrl.searchParams.get('q') || 'risk'
    
    const searchResults = await prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
          { content: { contains: searchQuery } },
          { tags: { contains: searchQuery } },
          { summary: { contains: searchQuery } }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, department: true }
        }
      }
    })
    
    return NextResponse.json({
      message: 'Search test completed',
      documentCount,
      searchQuery,
      resultsCount: searchResults.length,
      results: searchResults
    })
  } catch (error) {
    console.error('Test search error:', error)
    return NextResponse.json({ 
      error: 'Test search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}