'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (session) {
      // User is logged in, redirect to dashboard
      router.push('/dashboard')
    } else {
      // User is not logged in, redirect to signin
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Show loading while checking session
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-600">Loading...</div>
    </div>
  )
}
