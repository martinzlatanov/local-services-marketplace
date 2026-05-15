import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { users, userRoles } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { PublicUserDto, ApiSuccessResponse, Role } from '@/lib/types'
import { eq } from 'drizzle-orm'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  const { id } = await params
  const userId = parseInt(id, 10)
  if (isNaN(userId)) {
    return NextResponse.json({ errors: { id: 'invalid' } }, { status: 400 })
  }

  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!row) {
    return NextResponse.json({ errors: { user: 'not_found' } }, { status: 404 })
  }

  // Fetch roles from user_roles table
  const roleRows = await db.select().from(userRoles).where(eq(userRoles.userId, userId))
  const roles = roleRows.map((r) => r.role as Role)

  const validRoles = Object.values(Role) as string[]
  if (roles.length === 0 || !roles.every(role => validRoles.includes(role))) {
    return NextResponse.json({ errors: { user: 'invalid_data' } }, { status: 500 })
  }

  const dto: PublicUserDto = {
    id: String(row.id),
    email: row.email,
    name: row.name ?? null,
    avatarUrl: row.avatarUrl ?? null,
    roles,
    createdAt: row.createdAt.toISOString(),
  }

  return NextResponse.json({ data: dto } as ApiSuccessResponse<PublicUserDto>)
}
