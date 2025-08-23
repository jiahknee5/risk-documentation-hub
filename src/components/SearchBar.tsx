'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Select } from '@/components/Input'

interface SearchFilters {
  category: string
  riskLevel: string
  complianceStatus: string
  dateRange: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    riskLevel: '',
    complianceStatus: '',
    dateRange: ''
  })
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build search URL with query and filters
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (filters.category) params.set('category', filters.category)
    if (filters.riskLevel) params.set('riskLevel', filters.riskLevel)
    if (filters.complianceStatus) params.set('complianceStatus', filters.complianceStatus)
    if (filters.dateRange) params.set('dateRange', filters.dateRange)

    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      riskLevel: '',
      complianceStatus: '',
      dateRange: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents, policies, procedures..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-l-lg leading-5 bg-white text-black placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border border-l-0 border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              hasActiveFilters ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 border border-l-0 border-gray-300 rounded-r-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <Select
              label="Category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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

            {/* Risk Level Filter */}
            <Select
              label="Risk Level"
              value={filters.riskLevel}
              onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
            >
              <option value="">All Risk Levels</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>

            {/* Compliance Status Filter */}
            <Select
              label="Compliance Status"
              value={filters.complianceStatus}
              onChange={(e) => setFilters({ ...filters, complianceStatus: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="EXPIRED">Expired</option>
            </Select>

            {/* Date Range Filter */}
            <Select
              label="Date Range"
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </Select>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}