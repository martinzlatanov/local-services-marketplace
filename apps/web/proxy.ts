import { NextResponse, type NextRequest } from 'next/server'
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

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': req.headers.get('origin') ?? '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const isApiRoute = pathname.startsWith('/api/')
  let response: NextResponse

  if (isAdminPath || isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    const payload = verifyJwt(token)
    if (!payload) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    response = NextResponse.next()
  } else if (isPublic) {
    response = NextResponse.next()
  } else if (isPublicAuth && token) {
    response = NextResponse.redirect(new URL('/dashboard', req.url))
  } else {
    response = NextResponse.next()
  }

  if (isApiRoute) {
    response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') ?? '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

export default proxy

export const config = {
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
