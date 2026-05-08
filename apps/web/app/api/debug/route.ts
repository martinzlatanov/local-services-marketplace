import { NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await createUser({ email: 'debug-test@test.com', password: 'test1234', role: 'CLIENT' as any })

    // clean up
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL!)
    await sql`DELETE FROM users WHERE email = 'debug-test@test.com'`

    return NextResponse.json({ ok: true, user })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message, code: e?.code, stack: e?.stack?.split('\n').slice(0, 5) }, { status: 500 })
  }
}
