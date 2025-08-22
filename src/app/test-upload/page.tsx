'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function TestUploadPage() {
  const { data: session } = useSession()
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    setTestResults(null)

    const formData = new FormData()
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    formData.append('file', testFile)

    try {
      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Upload Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">Session Status</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={runTest}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
          >
            {isLoading ? 'Running Test...' : 'Run Upload Test'}
          </button>

          {testResults && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Test Results</h2>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}