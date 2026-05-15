import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { Role } from '@/lib/types'
import { inArray } from 'drizzle-orm'

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })
  if (!user.roles.includes(Role.ADMIN)) {
    return NextResponse.json({ errors: { role: 'admin_only' } }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid_json' } }, { status: 400 })

  const { userIds, status } = body as { userIds?: number[]; status?: string }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ errors: { userIds: 'required_non_empty_array' } }, { status: 400 })
  }
  if (status !== 'active' && status !== 'suspended') {
    return NextResponse.json({ errors: { status: 'must_be_active_or_suspended' } }, { status: 400 })
  }

  // Single atomic UPDATE (no transaction needed)
  await db.update(users).set({ status }).where(inArray(users.id, userIds))

  return NextResponse.json({ data: { updated: userIds.length, status } })
}
