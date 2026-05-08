import { verifyPassword, signJwt, verifyJwt } from '@/lib/auth'
import { Role } from '@/lib/types'
import bcrypt from 'bcrypt'

describe('Auth Functions', () => {
  describe('Password Verification', () => {
    it('verifies correct password', async () => {
      const password = 'test-password-123'
      const hash = await bcrypt.hash(password, 10)

      const matches = await verifyPassword(password, hash)
      expect(matches).toBe(true)
    })

    it('rejects wrong password', async () => {
      const password = 'test-password-123'
      const hash = await bcrypt.hash(password, 10)

      const matches = await verifyPassword('wrong-password', hash)
      expect(matches).toBe(false)
    })

    it('handles empty password gracefully', async () => {
      const hash = await bcrypt.hash('some-password', 10)
      const matches = await verifyPassword('', hash)
      expect(matches).toBe(false)
    })
  })

  describe('JWT Token Management', () => {
    it('signs and verifies JWT token', () => {
      const payload = { sub: '123', email: 'test@example.com' }
      const token = signJwt(payload)

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')

      const decoded = verifyJwt(token)
      expect(decoded).not.toBeNull()
      expect(decoded?.sub).toBe('123')
      expect(decoded?.email).toBe('test@example.com')
    })

    it('rejects invalid JWT token', () => {
      const invalidToken = 'invalid.jwt.token'
      const decoded = verifyJwt(invalidToken)
      expect(decoded).toBeNull()
    })

    it('rejects tampered JWT token', () => {
      const payload = { sub: '123', email: 'test@example.com' }
      const token = signJwt(payload)

      // Tamper with the token
      const parts = token.split('.')
      parts[1] = Buffer.from(JSON.stringify({ sub: '456' })).toString('base64url')
      const tamperedToken = parts.join('.')

      const decoded = verifyJwt(tamperedToken)
      expect(decoded).toBeNull()
    })

    it('includes creation timestamp in token', () => {
      const beforeTime = Date.now()
      const token = signJwt({ sub: '123' })
      const afterTime = Date.now()

      const decoded = verifyJwt(token)
      expect(decoded).not.toBeNull()
      expect(decoded?.iat).toBeDefined()
      expect(decoded!.iat * 1000).toBeGreaterThanOrEqual(Math.floor(beforeTime / 1000) * 1000)
      expect(decoded!.iat * 1000).toBeLessThanOrEqual(Math.ceil(afterTime / 1000) * 1000)
    })
  })
})
