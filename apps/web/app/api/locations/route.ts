import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { locations } from '@/lib/db/schema'

export async function GET() {
  const rows = await db.select().from(locations).orderBy(locations.name)
  return NextResponse.json({ data: rows })
}
