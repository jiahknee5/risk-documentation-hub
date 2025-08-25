'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { AuthCheck } from '@/components/AuthCheck'
import { Input, Select } from '@/components/Input'

export default function SearchPage() {
  return (
    <AuthCheck>
      <SearchContent />
    </AuthCheck>
  )
}

function SearchContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [summary, setSummary] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [useAI, setUseAI] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    dateRange: '',
    fileType: '',
    riskLevel: '',
    compliance: ''
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    
    try {
      const searchParams = new URLSearchParams({
        q: searchQuery
      })
      
      // Add filters to search params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          searchParams.append(key, value)
        }
      })
      
      // Try RAG search first
      let response = await fetch('/api/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          filters: {
            riskLevel: filters.riskLevel || undefined,
            compliance: filters.compliance || undefined,
            dateRange: filters.dateRange || undefined
          },
          useAI
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
        setAlerts(data.alerts || [])
        setSummary(data.summary || '')
        setAiResponse(data.aiResponse || '')
      } else {
        // Fallback to basic search
        console.log('RAG search failed, falling back to basic search')
        response = await fetch(`/api/search?${searchParams}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.results || [])
          setAlerts([])
          setSummary('')
          setAiResponse('')
        } else {
          console.error('Search failed:', response.status, response.statusText)
          setSearchResults([])
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search Documents</h1>
          <p className="mt-2 text-gray-600">
            Find and explore your risk management documentation
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Main Search Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white text-black placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search for documents, policies, procedures..."
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="COMPLIANCE">Compliance</option>
                <option value="OPERATIONAL_RISK">Operational Risk</option>
                <option value="FINANCIAL_RISK">Financial Risk</option>
                <option value="CYBERSECURITY">Cybersecurity</option>
                <option value="REGULATORY">Regulatory</option>
                <option value="POLICY">Policy</option>
                <option value="PROCEDURE">Procedure</option>
                <option value="ASSESSMENT">Assessment</option>
                <option value="REPORT">Report</option>
              </Select>

              <Select
                label="Date Range"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </Select>

              <Select
                label="Risk Level"
                value={filters.riskLevel}
                onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              >
                <option value="">All Risk Levels</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </Select>
            </div>
            
            {/* AI Toggle */}
            <div className="flex items-center justify-center mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="sr-only"
                />
                <div className="relative">
                  <div className={`block w-14 h-8 rounded-full ${useAI ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white transition ${useAI ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Use AI-Enhanced Search (GPT-3.5)
                </span>
              </label>
            </div>

            {/* Search Button */}
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
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    Search Documents
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Risk Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            {alerts.map((alert: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg mb-3 ${
                  alert.severity === 'CRITICAL' ? 'bg-red-50 border border-red-200' :
                  alert.severity === 'HIGH' ? 'bg-orange-50 border border-orange-200' :
                  alert.severity === 'MEDIUM' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${
                    alert.severity === 'CRITICAL' ? 'text-red-600' :
                    alert.severity === 'HIGH' ? 'text-orange-600' :
                    alert.severity === 'MEDIUM' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      alert.severity === 'CRITICAL' ? 'text-red-800' :
                      alert.severity === 'HIGH' ? 'text-orange-800' :
                      alert.severity === 'MEDIUM' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {alert.type.replace(/_/g, ' ')}
                    </h3>
                    <p className={`mt-1 text-sm ${
                      alert.severity === 'CRITICAL' ? 'text-red-700' :
                      alert.severity === 'HIGH' ? 'text-orange-700' :
                      alert.severity === 'MEDIUM' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>
                      {alert.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Response */}
        {aiResponse && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Analysis</h3>
                <div className="text-gray-700 whitespace-pre-wrap">{aiResponse}</div>
              </div>
            </div>
          </div>
        )}

        {/* Search Summary */}
        {summary && (
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Search Summary</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</pre>
          </div>
        )}

        {/* Search Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {searchResults.length > 0 ? `Search Results (${searchResults.length})` : 'Search Results'}
            </h3>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No results found' : 'Start your search'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? `No documents found matching "${searchQuery}". Try adjusting your search terms or filters.`
                  : 'Enter a search term above to find documents in your risk management library.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {searchResults.map((result: any) => (
                <div key={result.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-1">
                            {result.title}
                            {result.score && (
                              <span className="ml-2 text-xs text-gray-500">Score: {(result.score * 100).toFixed(0)}%</span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {result.category}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              result.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                              result.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                              result.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {result.riskLevel} Risk
                            </span>
                            <span>Uploaded {new Date(result.createdAt).toLocaleDateString()}</span>
                            <span>{result.fileSize ? `${(result.fileSize / 1024).toFixed(1)} KB` : ''}</span>
                          </div>
                        </div>
                      </div>
                      {result.excerpt && (
                        <div className="mt-3 ml-13">
                          <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border-l-4 border-yellow-200">
                            {result.excerpt}
                          </p>
                        </div>
                      )}
                      {result.riskInsights && (
                        <div className="mt-2 ml-13">
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Risk Areas:</span> {result.riskInsights.topRisks.join(', ')}
                            {result.riskInsights.complianceGaps && (
                              <span className="ml-2">
                                <span className="font-medium">Compliance Gaps:</span> {result.riskInsights.complianceGaps.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
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

        {/* Search Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Search Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use quotes for exact phrases: "credit risk policy"</li>
            <li>• Use AND, OR, NOT for complex searches: risk AND management NOT draft</li>
            <li>• Search by document content, titles, and metadata</li>
            <li>• Use filters to narrow down results by category, date, or file type</li>
          </ul>
        </div>
      </div>
    </div>
  )
}