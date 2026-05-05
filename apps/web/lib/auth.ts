import bcrypt from 'bcrypt'
import { sign, verify } from 'jsonwebtoken'
import { db } from './db/client'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'
import { AuthRegisterRequest, AuthLoginRequest, AuthUserDto, Role } from '@local/types'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const JWT_EXPIRES_IN = '15m'

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

export async function createUser(payload: AuthRegisterRequest) : Promise<AuthUserDto> {
  const { email, password, role } = payload
  const passwordHash = await hashPassword(password)
  const userRole = role ?? Role.CLIENT
  await db.insert(users).values({ email, passwordHash, role: userRole })
  const created = await db.select().from(users).where(eq(users.email, email))
  const userRow = created[0]
  return { id: String(userRow.id), email: userRow.email, role: userRow.role as any, createdAt: (userRow.createdAt instanceof Date) ? userRow.createdAt.toISOString() : String(userRow.createdAt) }
}

export async function findUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email))
  return rows[0] || null
}

export async function toAuthUserDto(row: any): Promise<AuthUserDto> {
  return { id: String(row.id), email: row.email, role: row.role as any, createdAt: (row.createdAt instanceof Date) ? row.createdAt.toISOString() : String(row.createdAt) }
}
