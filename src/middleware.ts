import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname
        
        // Public routes that don't need authentication
        const publicRoutes = [
          '/api/auth',
          '/auth',
          '/api/seed-db',
          '/api/test-db', 
          '/api/test-deployment',
          '/api/init-db',
          '/api/setup',
          '/api/bootstrap',
          '/bootstrap',
          '/db-init.html',
          '/init-db.js',
          '/',
          '/favicon.ico'
        ]
        
        // Check if current path should be allowed
        if (publicRoutes.some(route => pathname.startsWith(route) || pathname === route)) {
          return true
        }
        
        // All other routes require authentication
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
     * - api/auth (NextAuth endpoints)
     * - api/setup, api/init-db, api/bootstrap (database setup)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth|api/setup|api/init-db|api/bootstrap|api/seed-db|api/test-db|init\\.html).*)',
  ]
}