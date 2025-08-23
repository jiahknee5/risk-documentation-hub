'use client'

import { Navigation } from '@/components/Navigation'
import { AuthCheck } from '@/components/AuthCheck'

export default function AnalyticsPage() {
  return (
    <AuthCheck>
      <AnalyticsContent />
    </AuthCheck>
  )
}

function AnalyticsContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Risk Analytics</h1>
          <p className="mt-2 text-gray-600">
            Analyze trends, patterns, and insights from your risk documentation
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Documents</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">1,247</div>
            <div className="mt-2 text-sm text-green-600">↑ 12% from last month</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Users</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">89</div>
            <div className="mt-2 text-sm text-green-600">↑ 5% from last month</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Risk Score</div>
            <div className="mt-2 text-3xl font-bold text-orange-600">6.8</div>
            <div className="mt-2 text-sm text-red-600">↑ 0.3 from last month</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Compliance Rate</div>
            <div className="mt-2 text-3xl font-bold text-green-600">87%</div>
            <div className="mt-2 text-sm text-gray-600">→ No change</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Document Upload Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Upload Trends</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>

          {/* Risk Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Category Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Operational Risk</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Financial Risk</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cybersecurity</span>
                  <span className="font-medium">22%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Compliance</span>
                  <span className="font-medium">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">New compliance document uploaded</p>
                  <p className="text-xs text-gray-500">2 hours ago by Sarah Johnson</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">Risk assessment completed for Q2</p>
                  <p className="text-xs text-gray-500">5 hours ago by Michael Chen</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">Critical risk identified in IT infrastructure</p>
                  <p className="text-xs text-gray-500">1 day ago by System</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Advanced Analytics Coming Soon</h3>
          <p className="text-blue-700">
            Interactive charts, predictive analytics, and custom reporting features are under development.
          </p>
        </div>
      </div>
    </div>
  )
}