import bcrypt from "bcrypt"
import { sign, verify } from "jsonwebtoken"
// Lazy-load database modules at runtime to avoid importing Drizzle at module
// initialization time (Prevents Next dev server from failing when DB/env
// are not configured). Imports below are performed inside functions.
import { AuthRegisterRequest, AuthLoginRequest, AuthUserDto, Role } from "@/lib/types"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"
const JWT_EXPIRES_IN = "45m"

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signJwt(payload: Record<string, any>) {
  return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyJwt(token: string) {
  try {
    return verify(token, JWT_SECRET) as any
  } catch (e) {
    return null
  }
}

export async function getAuthenticatedUser(req: Request): Promise<AuthUserDto | null> {
  let token: string | undefined
  const authHeader = req.headers.get("Authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7)
  }
  if (!token) {
    const cookieHeader = req.headers.get("cookie")
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map(c => c.trim())
      const tokenCookie = cookies.find(c => c.startsWith("token="))
      if (tokenCookie) {
        token = tokenCookie.substring(6)
      }
    }
  }
  if (!token) { ; return null }
  const payload = verifyJwt(token)
  if (!payload || !payload.sub) { ; return null }
  const { db } = await import("@/lib/db/client")
  const { users, userRoles } = await import("@/lib/db/schema")
  const { eq } = await import("drizzle-orm")
  const rows = await db.select().from(users).where((eq as any)(users.id, parseInt(payload.sub)))
  if (!rows[0]) return null
  const row = rows[0]
  if (row.status === 'suspended') return null
  return toAuthUserDto(row)
}

export async function createUser(payload: AuthRegisterRequest) : Promise<AuthUserDto> {
  const { email, password, role } = payload
  const passwordHash = await hashPassword(password)
  const userRole = role ?? Role.CLIENT
  const { db } = await import("@/lib/db/client")
  const { users, userRoles } = await import("@/lib/db/schema")
  const created = await db.insert(users).values({ email, passwordHash, status: 'active' }).returning()
  const userRow = created[0]
  await db.insert(userRoles).values({ userId: userRow.id, role: userRole })
  return { id: String(userRow.id), email: userRow.email, roles: [userRole], status: 'active', createdAt: (userRow.createdAt instanceof Date) ? userRow.createdAt.toISOString() : String(userRow.createdAt) }
}

export async function findUserByEmail(email: string) {
  const { db } = await import("@/lib/db/client")
  const { users } = await import("@/lib/db/schema")
  const { eq } = await import("drizzle-orm")
  const rows = await db.select().from(users).where((eq as any)(users.email, email))
  return rows[0] || null
}

export async function toAuthUserDto(row: any): Promise<AuthUserDto> {
  const { db } = await import("@/lib/db/client")
  const { userRoles } = await import("@/lib/db/schema")
  const { eq } = await import("drizzle-orm")
  const roleRows = await db.select().from(userRoles).where((eq as any)(userRoles.userId, row.id))
  const roles = roleRows.map((r: any) => r.role as Role)
  return { id: String(row.id), email: row.email, roles, status: row.status, createdAt: (row.createdAt instanceof Date) ? row.createdAt.toISOString() : String(row.createdAt) }
}
