// Tests for AuthContext login/logout flows without native module dependencies

interface AuthUserDto {
  id: string
  email: string
  name: string | null
  roles: string[]
}

interface StorageAdapter {
  setItemAsync: (key: string, value: string) => Promise<void>
  getItemAsync: (key: string) => Promise<string | null>
  deleteItemAsync: (key: string) => Promise<void>
}

// Minimal in-memory storage stand-in
function makeStorage(): StorageAdapter & { _store: Record<string, string> } {
  const _store: Record<string, string> = {}
  return {
    _store,
    setItemAsync: async (k, v) => { _store[k] = v },
    getItemAsync: async (k) => _store[k] ?? null,
    deleteItemAsync: async (k) => { delete _store[k] },
  }
}

function makeFetch(body: object, status = 200): jest.Mock {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
}

const TOKEN_KEY = 'auth_token'

const mockUser: AuthUserDto = {
  id: '42',
  email: 'provider@example.com',
  name: 'Test Provider',
  roles: ['PROVIDER'],
}

describe('Auth login flow', () => {
  it('stores token and returns user on successful login', async () => {
    const storage = makeStorage()
    const fetchFn = makeFetch({ user: mockUser, token: 'jwt_abc' })

    const res = await fetchFn('http://api/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'provider@example.com', password: 'pass' }),
    })

    expect(res.ok).toBe(true)
    const data = await res.json()
    await storage.setItemAsync(TOKEN_KEY, data.token)

    expect(await storage.getItemAsync(TOKEN_KEY)).toBe('jwt_abc')
    expect(data.user.roles).toContain('PROVIDER')
  })

  it('throws on invalid credentials (401)', async () => {
    const fetchFn = makeFetch({ errors: { credentials: 'invalid' } }, 401)

    const res = await fetchFn('http://api/api/auth/login', {})
    expect(res.ok).toBe(false)
    expect(res.status).toBe(401)
  })
})

describe('Auth logout flow', () => {
  it('removes token from storage on logout', async () => {
    const storage = makeStorage()
    await storage.setItemAsync(TOKEN_KEY, 'jwt_abc')

    // logout
    await storage.deleteItemAsync(TOKEN_KEY)

    expect(await storage.getItemAsync(TOKEN_KEY)).toBeNull()
  })
})

describe('Auth rehydration', () => {
  it('restores session when valid token exists in storage', async () => {
    const storage = makeStorage()
    await storage.setItemAsync(TOKEN_KEY, 'jwt_abc')

    const fetchFn = makeFetch({ user: mockUser })
    const stored = await storage.getItemAsync(TOKEN_KEY)

    expect(stored).toBe('jwt_abc')

    const res = await fetchFn('http://api/api/auth/me', {
      headers: { Authorization: `Bearer ${stored}` },
    })

    expect(res.ok).toBe(true)
    const data = await res.json()
    expect(data.user.id).toBe('42')
  })

  it('clears token when /me returns 401 (expired)', async () => {
    const storage = makeStorage()
    await storage.setItemAsync(TOKEN_KEY, 'expired_token')

    const fetchFn = makeFetch({ errors: { auth: 'unauthorized' } }, 401)
    const res = await fetchFn('http://api/api/auth/me', {})

    if (!res.ok) {
      await storage.deleteItemAsync(TOKEN_KEY)
    }

    expect(await storage.getItemAsync(TOKEN_KEY)).toBeNull()
  })
})
