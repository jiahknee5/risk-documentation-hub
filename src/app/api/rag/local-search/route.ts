import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { spawn } from 'child_process'
import path from 'path'

// Interface for the Python RAG response
interface RAGSearchResult {
  document: {
    id: string
    title: string
    content: string
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    compliance_tags: string[]
    risk_scores: Record<string, number>
  }
  score: number
  risk_relevance: boolean
}

interface RAGResponse {
  results: RAGSearchResult[]
  summary: string
  alerts: Array<{
    type: string
    severity: string
    description: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query, filters = {}, useRiskAnalysis = true } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Call the Python RAG system
    const ragResponse = await callPythonRAG(query, filters)

    // Process results for frontend
    const processedResults = ragResponse.results.map(result => ({
      id: result.document.id,
      title: result.document.title,
      description: result.document.content.substring(0, 200) + '...',
      category: mapRiskToCategory(result.document.risk_scores),
      riskLevel: result.document.risk_level,
      complianceStatus: getComplianceStatus(result.document.compliance_tags),
      tags: result.document.compliance_tags.join(','),
      score: result.score,
      riskRelevance: result.risk_relevance,
      // Additional risk insights
      riskInsights: useRiskAnalysis ? {
        scores: result.document.risk_scores,
        topRisks: getTopRisks(result.document.risk_scores),
        complianceGaps: identifyComplianceGaps(result.document.compliance_tags)
      } : undefined
    }))

    // Generate risk-aware response
    const response = {
      query,
      results: processedResults,
      total: processedResults.length,
      riskSummary: ragResponse.summary,
      alerts: ragResponse.alerts,
      searchType: 'banking_risk_rag'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('RAG search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform risk-aware search' },
      { status: 500 }
    )
  }
}

async function callPythonRAG(query: string, filters: any): Promise<RAGResponse> {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || 'python3'
    const scriptPath = path.join(process.cwd(), 'src/lib/rag/rag_api.py')
    
    const pythonProcess = spawn(pythonPath, [
      scriptPath,
      'search',
      '--query', query,
      '--filters', JSON.stringify(filters)
    ])

    let outputData = ''
    let errorData = ''

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python RAG error:', errorData)
        reject(new Error(`Python process exited with code ${code}`))
        return
      }

      try {
        const result = JSON.parse(outputData)
        resolve(result)
      } catch (error) {
        reject(new Error('Failed to parse Python RAG response'))
      }
    })

    pythonProcess.on('error', (error) => {
      reject(error)
    })
  })
}

function mapRiskToCategory(riskScores: Record<string, number>): string {
  // Map highest risk score to document category
  const entries = Object.entries(riskScores)
  if (entries.length === 0) return 'OTHER'

  const [topRisk] = entries.reduce((a, b) => a[1] > b[1] ? a : b)
  
  const categoryMap: Record<string, string> = {
    'credit_risk': 'FINANCIAL_RISK',
    'market_risk': 'FINANCIAL_RISK',
    'operational_risk': 'OPERATIONAL_RISK',
    'liquidity_risk': 'FINANCIAL_RISK',
    'compliance_risk': 'COMPLIANCE'
  }

  return categoryMap[topRisk] || 'OTHER'
}

function getComplianceStatus(complianceTags: string[]): string {
  if (complianceTags.length === 0) return 'PENDING'
  
  // Check for critical compliance frameworks
  const criticalFrameworks = ['BASEL_III', 'SOX', 'DODD_FRANK']
  const hasCritical = complianceTags.some(tag => criticalFrameworks.includes(tag))
  
  return hasCritical ? 'UNDER_REVIEW' : 'APPROVED'
}

function getTopRisks(riskScores: Record<string, number>): string[] {
  return Object.entries(riskScores)
    .filter(([_, score]) => score > 0.5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([risk]) => risk.replace('_', ' ').toUpperCase())
}

function identifyComplianceGaps(complianceTags: string[]): string[] {
  const requiredFrameworks = ['BASEL_III', 'AML_KYC', 'SOX']
  return requiredFrameworks.filter(framework => !complianceTags.includes(framework))
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Banking Risk RAG API is running',
    capabilities: [
      'Risk-aware semantic search',
      'Banking terminology understanding',
      'Compliance framework detection',
      'Risk level classification',
      'No external API dependencies'
    ]
  })
}