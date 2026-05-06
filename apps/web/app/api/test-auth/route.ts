import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie")
  let token = null
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map(c => c.trim())
    const tokenCookie = cookies.find(c => c.startsWith("token="))
    if (tokenCookie) {
      token = tokenCookie.substring(6)
    }
  }
  
  if (!token) {
    return NextResponse.json({ error: 'No token found' }, { status: 400 })
  }
  
  const payload = verifyJwt(token)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  
  return NextResponse.json({ payload })
}
