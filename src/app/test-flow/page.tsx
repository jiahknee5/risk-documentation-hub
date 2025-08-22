'use client'

import { useState } from 'react'

export default function TestFlowPage() {
  const [results, setResults] = useState<any[]>([])
  const [testFile, setTestFile] = useState<File | null>(null)

  const addResult = (step: string, success: boolean, details: any) => {
    setResults(prev => [...prev, {
      step,
      success,
      details,
      timestamp: new Date().toISOString()
    }])
  }

  const clearResults = () => {
    setResults([])
  }

  const runCompleteTest = async () => {
    clearResults()
    
    // Step 1: Check system status
    addResult('1. Check System Status', true, 'Starting...')
    try {
      const statusResponse = await fetch('/api/auto-upload')
      const statusData = await statusResponse.json()
      addResult('1. Check System Status', statusData.ready, statusData)
    } catch (error) {
      addResult('1. Check System Status', false, { error: error instanceof Error ? error.message : 'Failed' })
    }

    // Step 2: Create test file
    const testContent = `Test document created at ${new Date().toISOString()}`
    const file = new File([testContent], `test-doc-${Date.now()}.txt`, { type: 'text/plain' })
    setTestFile(file)
    addResult('2. Create Test File', true, {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Step 3: Upload document
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', 'Test Document')
      formData.append('description', 'Automated test document')
      formData.append('category', 'OTHER')
      formData.append('riskLevel', 'LOW')
      formData.append('tags', 'test,automated')

      // Try each upload endpoint
      const endpoints = [
        '/api/documents/upload',
        '/api/documents/simple-upload',
        '/api/documents/failsafe-upload',
        '/api/auto-upload',
        '/api/no-db-upload'
      ]

      let uploadSuccess = false
      let uploadResult = null

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
          })

          if (response.ok) {
            uploadResult = await response.json()
            addResult(`3. Upload (${endpoint})`, true, uploadResult)
            uploadSuccess = true
            break
          } else {
            const error = await response.json()
            addResult(`3. Upload (${endpoint})`, false, error)
          }
        } catch (error) {
          addResult(`3. Upload (${endpoint})`, false, { error: 'Network error' })
        }
      }

      if (!uploadSuccess) {
        addResult('3. Upload Document', false, { error: 'All endpoints failed' })
        return
      }
    } catch (error) {
      addResult('3. Upload Document', false, { error: error instanceof Error ? error.message : 'Failed' })
      return
    }

    // Step 4: Fetch documents
    try {
      // Try multiple endpoints
      const listEndpoints = [
        '/api/documents',
        '/api/documents/list',
        '/api/no-db-upload'
      ]

      let fetchSuccess = false
      let documents = []

      for (const endpoint of listEndpoints) {
        try {
          const response = await fetch(endpoint)
          if (response.ok) {
            const data = await response.json()
            if (Array.isArray(data)) {
              documents = data
            } else if (data.documents && Array.isArray(data.documents)) {
              documents = data.documents
            }
            
            if (documents.length > 0) {
              addResult(`4. Fetch Documents (${endpoint})`, true, {
                count: documents.length,
                latest: documents[0]
              })
              fetchSuccess = true
              break
            }
          }
        } catch (error) {
          // Continue to next endpoint
        }
      }

      if (!fetchSuccess) {
        addResult('4. Fetch Documents', false, { error: 'No documents found' })
      }
    } catch (error) {
      addResult('4. Fetch Documents', false, { error: error instanceof Error ? error.message : 'Failed' })
    }

    // Step 5: Verify document appears
    try {
      const response = await fetch('/api/documents/list')
      if (response.ok) {
        const data = await response.json()
        const docs = data.documents || []
        const ourDoc = docs.find((d: any) => d.fileName === testFile?.name)
        
        if (ourDoc) {
          addResult('5. Verify Document', true, {
            found: true,
            document: ourDoc
          })
        } else {
          addResult('5. Verify Document', false, {
            found: false,
            totalDocs: docs.length
          })
        }
      }
    } catch (error) {
      addResult('5. Verify Document', false, { error: error instanceof Error ? error.message : 'Failed' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Complete Upload Flow Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          <div className="space-x-2">
            <button
              onClick={runCompleteTest}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Run Complete Test
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
                <div key={index} className={`border-l-4 ${result.success ? 'border-green-500' : 'border-red-500'} pl-4`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${result.success ? '✅' : '❌'}`}></span>
                    <h3 className="font-medium">{result.step}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{result.timestamp}</p>
                  <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">What this test does:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>Checks if the system is ready (database, user)</li>
            <li>Creates a test file programmatically</li>
            <li>Uploads the file trying multiple endpoints</li>
            <li>Fetches the document list</li>
            <li>Verifies the uploaded document appears in the list</li>
          </ol>
        </div>
      </div>
    </div>
  )
}