import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { locations } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db
      .select({ id: locations.id, name: locations.name })
      .from(locations)
      .orderBy(asc(locations.name))

    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/locations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
