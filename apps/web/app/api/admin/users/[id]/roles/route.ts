import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { userRoles } from '@/lib/db/schema'
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

  const { roles } = body as { roles?: string[] }
  const validRoles = Object.values(Role) as string[]

  if (!Array.isArray(roles) || roles.length === 0) {
    return NextResponse.json({ errors: { roles: 'minimum_one_role_required' } }, { status: 400 })
  }
  if (roles.some(r => !validRoles.includes(r))) {
    return NextResponse.json({ errors: { roles: 'invalid_role_value' } }, { status: 400 })
  }

  // D-16: Self-protection
  const isSelf = parseInt(user.id, 10) === targetId
  if (isSelf && !roles.includes(Role.ADMIN)) {
    return NextResponse.json(
      { errors: { roles: 'cannot_remove_own_admin_role' } },
      { status: 403 }
    )
  }

  // Full-replace
  await db.delete(userRoles).where(eq(userRoles.userId, targetId))
  await db.insert(userRoles).values(roles.map(r => ({ userId: targetId, role: r })))

  return NextResponse.json({ data: { id: String(targetId), roles } })
}
