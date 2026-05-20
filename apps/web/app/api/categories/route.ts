import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { jobCategories } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db
      .select({ id: jobCategories.id, name: jobCategories.name })
      .from(jobCategories)
      .orderBy(asc(jobCategories.name))

    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
