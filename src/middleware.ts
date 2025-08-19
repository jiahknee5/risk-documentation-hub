import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Allow all API routes to pass through without any authentication checks
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Allow auth routes and static files
  if (pathname.startsWith('/auth') || pathname === '/' || pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }
  
  // For now, allow all other routes (we'll add auth back later)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}