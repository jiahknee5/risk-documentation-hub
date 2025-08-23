#!/usr/bin/env tsx

/**
 * Test script for the JavaScript-based Banking Risk RAG
 * Run with: npm run test:rag
 */

import { LightweightBankingRAG } from '../src/lib/rag/lightweight-search'

// Test documents
const testDocuments = [
  {
    id: 'doc1',
    title: 'Basel III Capital Requirements Update',
    content: `This document outlines critical updates to Basel III capital adequacy requirements. 
    Banks must maintain a minimum Tier 1 capital ratio of 6% and total capital ratio of 8%. 
    The liquidity coverage ratio (LCR) must exceed 100% to ensure adequate short-term resilience. 
    Non-compliance may result in severe regulatory penalties.`,
    category: 'POLICY'
  },
  {
    id: 'doc2',
    title: 'Operational Risk Management Framework',
    content: `Our operational risk framework addresses potential losses from inadequate processes, 
    people, systems, or external events. This includes fraud risk, cyber security threats, 
    and system failures. All departments must conduct quarterly risk assessments and 
    maintain updated risk registers. Medium risk level procedures are in place.`,
    category: 'PROCEDURE'
  },
  {
    id: 'doc3',
    title: 'Anti-Money Laundering (AML) Compliance Guide',
    content: `This guide ensures compliance with AML and KYC regulations. All customer accounts 
    must undergo enhanced due diligence. Suspicious activity reports (SARs) must be filed 
    within 30 days of detection. Know Your Customer procedures are mandatory for all 
    new account openings. Failure to comply may result in criminal prosecution.`,
    category: 'COMPLIANCE'
  },
  {
    id: 'doc4',
    title: 'Market Risk VaR Methodology',
    content: `Value at Risk (VaR) calculations for our trading portfolio use 99% confidence 
    level with 10-day holding period. Historical simulation method is preferred over 
    Monte Carlo for regulatory reporting. Stress testing scenarios include market crashes 
    and interest rate shocks. Low risk for current portfolio composition.`,
    category: 'METHODOLOGY'
  },
  {
    id: 'doc5',
    title: 'Credit Risk Default Probability Model',
    content: `Our credit risk model calculates probability of default (PD) using logistic regression. 
    Loss given default (LGD) estimates incorporate collateral recovery rates. 
    Exposure at default (EAD) considers undrawn credit facilities. High risk borrowers 
    require additional capital allocation under Basel III guidelines.`,
    category: 'MODEL'
  }
]

// Test queries
const testQueries = [
  { query: 'basel iii capital requirements', expectedDocs: ['doc1', 'doc5'] },
  { query: 'critical risk urgent', expectedDocs: ['doc1'] },
  { query: 'operational risk fraud', expectedDocs: ['doc2'] },
  { query: 'aml compliance', expectedDocs: ['doc3'] },
  { query: 'var stress testing', expectedDocs: ['doc4'] },
  { query: 'high risk', expectedDocs: ['doc5'] }
]

async function runTests() {
  console.log('🏦 Testing Banking Risk RAG Implementation\n')
  
  // Initialize RAG
  const rag = new LightweightBankingRAG()
  
  // Process test documents
  console.log('📄 Processing test documents...')
  testDocuments.forEach(doc => {
    rag.processDocument(doc)
  })
  console.log(`✅ Processed ${rag.getDocumentCount()} documents\n`)
  
  // Test search functionality
  console.log('🔍 Testing search queries:\n')
  
  let passedTests = 0
  let totalTests = testQueries.length
  
  for (const test of testQueries) {
    console.log(`Query: "${test.query}"`)
    
    const results = rag.search(test.query)
    const foundIds = results.map(r => r.document.id)
    
    console.log(`Found: ${results.length} documents`)
    console.log(`Top results: ${foundIds.slice(0, 3).join(', ')}`)
    
    // Check if expected documents are in top results
    const expectedFound = test.expectedDocs.filter(id => 
      foundIds.slice(0, 3).includes(id)
    )
    
    if (expectedFound.length > 0) {
      console.log(`✅ Found expected documents: ${expectedFound.join(', ')}`)
      passedTests++
    } else {
      console.log(`❌ Expected documents not in top results`)
    }
    
    // Show risk levels
    console.log('Risk levels:')
    results.slice(0, 3).forEach(r => {
      console.log(`  - ${r.document.id}: ${r.document.riskLevel} (score: ${r.score.toFixed(3)})`)
    })
    
    console.log()
  }
  
  // Test risk filtering
  console.log('🚨 Testing risk level filtering:\n')
  
  const criticalResults = rag.search('', { riskLevel: 'CRITICAL' })
  console.log(`CRITICAL risk documents: ${criticalResults.map(r => r.document.id).join(', ')}`)
  
  const highResults = rag.search('', { riskLevel: 'HIGH' })
  console.log(`HIGH risk documents: ${highResults.map(r => r.document.id).join(', ')}`)
  
  console.log()
  
  // Test compliance detection
  console.log('📋 Testing compliance framework detection:\n')
  
  testDocuments.forEach(doc => {
    const processed = rag['documents'].get(doc.id)
    if (processed?.compliance?.length > 0) {
      console.log(`${doc.id}: ${processed.compliance.join(', ')}`)
    }
  })
  
  console.log()
  
  // Generate summary
  console.log('📊 Testing summary generation:\n')
  
  const allResults = rag.search('risk')
  const summary = rag.generateSummary(allResults)
  console.log(summary)
  
  // Test alerts
  console.log('⚠️  Testing alert generation:\n')
  
  const alerts = rag.getAlerts(allResults)
  alerts.forEach(alert => {
    console.log(`${alert.severity}: ${alert.description}`)
  })
  
  console.log()
  
  // Final score
  console.log('📈 Test Results:')
  console.log(`Passed: ${passedTests}/${totalTests} search tests`)
  console.log(`Success rate: ${((passedTests/totalTests) * 100).toFixed(0)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n✅ All tests passed! Banking Risk RAG is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Review the search logic.')
  }
}

// Run tests
runTests().catch(console.error)