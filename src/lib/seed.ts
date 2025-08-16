import { PrismaClient, DocumentCategory, RiskLevel, ComplianceStatus, UserRole } from '@/generated/prisma'
import { hashPassword } from './auth'

const prisma = new PrismaClient()

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...')

    // Create demo users
    const adminPassword = await hashPassword('password123')
    const userPassword = await hashPassword('password123')

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: UserRole.ADMIN,
        department: 'Risk Management'
      }
    })

    const normalUser = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        name: 'John Doe',
        password: userPassword,
        role: UserRole.USER,
        department: 'Finance'
      }
    })

    const managerUser = await prisma.user.upsert({
      where: { email: 'manager@example.com' },
      update: {},
      create: {
        email: 'manager@example.com',
        name: 'Jane Smith',
        password: userPassword,
        role: UserRole.MANAGER,
        department: 'Compliance'
      }
    })

    console.log('✅ Created demo users')

    // Create sample documents
    const sampleDocuments = [
      {
        title: 'Information Security Policy',
        description: 'Company-wide information security policy outlining data protection standards and procedures.',
        category: DocumentCategory.POLICY,
        riskLevel: RiskLevel.HIGH,
        tags: JSON.stringify(['security', 'policy', 'data-protection']),
        fileName: 'info_security_policy.pdf',
        filePath: 'uploads/sample_info_security_policy.pdf',
        fileSize: 1024 * 500, // 500KB
        mimeType: 'application/pdf',
        content: 'This document outlines our comprehensive information security policy including access controls, data classification, incident response procedures, and compliance requirements.',
        summary: 'Comprehensive information security policy covering data protection, access controls, and incident response.',
        keyPoints: JSON.stringify([
          'Multi-factor authentication required for all systems',
          'Data classification levels: Public, Internal, Confidential, Restricted',
          'Incident response team must be notified within 1 hour',
          'Regular security awareness training mandatory'
        ]),
        uploadedBy: adminUser.id,
        complianceStatus: ComplianceStatus.APPROVED
      },
      {
        title: 'Risk Assessment Framework',
        description: 'Operational risk assessment methodology and framework for identifying and managing business risks.',
        category: DocumentCategory.OPERATIONAL_RISK,
        riskLevel: RiskLevel.CRITICAL,
        tags: JSON.stringify(['risk-assessment', 'framework', 'operations']),
        fileName: 'risk_assessment_framework.docx',
        filePath: 'uploads/sample_risk_framework.docx',
        fileSize: 1024 * 750, // 750KB
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        content: 'This framework provides a systematic approach to identifying, assessing, and managing operational risks across the organization.',
        summary: 'Systematic operational risk assessment framework with identification and management procedures.',
        keyPoints: JSON.stringify([
          'Risk identification using structured interviews and workshops',
          'Quantitative and qualitative risk assessment methods',
          'Risk appetite statements aligned with business strategy',
          'Continuous monitoring and reporting requirements'
        ]),
        uploadedBy: managerUser.id,
        complianceStatus: ComplianceStatus.UNDER_REVIEW
      },
      {
        title: 'GDPR Compliance Procedures',
        description: 'Detailed procedures for ensuring GDPR compliance including data subject rights and breach notification.',
        category: DocumentCategory.COMPLIANCE,
        riskLevel: RiskLevel.HIGH,
        tags: JSON.stringify(['gdpr', 'compliance', 'data-privacy']),
        fileName: 'gdpr_procedures.pdf',
        filePath: 'uploads/sample_gdpr_procedures.pdf',
        fileSize: 1024 * 600, // 600KB
        mimeType: 'application/pdf',
        content: 'Comprehensive GDPR compliance procedures covering data subject rights, lawful basis for processing, and breach notification requirements.',
        summary: 'GDPR compliance procedures covering data rights, processing basis, and breach notification.',
        keyPoints: JSON.stringify([
          'Data subject requests must be fulfilled within 30 days',
          'Lawful basis must be established before data processing',
          'Data breach notification to authorities within 72 hours',
          'Privacy impact assessments required for high-risk processing'
        ]),
        uploadedBy: normalUser.id,
        complianceStatus: ComplianceStatus.APPROVED
      },
      {
        title: 'Financial Risk Management Policy',
        description: 'Policy governing financial risk management including credit risk, market risk, and liquidity risk.',
        category: DocumentCategory.FINANCIAL_RISK,
        riskLevel: RiskLevel.MEDIUM,
        tags: JSON.stringify(['financial-risk', 'policy', 'credit-risk']),
        fileName: 'financial_risk_policy.pdf',
        filePath: 'uploads/sample_financial_risk.pdf',
        fileSize: 1024 * 400, // 400KB
        mimeType: 'application/pdf',
        content: 'This policy establishes the framework for managing financial risks including credit, market, and liquidity risks.',
        summary: 'Financial risk management policy covering credit, market, and liquidity risks.',
        keyPoints: JSON.stringify([
          'Credit risk limits by counterparty and sector',
          'Market risk monitoring using VaR models',
          'Liquidity stress testing performed quarterly',
          'Risk committee oversight and reporting'
        ]),
        uploadedBy: normalUser.id,
        complianceStatus: ComplianceStatus.PENDING
      },
      {
        title: 'Incident Response Playbook',
        description: 'Step-by-step incident response procedures for cybersecurity incidents and data breaches.',
        category: DocumentCategory.CYBERSECURITY,
        riskLevel: RiskLevel.CRITICAL,
        tags: JSON.stringify(['incident-response', 'cybersecurity', 'procedures']),
        fileName: 'incident_response_playbook.pdf',
        filePath: 'uploads/sample_incident_response.pdf',
        fileSize: 1024 * 800, // 800KB
        mimeType: 'application/pdf',
        content: 'Detailed incident response playbook with step-by-step procedures for various types of cybersecurity incidents.',
        summary: 'Comprehensive incident response playbook for cybersecurity incidents and breaches.',
        keyPoints: JSON.stringify([
          'Incident classification levels: Low, Medium, High, Critical',
          'Response team activation within 15 minutes',
          'Evidence preservation and forensic procedures',
          'Communication protocols for stakeholders and authorities'
        ]),
        uploadedBy: adminUser.id,
        complianceStatus: ComplianceStatus.APPROVED
      }
    ]

    for (const docData of sampleDocuments) {
      await prisma.document.create({
        data: docData
      })
    }

    console.log('✅ Created sample documents')

    // Create some audit logs
    await prisma.auditLog.createMany({
      data: [
        {
          userId: adminUser.id,
          action: 'LOGIN',
          details: JSON.stringify({ loginMethod: 'credentials' }),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Chrome)'
        },
        {
          userId: normalUser.id,
          action: 'LOGIN',
          details: JSON.stringify({ loginMethod: 'credentials' }),
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Firefox)'
        }
      ]
    })

    console.log('✅ Created audit logs')

    console.log('🎉 Database seed completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedDatabase()
}