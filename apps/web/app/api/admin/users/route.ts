import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { users, userRoles } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { AdminUserDto, Role, ApiSuccessResponse } from '@/lib/types'
import { eq, and, inArray, ilike } from 'drizzle-orm'

const PAGE_SIZE = 20

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })
  if (!user.roles.includes(Role.ADMIN)) {
    return NextResponse.json({ errors: { role: 'admin_only' } }, { status: 403 })
  }

  const url = new URL(req.url)
  const search = url.searchParams.get('search') ?? ''
  const roleFilter = url.searchParams.get('role') ?? ''
  const statusFilter = url.searchParams.get('status') ?? ''
  const page = Math.max(0, parseInt(url.searchParams.get('page') ?? '0', 10))
  const offset = page * PAGE_SIZE

  // Build where clause
  const conditions = []
  if (search) conditions.push(ilike(users.email, `%${search}%`))
  if (statusFilter) conditions.push(eq(users.status, statusFilter))

  // Fetch users (paginated)
  const userRows = await db
    .select()
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(users.createdAt)
    .limit(PAGE_SIZE + 1)
    .offset(offset)

  const hasMore = userRows.length > PAGE_SIZE
  const pageRows = userRows.slice(0, PAGE_SIZE)
  const userIds = pageRows.map(u => u.id)

  // Fetch all roles for this page
  const allRoleRows = userIds.length > 0
    ? await db.select().from(userRoles).where(inArray(userRoles.userId, userIds))
    : []

  // Group roles by userId
  const rolesByUserId = new Map<number, Role[]>()
  for (const rr of allRoleRows) {
    if (!rolesByUserId.has(rr.userId)) rolesByUserId.set(rr.userId, [])
    rolesByUserId.get(rr.userId)!.push(rr.role as Role)
  }

  // Build DTOs and apply role filter
  let dtos: AdminUserDto[] = pageRows.map(u => ({
    id: String(u.id),
    email: u.email,
    name: u.name ?? null,
    avatarUrl: u.avatarUrl ?? null,
    roles: rolesByUserId.get(u.id) ?? [],
    status: u.status,
    createdAt: u.createdAt.toISOString(),
  }))

  if (roleFilter) {
    dtos = dtos.filter(u => u.roles.includes(roleFilter as Role))
  }

  return NextResponse.json({
    data: {
      users: dtos,
      page,
      hasMore,
    },
  } as ApiSuccessResponse<{ users: AdminUserDto[]; page: number; hasMore: boolean }>)
}
