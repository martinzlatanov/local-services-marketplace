import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL!)

    // Check tables
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`

    // Check users table columns
    const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`

    // Try inserting a test user
    const bcrypt = await import('bcrypt')
    const hash = await bcrypt.hash('debugtest123', 10)
    let insertResult = null
    let insertError = null
    try {
      const rows = await sql`INSERT INTO users (email, password_hash, role) VALUES ('debug-test@test.com', ${hash}, 'CLIENT') RETURNING id, email, role`
      insertResult = rows[0]
      // Clean up
      await sql`DELETE FROM users WHERE email = 'debug-test@test.com'`
    } catch (e: any) {
      insertError = { message: e?.message, code: e?.code }
    }

    return NextResponse.json({ tables, columns, insertResult, insertError })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, code: e?.code }, { status: 500 })
  }
}
