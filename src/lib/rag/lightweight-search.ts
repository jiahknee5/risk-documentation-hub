import Fuse from 'fuse.js'
import type { FuseResult } from 'fuse.js'

export interface BankingDocument {
  id: string
  title: string
  content: string
  description?: string
  tags?: string
  category?: string
  createdAt?: Date
  fileName?: string
  fileSize?: number
  riskTerms?: string
  riskLevel?: string
  compliance?: string[]
}

export interface SearchResult {
  document: BankingDocument & {
    riskLevel: string
    compliance: string[]
    riskScores?: Record<string, number>
  }
  score: number
  riskRelevance?: boolean
  riskInsights?: {
    topRisks: string[]
    complianceGaps?: string[]
  }
}

export interface RiskAlert {
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
}

export class LightweightBankingRAG {
  private fuseIndex: Fuse<BankingDocument>
  private documents: Map<string, BankingDocument>
  
  constructor() {
    // Initialize with banking-specific options
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'content', weight: 0.2 },
        { name: 'description', weight: 0.2 },
        { name: 'riskTerms', weight: 0.3 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 3,
      shouldSort: true,
      findAllMatches: true,
      ignoreLocation: true
    }
    
    this.documents = new Map()
    this.fuseIndex = new Fuse([], fuseOptions)
  }
  
  processDocument(doc: BankingDocument): void {
    // Extract banking risk terms
    const riskTerms = this.extractRiskTerms(doc.content || '')
    
    const processedDoc: BankingDocument = {
      ...doc,
      riskTerms: riskTerms.join(' '),
      riskLevel: this.assessRiskLevel(doc.content || ''),
      compliance: this.detectCompliance(doc.content || '')
    }
    
    this.documents.set(doc.id, processedDoc)
    this.fuseIndex.add(processedDoc)
  }
  
  private extractRiskTerms(content: string): string[] {
    const bankingTerms = [
      'basel iii', 'tier 1 capital', 'tier 2 capital', 'liquidity coverage ratio',
      'credit risk', 'market risk', 'operational risk', 'systemic risk',
      'var', 'cvar', 'stress testing', 'counterparty', 'concentration risk',
      'default', 'exposure', 'hedge', 'derivative', 'swap', 'option',
      'leverage ratio', 'capital adequacy', 'risk-weighted assets',
      'probability of default', 'loss given default', 'exposure at default',
      'credit valuation adjustment', 'funding valuation adjustment',
      'dodd-frank', 'volcker rule', 'mifid', 'emir', 'fatca',
      'anti-money laundering', 'know your customer', 'sanctions',
      'liquidity risk', 'interest rate risk', 'fx risk', 'commodity risk'
    ]
    
    const found: string[] = []
    const contentLower = content.toLowerCase()
    
    bankingTerms.forEach(term => {
      if (contentLower.includes(term)) {
        found.push(term)
      }
    })
    
    return found
  }
  
  private assessRiskLevel(content: string): string {
    const contentLower = content.toLowerCase()
    
    // Critical risk indicators
    const critical = /breach|violation|critical|severe|immediate action|urgent|emergency|failure to comply/i
    const high = /high risk|significant|material|substantial|elevated|attention required|non-compliant/i
    const medium = /moderate|medium risk|potential|review required|monitor|assess/i
    const low = /low risk|minimal|acceptable|compliant|within limits|satisfactory/i
    
    // Check for specific risk indicators
    const capitalAdequacyIssues = /capital ratio.*below|insufficient capital|undercapitalized/i
    const liquidityIssues = /liquidity.*shortage|funding.*gap|cash.*crunch/i
    const complianceIssues = /non-compliance|regulatory.*breach|violation.*of/i
    
    if (critical.test(content) || capitalAdequacyIssues.test(content) || 
        liquidityIssues.test(content) || complianceIssues.test(content)) {
      return 'CRITICAL'
    }
    if (high.test(content)) return 'HIGH'
    if (medium.test(content)) return 'MEDIUM'
    return 'LOW'
  }
  
  private detectCompliance(content: string): string[] {
    const frameworks = {
      'BASEL_III': /basel\s*(iii|3)|capital\s*adequacy|tier\s*1|leverage\s*ratio/i,
      'SOX': /sarbanes|sox|internal\s*controls|404|302/i,
      'GDPR': /gdpr|data\s*protection|privacy|right\s*to\s*be\s*forgotten/i,
      'AML_KYC': /anti.*money.*laundering|aml|kyc|know.*your.*customer|suspicious.*activity/i,
      'DODD_FRANK': /dodd.*frank|volcker|swap.*execution|living\s*will/i,
      'MIFID': /mifid|markets.*financial.*instruments|best\s*execution/i,
      'IFRS': /ifrs|international.*financial.*reporting/i,
      'CCAR': /ccar|comprehensive.*capital.*analysis/i,
      'DFAST': /dfast|dodd.*frank.*stress\s*test/i
    }
    
    return Object.entries(frameworks)
      .filter(([_, regex]) => regex.test(content))
      .map(([framework]) => framework)
  }
  
  search(query: string, options?: { riskLevel?: string; compliance?: string; dateRange?: string }): SearchResult[] {
    // Enhance query with banking context
    const enhancedQuery = this.enhanceQuery(query)
    
    // Perform search
    const fuseResults = this.fuseIndex.search(enhancedQuery)
    
    // Filter by options if provided
    let filteredResults = fuseResults
    if (options) {
      filteredResults = fuseResults.filter(result => {
        const doc = result.item
        if (options.riskLevel && doc.riskLevel !== options.riskLevel) return false
        if (options.compliance && doc.compliance && 
            !doc.compliance.includes(options.compliance)) return false
        return true
      })
    }
    
    // Post-process with risk ranking
    const results = this.rankByRisk(filteredResults, query)
    
    // Add risk insights to top results
    return results.map(result => {
      const doc = result.document
      const insights = this.generateRiskInsights(doc, query)
      
      return {
        ...result,
        riskInsights: insights
      }
    })
  }
  
  private enhanceQuery(query: string): string {
    // Add synonyms and related terms
    const synonyms: Record<string, string[]> = {
      'risk': ['exposure', 'threat', 'vulnerability', 'hazard'],
      'compliance': ['regulatory', 'requirement', 'mandate', 'obligation'],
      'capital': ['tier 1', 'tier 2', 'buffer', 'reserves'],
      'liquidity': ['cash', 'funding', 'liquid assets'],
      'credit': ['loan', 'lending', 'borrowing', 'debt'],
      'audit': ['review', 'examination', 'assessment', 'inspection']
    }
    
    let enhanced = query
    Object.entries(synonyms).forEach(([term, syns]) => {
      if (query.toLowerCase().includes(term)) {
        enhanced += ' ' + syns.join(' ')
      }
    })
    
    return enhanced
  }
  
  private rankByRisk(results: FuseResult<BankingDocument>[], query: string): SearchResult[] {
    // Boost high-risk documents if query suggests urgency
    const urgentQuery = /urgent|critical|immediate|asap|emergency|breach/i.test(query)
    const complianceQuery = /compliance|regulatory|audit|sox|basel|gdpr|aml/i.test(query)
    const capitalQuery = /capital|tier\s*1|adequacy|buffer/i.test(query)
    
    return results
      .map(result => {
        const doc = result.item
        let score = result.score || 0
        
        // Boost high-risk documents for urgent queries
        if (urgentQuery && doc.riskLevel === 'CRITICAL') {
          score *= 0.5 // Lower score is better in Fuse.js
        } else if (urgentQuery && doc.riskLevel === 'HIGH') {
          score *= 0.7
        }
        
        // Boost if compliance frameworks match
        if (complianceQuery && doc.compliance) {
          const hasRelevantCompliance = doc.compliance.some((c: string) => 
            query.toLowerCase().includes(c.toLowerCase())
          )
          if (hasRelevantCompliance) score *= 0.6
        }
        
        // Boost capital-related documents for capital queries
        if (capitalQuery && doc.riskTerms?.includes('capital')) {
          score *= 0.7
        }
        
        // Convert to our result format
        const searchResult: SearchResult = {
          document: {
            ...doc,
            riskLevel: doc.riskLevel || 'MEDIUM',
            compliance: doc.compliance || [],
            riskScores: this.calculateRiskScores(doc)
          },
          score: 1 - score, // Convert to higher is better
          riskRelevance: this.isRiskRelevant(doc, query)
        }
        
        return searchResult
      })
      .sort((a, b) => b.score - a.score) // Sort by score descending
  }
  
  private calculateRiskScores(doc: BankingDocument): Record<string, number> {
    const content = (doc.content || '').toLowerCase()
    const scores: Record<string, number> = {
      credit_risk: 0,
      market_risk: 0,
      operational_risk: 0,
      liquidity_risk: 0,
      compliance_risk: 0
    }
    
    // Simple scoring based on keyword frequency
    const creditTerms = ['credit', 'default', 'loan', 'exposure', 'counterparty']
    const marketTerms = ['market', 'trading', 'volatility', 'var', 'derivative']
    const operationalTerms = ['operational', 'process', 'system', 'fraud', 'error']
    const liquidityTerms = ['liquidity', 'cash', 'funding', 'lcr', 'nsfr']
    const complianceTerms = ['compliance', 'regulatory', 'audit', 'violation', 'breach']
    
    scores.credit_risk = this.calculateTermScore(content, creditTerms)
    scores.market_risk = this.calculateTermScore(content, marketTerms)
    scores.operational_risk = this.calculateTermScore(content, operationalTerms)
    scores.liquidity_risk = this.calculateTermScore(content, liquidityTerms)
    scores.compliance_risk = this.calculateTermScore(content, complianceTerms)
    
    return scores
  }
  
  private calculateTermScore(content: string, terms: string[]): number {
    const matches = terms.filter(term => content.includes(term)).length
    return Math.min(matches / terms.length, 1)
  }
  
  private isRiskRelevant(doc: BankingDocument, query: string): boolean {
    const queryLower = query.toLowerCase()
    const riskKeywords = ['risk', 'compliance', 'capital', 'liquidity', 'audit', 'regulatory']
    return riskKeywords.some(keyword => queryLower.includes(keyword))
  }
  
  private generateRiskInsights(doc: BankingDocument, query: string): { topRisks: string[]; complianceGaps?: string[] } {
    const insights: { topRisks: string[]; complianceGaps?: string[] } = {
      topRisks: []
    }
    
    // Identify top risks based on content
    const content = (doc.content || '').toLowerCase()
    const riskScores = this.calculateRiskScores(doc)
    
    // Add top risks
    Object.entries(riskScores)
      .filter(([_, score]) => score > 0.5)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .forEach(([risk, score]) => {
        insights.topRisks.push(risk.replace('_', ' '))
      })
    
    // Check for compliance gaps
    const requiredFrameworks = this.getRequiredFrameworks(content)
    const existingFrameworks = doc.compliance || []
    const gaps = requiredFrameworks.filter(f => !existingFrameworks.includes(f))
    
    if (gaps.length > 0) {
      insights.complianceGaps = gaps
    }
    
    return insights
  }
  
  private getRequiredFrameworks(content: string): string[] {
    const required: string[] = []
    
    if (content.includes('capital') || content.includes('tier 1')) {
      required.push('BASEL_III')
    }
    if (content.includes('internal control') || content.includes('financial reporting')) {
      required.push('SOX')
    }
    if (content.includes('personal data') || content.includes('privacy')) {
      required.push('GDPR')
    }
    if (content.includes('money laundering') || content.includes('suspicious')) {
      required.push('AML_KYC')
    }
    
    return required
  }
  
  generateSummary(results: SearchResult[]): string {
    const riskCounts: Record<string, number> = { 
      CRITICAL: 0, 
      HIGH: 0, 
      MEDIUM: 0, 
      LOW: 0 
    }
    const complianceMap = new Map<string, number>()
    const topRisks = new Map<string, number>()
    
    results.forEach(r => {
      const doc = r.document
      riskCounts[doc.riskLevel]++
      
      doc.compliance.forEach((c: string) => {
        complianceMap.set(c, (complianceMap.get(c) || 0) + 1)
      })
      
      if (r.riskInsights?.topRisks) {
        r.riskInsights.topRisks.forEach(risk => {
          topRisks.set(risk, (topRisks.get(risk) || 0) + 1)
        })
      }
    })
    
    let summary = `Found ${results.length} documents\n\n`
    
    if (riskCounts.CRITICAL > 0) {
      summary += `⚠️ ${riskCounts.CRITICAL} CRITICAL RISK documents require immediate attention\n`
    }
    if (riskCounts.HIGH > 0) {
      summary += `⚠️ ${riskCounts.HIGH} HIGH RISK documents require review\n`
    }
    
    summary += `\nRisk Distribution:\n`
    summary += `• Critical: ${riskCounts.CRITICAL}\n`
    summary += `• High: ${riskCounts.HIGH}\n`
    summary += `• Medium: ${riskCounts.MEDIUM}\n`
    summary += `• Low: ${riskCounts.LOW}\n`
    
    if (topRisks.size > 0) {
      summary += '\nTop Risk Areas:\n'
      Array.from(topRisks.entries())
        .sort(([_, a], [__, b]) => b - a)
        .slice(0, 3)
        .forEach(([risk, count]) => {
          summary += `• ${risk}: ${count} documents\n`
        })
    }
    
    if (complianceMap.size > 0) {
      summary += '\nCompliance Coverage:\n'
      complianceMap.forEach((count, framework) => {
        summary += `• ${framework}: ${count} documents\n`
      })
    }
    
    return summary
  }
  
  getAlerts(results: SearchResult[]): RiskAlert[] {
    const alerts: RiskAlert[] = []
    
    // Check for critical risks
    const criticalCount = results.filter(r => r.document.riskLevel === 'CRITICAL').length
    if (criticalCount > 0) {
      alerts.push({
        type: 'CRITICAL_RISK',
        severity: 'CRITICAL',
        description: `${criticalCount} documents with CRITICAL risk level found`
      })
    }
    
    // Check for high risks
    const highCount = results.filter(r => r.document.riskLevel === 'HIGH').length
    if (highCount > 3) {
      alerts.push({
        type: 'HIGH_RISK_CONCENTRATION',
        severity: 'HIGH',
        description: `${highCount} documents with HIGH risk level - review risk concentration`
      })
    }
    
    // Check for compliance gaps
    const docsWithGaps = results.filter(r => 
      r.riskInsights?.complianceGaps && r.riskInsights.complianceGaps.length > 0
    )
    if (docsWithGaps.length > 0) {
      alerts.push({
        type: 'COMPLIANCE_GAPS',
        severity: 'MEDIUM',
        description: `${docsWithGaps.length} documents have compliance framework gaps`
      })
    }
    
    return alerts
  }
  
  // Batch process multiple documents
  processDocuments(documents: BankingDocument[]): void {
    documents.forEach(doc => this.processDocument(doc))
  }
  
  // Clear all documents
  clear(): void {
    this.documents.clear()
    this.fuseIndex = new Fuse([], this.fuseIndex.options)
  }
  
  // Get document count
  getDocumentCount(): number {
    return this.documents.size
  }
}