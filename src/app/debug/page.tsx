'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  useEffect(() => {
    // Collect debug information
    const info = {
      timestamp: new Date().toISOString(),
      pathname: pathname,
      sessionStatus: status,
      sessionData: session,
      windowLocation: {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hostname: window.location.hostname
      },
      cookies: document.cookie,
      localStorage: {
        hasNextAuthSession: !!localStorage.getItem('next-auth.session-token')
      },
      navigator: {
        userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled
      }
    }
    
    setDebugInfo(info)
    
    // Test API endpoints
    Promise.all([
      fetch('/api/auth/session').then(r => ({ endpoint: '/api/auth/session', status: r.status, ok: r.ok })),
      fetch('/api/auth/providers').then(r => ({ endpoint: '/api/auth/providers', status: r.status, ok: r.ok })),
      fetch('/api/auth/csrf').then(r => ({ endpoint: '/api/auth/csrf', status: r.status, ok: r.ok }))
    ]).then(results => {
      setDebugInfo((prev: any) => ({ ...prev, apiTests: results }))
    })
  }, [pathname, session, status])
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Session:</strong> {JSON.stringify(session, null, 2)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
          <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Sign In (window.location)
            </button>
            
            <button
              onClick={() => {
                // Clear all storage
                localStorage.clear()
                sessionStorage.clear()
                // Clear cookies
                document.cookie.split(";").forEach((c) => {
                  document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
                })
                window.location.reload()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-4"
            >
              Clear All Data & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}