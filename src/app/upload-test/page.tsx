'use client'

import { useState } from 'react'

export default function UploadTestPage() {
  const [results, setResults] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }])
  }

  const clearResults = () => {
    setResults([])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      addResult('File Selected', {
        name: file.name,
        size: file.size,
        type: file.type
      })
    }
  }

  const testBasicAPI = async () => {
    try {
      const response = await fetch('/api/test-basic')
      const data = await response.json()
      addResult('Basic API Test', { status: response.status, data })
    } catch (error) {
      addResult('Basic API Test', { error: error instanceof Error ? error.message : 'Failed' })
    }
  }

  const testFileUpload = async () => {
    if (!selectedFile) {
      addResult('File Upload Test', { error: 'No file selected' })
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const response = await fetch('/api/test-file', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      addResult('File Upload Test', { status: response.status, data })
    } catch (error) {
      addResult('File Upload Test', { error: error instanceof Error ? error.message : 'Failed' })
    }
  }

  const testDocumentUpload = async () => {
    if (!selectedFile) {
      addResult('Document Upload Test', { error: 'No file selected' })
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', 'Test Document')
      formData.append('category', 'OTHER')
      formData.append('riskLevel', 'LOW')
      
      const response = await fetch('/api/documents/failsafe-upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      addResult('Document Upload Test', { status: response.status, data })
    } catch (error) {
      addResult('Document Upload Test', { error: error instanceof Error ? error.message : 'Failed' })
    }
  }

  const testDeploymentStatus = async () => {
    try {
      const response = await fetch('/api/deployment-status')
      const data = await response.json()
      addResult('Deployment Status', { status: response.status, data })
    } catch (error) {
      addResult('Deployment Status', { error: error instanceof Error ? error.message : 'Failed' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Upload Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Step 1: Select a File</h2>
          <input
            type="file"
            onChange={handleFileSelect}
            className="mb-4"
          />
          {selectedFile && (
            <div className="text-sm text-gray-600">
              Selected: {selectedFile.name} ({selectedFile.size} bytes)
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Step 2: Run Tests</h2>
          <div className="space-x-2">
            <button
              onClick={testBasicAPI}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Basic API
            </button>
            <button
              onClick={testFileUpload}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={!selectedFile}
            >
              Test File Upload
            </button>
            <button
              onClick={testDocumentUpload}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              disabled={!selectedFile}
            >
              Test Document Upload
            </button>
            <button
              onClick={testDeploymentStatus}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Check Deployment
            </button>
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          {results.length === 0 ? (
            <p className="text-gray-500">No tests run yet</p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="font-medium text-blue-600">{result.test}</h3>
                  <p className="text-xs text-gray-500">{result.timestamp}</p>
                  <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}