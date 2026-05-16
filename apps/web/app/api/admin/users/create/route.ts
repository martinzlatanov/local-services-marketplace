import { NextResponse } from 'next/server'
import { getAuthenticatedUser, createUser, findUserByEmail } from '@/lib/auth'
import { Role } from '@/lib/types'

export async function POST(req: Request) {
  const admin = await getAuthenticatedUser(req)
  if (!admin) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })
  if (!admin.roles.includes(Role.ADMIN)) return NextResponse.json({ errors: { role: 'admin_only' } }, { status: 403 })

  const body = await req.json()
  const email = (body.email ?? '').trim().toLowerCase()
  const password = (body.password ?? '').trim()
  const name = (body.name ?? '').trim() || null
  const role: Role = body.role && Object.values(Role).includes(body.role) ? body.role : Role.CLIENT

  if (!email || !password) {
    return NextResponse.json({ errors: { body: 'email and password are required' } }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ errors: { password: 'password must be at least 8 characters' } }, { status: 400 })
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    return NextResponse.json({ errors: { email: 'email already in use' } }, { status: 409 })
  }

  const user = await createUser({ email, password, role })

  // Set name if provided (createUser doesn't handle it, update separately)
  if (name) {
    const { db } = await import('@/lib/db/client')
    const { users } = await import('@/lib/db/schema')
    const { eq } = await import('drizzle-orm')
    await db.update(users).set({ name }).where(eq(users.id, Number(user.id)))
  }

  return NextResponse.json({ data: { ...user, name } }, { status: 201 })
}
