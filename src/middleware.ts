import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Allow the request to continue
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname
        
        // Allow auth endpoints and setup
        if (pathname.startsWith('/api/auth') || 
            pathname.startsWith('/auth') ||
            pathname === '/api/seed-db' ||
            pathname === '/api/test-db' ||
            pathname === '/api/init-db' ||
            pathname === '/api/setup' ||
            pathname === '/api/bootstrap' ||
            pathname === '/bootstrap' ||
            pathname === '/db-init.html' ||
            pathname === '/' ||
            pathname === '/favicon.ico') {
          return true
        }
        
        // Log for debugging
        console.log('Middleware check:', {
          pathname,
          hasToken: !!token,
          tokenSub: token?.sub,
          tokenRole: token?.role
        })
        
        // Require authentication for all other routes
        return !!token
      }
    }
  }
)

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ]
}