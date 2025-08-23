'use client'

import { Navigation } from '@/components/Navigation'
import { AuthCheck } from '@/components/AuthCheck'

export default function CompliancePage() {
  return (
    <AuthCheck>
      <ComplianceContent />
    </AuthCheck>
  )
}

function ComplianceContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compliance Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage compliance requirements across your organization
          </p>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Overall Compliance</h3>
              <span className="text-2xl font-bold text-green-600">87%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Audits</h3>
              <span className="text-2xl font-bold text-blue-600">12</span>
            </div>
            <p className="text-sm text-gray-600">3 require immediate attention</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
              <span className="text-2xl font-bold text-orange-600">5</span>
            </div>
            <p className="text-sm text-gray-600">Next deadline in 7 days</p>
          </div>
        </div>

        {/* Compliance Requirements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Compliance Requirements</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Sample compliance items */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900">SOC 2 Type II Certification</h4>
                <p className="text-sm text-gray-600">Last updated: March 2025 • Status: Compliant</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900">GDPR Data Protection</h4>
                <p className="text-sm text-gray-600">Review needed by: April 15, 2025 • Status: Review Required</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900">ISO 27001 Security Standards</h4>
                <p className="text-sm text-gray-600">Last updated: February 2025 • Status: Compliant</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900">PCI DSS Compliance</h4>
                <p className="text-sm text-gray-600">Action required • Status: Non-Compliant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Full Compliance Module Coming Soon</h3>
          <p className="text-blue-700">
            Advanced compliance tracking, automated audits, and regulatory reporting features are under development.
          </p>
        </div>
      </div>
    </div>
  )
}