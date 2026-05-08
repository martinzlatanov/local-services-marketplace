import { NextResponse } from 'next/server'
import { createUser, signJwt } from '../../../../lib/auth'
import { ApiErrorResponse, AuthRegisterRequest, AuthRegisterResponse } from '@/lib/types'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid json' } }, { status: 400 })
  const payload = body as AuthRegisterRequest
  if (!payload.email || !payload.password) {
    return NextResponse.json({ errors: { email: 'required', password: 'required' } }, { status: 400 })
  }
  try {
    const existing = await createUser({ email: payload.email, password: payload.password, role: payload.role })
    const token = signJwt({ sub: existing.id, email: existing.email })
    const response: AuthRegisterResponse = { user: existing }
    const res = NextResponse.json({ ...response, token }, { status: 201 })
    res.cookies.set('token', token, { httpOnly: true, sameSite: 'none', secure: false })
    return res
  } catch (e: any) {
    if (e?.code !== '23505') console.error('[register] createUser failed:', e)
    const msg = (e && e.code === '23505') ? { errors: { email: 'already_exists' } } : { errors: { server: 'error' } }
    const status = (e && e.code === '23505') ? 409 : 500
    return NextResponse.json(msg as unknown as ApiErrorResponse, { status })
  }
}
