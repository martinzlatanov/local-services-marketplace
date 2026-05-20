import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Constants from 'expo-constants'
import type { AuthUserDto } from '@local/types'
import { storage } from '../lib/storage'

export const TOKEN_KEY = 'auth_token'
export const SERVICE_AREA_KEY = 'service_area'
function getApiBase(): string {
  if (!__DEV__) {
    return 'https://web-gules-six-7paux4gsbf.vercel.app'
  }
  // hostUri location differs across Expo SDK versions and manifest types.
  // Check all known locations so physical devices resolve the dev machine IP.
  const hostUri: string | undefined =
    Constants.expoConfig?.hostUri ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Constants as any).manifest?.debuggerHost
  if (hostUri) {
    const host = hostUri.split(':')[0]
    return `http://${host}:3000`
  }
  return 'http://localhost:3000'
}

export const API_BASE = getApiBase()

interface AuthContextValue {
  user: AuthUserDto | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setTokenAndUser: (token: string, user: AuthUserDto) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function rehydrate() {
      try {
        const stored = await storage.getItemAsync(TOKEN_KEY)
        if (!stored) {
          return
        }

        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${stored}` },
        })

        if (res.ok) {
          const data = (await res.json()) as { user: AuthUserDto }
          setToken(stored)
          setUser(data.user)
        } else {
          await storage.deleteItemAsync(TOKEN_KEY)
          setUser(null)
        }
      } catch {
        await storage.deleteItemAsync(TOKEN_KEY)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void rehydrate()
  }, [])

  async function login(email: string, password: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      throw (await res.json()) as unknown
    }

    const data = (await res.json()) as { user: AuthUserDto; token: string }
    await storage.setItemAsync(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
  }

  async function logout(): Promise<void> {
    await storage.deleteItemAsync(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  async function setTokenAndUser(nextToken: string, nextUser: AuthUserDto): Promise<void> {
    await storage.setItemAsync(TOKEN_KEY, nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setTokenAndUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
