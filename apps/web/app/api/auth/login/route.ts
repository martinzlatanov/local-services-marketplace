import { NextResponse } from 'next/server'
import { findUserByEmail, verifyPassword, signJwt, toAuthUserDto } from '../../../../lib/auth'
import { AuthLoginRequest } from '@/lib/types'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid json' } }, { status: 400 })
  const payload = body as AuthLoginRequest
  if (!payload.email || !payload.password) return NextResponse.json({ errors: { email: 'required', password: 'required' } }, { status: 400 })
  const user = await findUserByEmail(payload.email)
  if (!user) return NextResponse.json({ errors: { email: 'not_found' } }, { status: 401 })
  const ok = await verifyPassword(payload.password, user.passwordHash)
  if (!ok) return NextResponse.json({ errors: { credentials: 'invalid' } }, { status: 401 })
  const token = signJwt({ sub: String(user.id), email: user.email })
  // Fetch roles from user_roles table
  const authUserDto = await toAuthUserDto(user)
  // Set httpOnly cookie via NextResponse
  const res = NextResponse.json({ user: authUserDto, token })
  res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax' })
  return res
}
