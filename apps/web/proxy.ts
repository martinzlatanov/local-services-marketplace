import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@/lib/db/client'
import { userRoles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyJwt } from '@/lib/auth'

const PROTECTED_PATHS = ['/dashboard', '/jobs', '/post-job']
const ADMIN_PATH_PREFIX = '/admin'
const PUBLIC_AUTH_PATHS = ['/login', '/register']
const PUBLIC_PATHS = ['/', '/api/auth']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  const isAdminPath = pathname.startsWith(ADMIN_PATH_PREFIX)
  const isPublicAuth = PUBLIC_AUTH_PATHS.some((path) => pathname.startsWith(path))
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': req.headers.get('origin') ?? '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    })
  }

  // Create response with CORS headers for API routes
  const isApiRoute = pathname.startsWith('/api/')
  let response: NextResponse

  // Admin path protection (D-17/D-18/D-19)
  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    const payload = verifyJwt(token)
    if (!payload || !payload.sub) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    const userId = parseInt(payload.sub, 10)
    // D-18: Check DB for ADMIN role
    const adminRoles = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
    const isAdmin = adminRoles.some(r => r.role === 'ADMIN')
    if (!isAdmin) {
      // D-19: Non-admins redirected to /unauthorized
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    response = NextResponse.next()
  } else if (isPublic) {
    // Allow public paths
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
    response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') ?? '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

export default proxy

export const config = {
  runtime: 'nodejs',
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/jobs/:path*',
    '/post-job',
    '/login',
    '/register',
    '/admin/:path*',
  ],
}
