import { NextResponse } from 'next/server'
import { createUser } from '../../../../lib/auth'
import { ApiErrorResponse, AuthRegisterRequest, AuthRegisterResponse } from '@local/types'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid json' } }, { status: 400 })
  const payload = body as AuthRegisterRequest
  if (!payload.email || !payload.password) {
    return NextResponse.json({ errors: { email: 'required', password: 'required' } }, { status: 400 })
  }
  try {
    const existing = await createUser({ email: payload.email, password: payload.password, role: payload.role })
    const response: AuthRegisterResponse = { user: existing }
    return NextResponse.json(response, { status: 201 })
  } catch (e: any) {
    // simplistic duplicate detection — Drizzle insert may throw PG error code 23505
    const msg = (e && e.code === '23505') ? { errors: { email: 'already_exists' } } : { errors: { server: 'error' } }
    const status = (e && e.code === '23505') ? 409 : 500
    return NextResponse.json(msg as ApiErrorResponse, { status })
  }
}
