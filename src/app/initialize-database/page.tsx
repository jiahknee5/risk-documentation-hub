'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InitializeDatabase() {
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<boolean>(false)
  const router = useRouter()
  
  const initializeDatabase = async () => {
    setStatus('Starting database initialization...')
    setError('')
    
    try {
      // Try the test-db endpoint first
      const response = await fetch('/api/test-db')
      const data = await response.json()
      
      if (data.success && data.userCount > 0) {
        setStatus('✅ Database already initialized!')
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
        return
      }
      
      // If not initialized, try other endpoints
      const endpoints = ['/api/setup', '/api/bootstrap', '/api/init', '/api/emergency-init', '/api/db-setup']
      
      for (const endpoint of endpoints) {
        setStatus(`Trying ${endpoint}...`)
        
        try {
          const res = await fetch(endpoint)
          const result = await res.json()
          
          if (result.success) {
            setStatus(`✅ Database initialized successfully via ${endpoint}!`)
            setSuccess(true)
            setTimeout(() => {
              router.push('/auth/signin')
            }, 2000)
            return
          }
        } catch (e) {
          console.log(`${endpoint} failed:`, e)
        }
      }
      
      // If all endpoints fail, try seed-db
      setStatus('Trying seed endpoint...')
      const seedResponse = await fetch('/api/seed-db?secret=setup-risk-docs-2024', {
        method: 'POST'
      })
      const seedData = await seedResponse.json()
      
      if (seedData.success) {
        setStatus('✅ Database seeded successfully!')
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        throw new Error(seedData.error || 'All initialization attempts failed')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setStatus('❌ Database initialization failed')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Database Initialization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Click the button below to initialize the database with demo users
          </p>
        </div>
        
        <div className="space-y-4">
          {!success && !error && (
            <button
              onClick={initializeDatabase}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Initialize Database
            </button>
          )}
          
          {status && (
            <div className={`p-4 rounded-md ${success ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
              {status}
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md">
              <p className="font-semibold">Error:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="text-center space-y-2">
              <p className="text-green-600 font-semibold">Database initialized successfully!</p>
              <p className="text-sm text-gray-600">Demo credentials:</p>
              <div className="text-sm font-mono bg-gray-100 p-3 rounded">
                <p>admin@example.com / password123</p>
                <p>manager@example.com / password123</p>
                <p>user@example.com / password123</p>
                <p>viewer@example.com / password123</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}