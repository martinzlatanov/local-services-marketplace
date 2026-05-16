import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { jobCategories } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { Role } from '@/lib/types'
import { eq } from 'drizzle-orm'

async function requireAdmin(req: Request) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })
  if (!user.roles.includes(Role.ADMIN)) return NextResponse.json({ errors: { role: 'admin_only' } }, { status: 403 })
  return null
}

export async function GET(req: Request) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const rows = await db.select().from(jobCategories).orderBy(jobCategories.name)
  return NextResponse.json({ data: rows })
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const body = await req.json()
  const name = (body.name ?? '').trim().toUpperCase()

  if (!name) {
    return NextResponse.json({ errors: { body: 'name is required' } }, { status: 400 })
  }

  const inserted = await db.insert(jobCategories).values({ name }).returning()
  return NextResponse.json({ data: inserted[0] }, { status: 201 })
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const { id } = await req.json()
  if (!id) return NextResponse.json({ errors: { body: 'id is required' } }, { status: 400 })

  await db.delete(jobCategories).where(eq(jobCategories.id, Number(id)))
  return NextResponse.json({ data: { ok: true } })
}
