'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Shield,
  FileText,
  Search,
  Upload,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Navbar from './Navbar'
import SearchBar from './SearchBar'
import DocumentCard from './DocumentCard'
import StatsCard from './StatsCard'
import { getApiUrl } from '@/lib/config'

interface DashboardStats {
  totalDocuments: number
  pendingApprovals: number
  expiringSoon: number
  criticalRisk: number
  recentUploads: number
  complianceRate: number
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentDocuments, setRecentDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const [documentsRes, statsRes] = await Promise.all([
        fetch(getApiUrl('/documents?limit=5&sortBy=createdAt&sortOrder=desc')),
        fetch(getApiUrl('/dashboard/stats'))
      ])

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json()
        setRecentDocuments(documentsData.documents || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      } else {
        // Fallback to mock stats if API fails
        setStats({
          totalDocuments: 0,
          pendingApprovals: 0,
          expiringSoon: 0,
          criticalRisk: 0,
          recentUploads: 0,
          complianceRate: 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your risk documentation system
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Documents"
            value={stats?.totalDocuments || 0}
            icon={<FileText className="h-6 w-6" />}
            color="blue"
            change={+12}
          />
          <StatsCard
            title="Pending Approvals"
            value={stats?.pendingApprovals || 0}
            icon={<Clock className="h-6 w-6" />}
            color="yellow"
            change={-3}
          />
          <StatsCard
            title="Expiring Soon"
            value={stats?.expiringSoon || 0}
            icon={<AlertTriangle className="h-6 w-6" />}
            color="orange"
            change={+2}
          />
          <StatsCard
            title="Critical Risk"
            value={stats?.criticalRisk || 0}
            icon={<Shield className="h-6 w-6" />}
            color="red"
            change={-1}
          />
          <StatsCard
            title="Recent Uploads"
            value={stats?.recentUploads || 0}
            icon={<Upload className="h-6 w-6" />}
            color="green"
            change={+15}
          />
          <StatsCard
            title="Compliance Rate"
            value={`${stats?.complianceRate || 0}%`}
            icon={<CheckCircle className="h-6 w-6" />}
            color="emerald"
            change={+5}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Documents */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
              </div>
              <div className="p-6">
                {recentDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {recentDocuments.map((doc: any) => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No documents found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Upload Document */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  <Search className="h-4 w-4 mr-2" />
                  Advanced Search
                </button>
                {session?.user?.role === 'ADMIN' && (
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </button>
                )}
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SOX Compliance</span>
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Compliant
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">GDPR Compliance</span>
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Compliant
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ISO 27001</span>
                  <span className="flex items-center text-yellow-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Review Needed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">PCI DSS</span>
                  <span className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-1" />
                    Non-Compliant
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}