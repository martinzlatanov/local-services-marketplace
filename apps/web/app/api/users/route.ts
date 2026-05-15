import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { users, userRoles } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { PublicUserDto, ApiSuccessResponse, Role } from '@/lib/types'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  const url = new URL(req.url)
  const roleParam = url.searchParams.get('role')

  // Fetch all users
  const allUsers = await db.select().from(users)

  // Fetch all user roles
  const allUserRoles = await db.select().from(userRoles)
  const userRolesMap = new Map<number, Role[]>()

  allUserRoles.forEach((ur) => {
    const existing = userRolesMap.get(ur.userId) || []
    userRolesMap.set(ur.userId, [...existing, ur.role as Role])
  })

  // Filter by role if specified
  let filteredUsers = allUsers
  if (roleParam) {
    filteredUsers = allUsers.filter((u) => {
      const roles = userRolesMap.get(u.id) || []
      return roles.includes(roleParam as Role)
    })
  }

  // Convert to DTOs
  const dtos: PublicUserDto[] = filteredUsers.map((row) => {
    const roles = userRolesMap.get(row.id) || []
    return {
      id: String(row.id),
      email: row.email,
      name: row.name ?? null,
      avatarUrl: row.avatarUrl ?? null,
      roles,
      createdAt: row.createdAt.toISOString(),
    }
  })

  return NextResponse.json({ data: dtos } as ApiSuccessResponse<PublicUserDto[]>)
}
