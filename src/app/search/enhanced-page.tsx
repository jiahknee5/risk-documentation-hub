'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { AuthCheck } from '@/components/AuthCheck'
import { Input, Select } from '@/components/Input'
import { Shield, AlertTriangle, TrendingUp, FileSearch, AlertCircle } from 'lucide-react'

export default function EnhancedSearchPage() {
  return (
    <AuthCheck>
      <EnhancedSearchContent />
    </AuthCheck>
  )
}

function EnhancedSearchContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [useRiskRAG, setUseRiskRAG] = useState(true)
  const [riskSummary, setRiskSummary] = useState('')
  const [alerts, setAlerts] = useState<any[]>([])
  const [filters, setFilters] = useState({
    riskLevel: '',
    compliance: '',
    dateRange: ''
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    
    try {
      const endpoint = useRiskRAG ? '/api/rag/vercel-search' : '/api/search'
      
      const response = await fetch(endpoint, {
        method: useRiskRAG ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: useRiskRAG ? JSON.stringify({
          query: searchQuery,
          filters,
          useRiskAnalysis: true
        }) : undefined,
        ...(!useRiskRAG && {
          method: 'GET',
          body: undefined
        })
      })
      
      if (!useRiskRAG) {
        // For regular search, use GET with query params
        const searchParams = new URLSearchParams({ q: searchQuery })
        Object.entries(filters).forEach(([key, value]) => {
          if (value) searchParams.append(key, value)
        })
        
        const response = await fetch(`/api/search?${searchParams}`)
        const data = await response.json()
        setSearchResults(data.results || [])
        setRiskSummary('')
        setAlerts([])
      } else {
        // For RAG search
        const data = await response.json()
        setSearchResults(data.results || [])
        setRiskSummary(data.riskSummary || '')
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-700 bg-red-100 border-red-300'
      case 'HIGH': return 'text-orange-700 bg-orange-100 border-orange-300'
      case 'MEDIUM': return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'LOW': return 'text-green-700 bg-green-100 border-green-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Risk-Aware Document Search</h1>
          <p className="mt-2 text-gray-600">
            Search with banking risk intelligence powered by local AI
          </p>
        </div>

        {/* Search Mode Toggle */}
        <div className="mb-4 flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useRiskRAG}
              onChange={(e) => setUseRiskRAG(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Use Banking Risk AI (Local, No External APIs)
            </span>
          </label>
          {useRiskRAG && (
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <Shield className="w-4 h-4" />
              <span>Privacy-First: All processing happens locally</span>
            </div>
          )}
        </div>

        {/* Risk Alerts */}
        {alerts.length > 0 && (
          <div className="mb-4 space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                  alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.type}</p>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white text-black placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={useRiskRAG 
                    ? "Search with risk context (e.g., 'Basel III capital requirements', 'high operational risk')"
                    : "Search documents..."
                  }
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Risk Level"
                value={filters.riskLevel}
                onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
              >
                <option value="">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="CRITICAL">Critical Risk</option>
              </Select>

              <Select
                label="Compliance Framework"
                value={filters.compliance}
                onChange={(e) => setFilters({ ...filters, compliance: e.target.value })}
              >
                <option value="">All Frameworks</option>
                <option value="BASEL_III">Basel III</option>
                <option value="SOX">SOX</option>
                <option value="GDPR">GDPR</option>
                <option value="AML_KYC">AML/KYC</option>
                <option value="DODD_FRANK">Dodd-Frank</option>
              </Select>

              <Select
                label="Date Range"
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              >
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </Select>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Risk...
                  </>
                ) : (
                  <>
                    <FileSearch className="w-5 h-5 mr-2" />
                    Search with Risk Intelligence
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Risk Summary */}
        {riskSummary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Risk Analysis Summary
            </h3>
            <div className="text-sm text-blue-800 whitespace-pre-line">
              {riskSummary}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {searchResults.length > 0 
                ? `Search Results (${searchResults.length})` 
                : 'Search Results'
              }
            </h3>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FileSearch className="mx-auto h-16 w-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No results found' : 'Start your risk-aware search'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters'
                  : 'Search for documents with banking risk intelligence'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {searchResults.map((result: any) => (
                <div key={result.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-1">{result.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{result.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskLevelColor(result.riskLevel)}`}>
                              {result.riskLevel} RISK
                            </span>
                            
                            {result.category && (
                              <span className="text-gray-500">{result.category}</span>
                            )}
                            
                            {result.score && useRiskRAG && (
                              <span className="text-gray-500">
                                Relevance: {(result.score * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>

                          {/* Risk Insights (only with RAG) */}
                          {result.riskInsights && (
                            <div className="mt-3 space-y-2">
                              {result.riskInsights.topRisks.length > 0 && (
                                <div className="flex items-start space-x-2">
                                  <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-medium text-gray-700">Key Risks:</p>
                                    <p className="text-xs text-gray-600">
                                      {result.riskInsights.topRisks.join(', ')}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {result.riskInsights.complianceGaps?.length > 0 && (
                                <div className="flex items-start space-x-2">
                                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-medium text-gray-700">Compliance Gaps:</p>
                                    <p className="text-xs text-gray-600">
                                      Missing: {result.riskInsights.complianceGaps.join(', ')}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <button 
                        onClick={() => router.push('/documents')}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Document
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banking Risk AI Info */}
        {useRiskRAG && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Banking Risk AI Features
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Understands banking terminology and risk concepts</li>
              <li>• Identifies Basel III, SOX, AML/KYC compliance requirements</li>
              <li>• Classifies risk levels based on content analysis</li>
              <li>• No external API calls - all processing is local</li>
              <li>• Lightweight model optimized for banking domain</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}