# Banking Risk RAG on Vercel - Usage Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy to Vercel
```bash
vercel
```

### 3. Access Enhanced Search
Navigate to `/search/enhanced` in your deployed application

## Features

### Banking Risk AI Toggle
- **ON**: Uses intelligent banking-specific search with risk analysis
- **OFF**: Uses standard keyword search

### Risk Level Filtering
- **CRITICAL**: Immediate action required (breaches, violations)
- **HIGH**: Significant risk requiring attention
- **MEDIUM**: Moderate risk, review recommended
- **LOW**: Minimal risk, within acceptable limits

### Compliance Framework Filtering
- **Basel III**: Capital adequacy requirements
- **SOX**: Internal controls and financial reporting
- **GDPR**: Data protection and privacy
- **AML/KYC**: Anti-money laundering
- **Dodd-Frank**: US financial reform

### Search Examples

#### Find Critical Risks
```
Query: "critical breach urgent"
Filter: Risk Level = CRITICAL
```

#### Basel III Compliance
```
Query: "basel iii capital requirements"
Filter: Compliance = BASEL_III
```

#### Recent High Risks
```
Query: "high risk"
Filter: Risk Level = HIGH, Date Range = This Month
```

#### Operational Risk Assessment
```
Query: "operational risk fraud cyber"
Filter: Risk Level = HIGH
```

## Understanding Results

### Risk Summary Box
Provides overview of:
- Critical document count
- Risk distribution
- Top risk areas
- Compliance coverage

### Risk Alerts
Displayed at top when:
- Critical risks found
- High risk concentration
- Compliance gaps detected

### Document Risk Insights
Each result shows:
- **Risk Level**: Color-coded badge
- **Key Risks**: Top identified risks
- **Compliance Gaps**: Missing frameworks
- **Relevance Score**: Match percentage

## Testing the RAG System

### Local Testing
```bash
npm run test:rag
```

### API Testing
```bash
# Check RAG status
curl https://your-app.vercel.app/api/rag/vercel-search

# Test search (requires authentication)
curl -X POST https://your-app.vercel.app/api/rag/vercel-search \
  -H "Content-Type: application/json" \
  -d '{"query": "basel iii capital", "filters": {"riskLevel": "HIGH"}}'
```

## Performance Tips

### Document Limits
- Keep under 1000 documents for optimal performance
- Documents cached in memory on first search
- Cache refreshes when documents added/removed

### Search Optimization
- Use specific banking terms for better results
- Enable risk filters to narrow results
- Combine multiple terms for precision

### Memory Management
- RAG initializes on first request
- Stays in memory between requests
- Auto-refreshes on document changes

## Troubleshooting

### No Search Results
1. Check if documents exist in database
2. Verify documents have `isActive: true`
3. Try broader search terms
4. Remove filters and retry

### Slow Performance
1. Reduce document count
2. Check Vercel function logs
3. Verify no memory limits hit
4. Consider implementing pagination

### Risk Classification Issues
1. Ensure documents contain risk keywords
2. Check content includes compliance terms
3. Review risk level detection logic
4. Test with known risk documents

## Banking Terms Recognized

### Risk Types
- Credit risk, default, exposure
- Market risk, VaR, volatility
- Operational risk, fraud, cyber
- Liquidity risk, LCR, NSFR
- Compliance risk, regulatory

### Capital Terms
- Tier 1/2 capital
- Capital adequacy ratio
- Risk-weighted assets
- Capital buffer
- Leverage ratio

### Compliance Terms
- Basel III/II
- Dodd-Frank
- SOX/Sarbanes-Oxley
- GDPR
- AML/KYC
- MiFID II

### Risk Metrics
- Value at Risk (VaR)
- Conditional VaR (CVaR)
- Probability of Default (PD)
- Loss Given Default (LGD)
- Exposure at Default (EAD)

## Advanced Usage

### Custom Risk Queries
```javascript
// Complex risk analysis
{
  "query": "tier 1 capital AND (breach OR violation)",
  "filters": {
    "riskLevel": "CRITICAL",
    "compliance": "BASEL_III",
    "dateRange": "quarter"
  }
}
```

### Monitoring Compliance Gaps
1. Search without compliance filter
2. Review compliance coverage in summary
3. Identify documents missing frameworks
4. Use compliance filter to find covered docs

### Risk Trend Analysis
1. Use date range filters
2. Compare risk distributions over time
3. Track compliance improvements
4. Monitor critical risk reduction

## Next Steps

1. **Upload Documents**: Add banking risk documents
2. **Test Searches**: Try various risk queries
3. **Monitor Performance**: Check Vercel analytics
4. **Customize Terms**: Modify banking terms in code
5. **Extend Features**: Add more risk types or frameworks