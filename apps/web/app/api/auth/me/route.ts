import { NextResponse } from 'next/server'
import { verifyJwt } from '../../../../lib/auth'

export async function GET(req: Request) {
  const token = req.headers.get('cookie')?.split('token=')[1] || null
  if (!token) return NextResponse.json({ errors: { auth: 'missing' } }, { status: 401 })
  const payload = verifyJwt(token)
  if (!payload) return NextResponse.json({ errors: { auth: 'invalid' } }, { status: 401 })
  return NextResponse.json({ user: payload })
}
