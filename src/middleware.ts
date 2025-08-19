import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
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
    '/favicon.ico',
    '/_next',
    '/public'
  ]
  
  // Check if current path should be allowed without auth
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route) || pathname === route)
  
  console.log(`Middleware: ${pathname} - isPublic: ${isPublicRoute}`)
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // For protected routes, check authentication
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  if (!token) {
    // Redirect to signin page
    const url = request.nextUrl.clone()
    url.pathname = '/api/auth/signin'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}