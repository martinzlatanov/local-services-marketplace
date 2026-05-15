import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { verifyJwt, toAuthUserDto } from '../../../../lib/auth'
import { db } from '../../../../lib/db/client'
import { users } from '../../../../lib/db/schema'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  const cookieToken = req.cookies.get('token')?.value ?? null
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '') ?? null
  const token = cookieToken ?? headerToken
  if (!token) return NextResponse.json({ errors: { auth: 'missing' } }, { status: 401 })
  const payload = verifyJwt(token)
  if (!payload) return NextResponse.json({ errors: { auth: 'invalid' } }, { status: 401 })

  // Query DB for full user row and fetch roles from user_roles table
  const rows = await db.select().from(users).where(eq(users.id, Number(payload.sub))).limit(1)
  const user = rows[0]
  if (!user) return NextResponse.json({ errors: { auth: 'invalid' } }, { status: 401 })

  const authUserDto = await toAuthUserDto(user)

  return NextResponse.json({
    user: authUserDto,
  })
}
