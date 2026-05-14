/** @jest-environment node */

import { GET } from '@/app/api/test-auth/route'
import { signJwt } from '@/lib/auth'

describe('/api/test-auth', () => {
  it('returns both payload and user data for the current session', async () => {
    const token = signJwt({ sub: '42', email: 'provider@example.com' })
    const request = new Request('http://localhost/api/test-auth', {
      headers: {
        cookie: `token=${token}`,
      },
    })

    const response = await GET(request)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.payload.sub).toBe('42')
    expect(body.user.id).toBe('42')
    expect(body.user.email).toBe('provider@example.com')
  })
})