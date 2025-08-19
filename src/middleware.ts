import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Let all API routes through (they handle their own auth if needed)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Let auth routes through
  if (pathname.startsWith('/auth') || pathname === '/') {
    return NextResponse.next()
  }
  
  // For protected page routes, check authentication
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
     * Match all request paths except:
     * - api routes (handled separately)
     * - static files
     * - auth routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ]
}