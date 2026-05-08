import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.DATABASE_URL
  if (!url) return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })

  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(url)
    const result = await sql`SELECT current_database(), current_user, version()`
    return NextResponse.json({ ok: true, db: result[0] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message, code: e?.code }, { status: 500 })
  }
}
