'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  
  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (session) {
      // User is logged in, redirect to dashboard
      redirect('/dashboard')
    } else {
      // User is not logged in, redirect to signin
      redirect('/auth/signin')
    }
  }, [session, status])

  // Show loading while checking session
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-600">Loading...</div>
    </div>
  )
}
