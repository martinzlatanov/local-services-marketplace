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

  // Allow public paths
  if (isPublic) {
    return NextResponse.next()
  }

  // Redirect to login if trying to access protected path without token
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect to dashboard if trying to access auth pages with token
  if (isPublicAuth && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/jobs/:path*',
    '/post-job',
    '/login',
    '/register'
  ],
}
