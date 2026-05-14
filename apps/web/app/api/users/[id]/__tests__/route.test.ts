/** @jest-environment node */

import { GET } from '@/app/api/users/[id]/route'

// Mock getAuthenticatedUser so tests don't require a live DB or JWT verification
jest.mock('@/lib/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}))

// Mock DB module so tests don't require a live database
jest.mock('@/lib/db/client', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  },
}))

jest.mock('@/lib/db/schema', () => ({
  users: {},
}))

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
}))

import { getAuthenticatedUser } from '@/lib/auth'

const mockGetAuth = getAuthenticatedUser as jest.Mock

const mockAuthUser = {
  id: '1',
  email: 'me@example.com',
  role: 'CLIENT',
  createdAt: '2024-01-01T00:00:00.000Z',
}

const mockUserRow = {
  id: 42,
  email: 'provider@example.com',
  passwordHash: 'hashed-secret',
  role: 'PROVIDER',
  name: 'Jane Smith',
  avatarUrl: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

const makeRequest = (userId: string) =>
  new Request(`http://localhost/api/users/${userId}`)

describe('GET /api/users/[id]', () => {
  let dbModule: { db: { select: jest.Mock; from: jest.Mock; where: jest.Mock; limit: jest.Mock } }

  beforeEach(() => {
    jest.clearAllMocks()
    dbModule = require('@/lib/db/client')
    dbModule.db.select.mockReturnThis()
    dbModule.db.from.mockReturnThis()
    dbModule.db.where.mockReturnThis()
  })

  describe('401 — unauthenticated', () => {
    it('returns 401 with { errors: { auth: "unauthorized" } } when no token provided', async () => {
      mockGetAuth.mockResolvedValueOnce(null)
      const req = makeRequest('42')
      const res = await GET(req, { params: Promise.resolve({ id: '42' }) })
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.errors.auth).toBe('unauthorized')
    })
  })

  describe('400 — invalid id (NaN)', () => {
    it('returns 400 with { errors: { id: "invalid" } } for non-numeric id param', async () => {
      mockGetAuth.mockResolvedValueOnce(mockAuthUser)
      const req = makeRequest('not-a-number')
      const res = await GET(req, { params: Promise.resolve({ id: 'not-a-number' }) })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.errors.id).toBe('invalid')
    })
  })

  describe('404 — user not found', () => {
    it('returns 404 with { errors: { user: "not_found" } } for unknown numeric id', async () => {
      mockGetAuth.mockResolvedValueOnce(mockAuthUser)
      dbModule.db.limit.mockResolvedValueOnce([])
      const req = makeRequest('9999')
      const res = await GET(req, { params: Promise.resolve({ id: '9999' }) })
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.errors.user).toBe('not_found')
    })
  })

  describe('200 — happy path', () => {
    it('returns 200 with PublicUserDto; passwordHash is not present in response', async () => {
      mockGetAuth.mockResolvedValueOnce(mockAuthUser)
      dbModule.db.limit.mockResolvedValueOnce([mockUserRow])
      const req = makeRequest('42')
      const res = await GET(req, { params: Promise.resolve({ id: '42' }) })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.data).toBeDefined()
      expect(body.data.id).toBe('42')
      expect(body.data.email).toBe('provider@example.com')
      expect(body.data.role).toBe('PROVIDER')
      expect(body.data.createdAt).toBeDefined()
      // passwordHash must never appear in the DTO
      expect(body.data.passwordHash).toBeUndefined()
    })
  })
})
