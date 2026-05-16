import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { jobCategories } from '@/lib/db/schema'

export async function GET() {
  const rows = await db.select().from(jobCategories).orderBy(jobCategories.name)
  return NextResponse.json({ data: rows })
}
