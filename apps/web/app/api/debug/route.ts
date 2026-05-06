import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req)
  if (!user) {
    return NextResponse.json({ 
      error: 'No user found', 
      headers: {
        auth: req.headers.get('Authorization')?.substring(0, 20),
        cookie: req.headers.get('cookie')?.substring(0, 50)
      }
    }, { status: 401 })
  }
  return NextResponse.json({ user })
}
