import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/jobs', '/post-job']
const PUBLIC_AUTH_PATHS = ['/login', '/register']
const PUBLIC_PATHS = ['/', '/api/auth']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  const isPublicAuth = PUBLIC_AUTH_PATHS.some((path) => pathname.startsWith(path))
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:8081',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    })
  }

  // Create response with CORS headers for API routes
  const isApiRoute = pathname.startsWith('/api/')
  let response: NextResponse

  // Allow public paths
  if (isPublic) {
    response = NextResponse.next()
  } else if (isProtected && !token) {
    // Redirect to login if trying to access protected path without token
    response = NextResponse.redirect(new URL('/login', req.url))
  } else if (isPublicAuth && token) {
    // Redirect to dashboard if trying to access auth pages with token
    response = NextResponse.redirect(new URL('/dashboard', req.url))
  } else {
    response = NextResponse.next()
  }

  // Add CORS headers for API routes
  if (isApiRoute) {
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8081')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/jobs/:path*',
    '/post-job',
    '/login',
    '/register'
  ],
}
