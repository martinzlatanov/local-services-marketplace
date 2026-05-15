import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { Role } from '@/lib/types'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })
  if (!user.roles.includes(Role.ADMIN)) {
    return NextResponse.json({ errors: { role: 'admin_only' } }, { status: 403 })
  }

  const { id } = await params
  const targetId = parseInt(id, 10)
  if (isNaN(targetId)) return NextResponse.json({ errors: { id: 'invalid' } }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid_json' } }, { status: 400 })

  const { status } = body as { status?: string }
  if (status !== 'active' && status !== 'suspended') {
    return NextResponse.json({ errors: { status: 'must_be_active_or_suspended' } }, { status: 400 })
  }

  const rows = await db.select().from(users).where(eq(users.id, targetId)).limit(1)
  if (!rows[0]) return NextResponse.json({ errors: { user: 'not_found' } }, { status: 404 })

  await db.update(users).set({ status }).where(eq(users.id, targetId))

  return NextResponse.json({ data: { id: String(targetId), status } })
}
