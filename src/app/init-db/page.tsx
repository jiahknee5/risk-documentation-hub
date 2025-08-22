'use client'

import { useState } from 'react'

export default function InitDBPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auto-upload')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({ error: error instanceof Error ? error.message : 'Failed' })
    }
    setLoading(false)
  }

  const initDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/init-upload')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({ error: error instanceof Error ? error.message : 'Failed' })
    }
    setLoading(false)
  }

  const seedDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seed-db?secret=setup-risk-docs-2024', {
        method: 'POST'
      })
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({ error: error instanceof Error ? error.message : 'Failed' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Database Initialization</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Database Status</h2>
          <div className="space-y-2 mb-4">
            <button
              onClick={checkStatus}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Check Status
            </button>
          </div>
          
          {status && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(status, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Initialization Actions</h2>
          <div className="space-y-4">
            <div>
              <button
                onClick={initDatabase}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Initialize Upload System
              </button>
              <p className="text-sm text-gray-600 mt-1">Creates database and default user</p>
            </div>
            
            <div>
              <button
                onClick={seedDatabase}
                disabled={loading}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Seed Database
              </button>
              <p className="text-sm text-gray-600 mt-1">Creates test users and sample documents</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">If uploads are failing:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
            <li>Click "Check Status" to see current state</li>
            <li>If database is "not ready", click "Initialize Upload System"</li>
            <li>Optionally click "Seed Database" for test data</li>
            <li>Try uploading again</li>
          </ol>
        </div>
      </div>
    </div>
  )
}