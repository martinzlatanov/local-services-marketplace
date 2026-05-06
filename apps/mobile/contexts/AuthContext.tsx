import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'
import type { AuthUserDto } from '@local/types'

const TOKEN_KEY = 'auth_token'
export const SERVICE_AREA_KEY = 'service_area'
export const API_BASE = 'http://localhost:3000'

interface AuthContextValue {
  user: AuthUserDto | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setTokenAndUser: (token: string, user: AuthUserDto) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function rehydrate() {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY)
        if (!token) {
          return
        }

        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = (await res.json()) as { user: AuthUserDto }
          setUser(data.user)
        } else {
          await SecureStore.deleteItemAsync(TOKEN_KEY)
          setUser(null)
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY)
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
    await SecureStore.setItemAsync(TOKEN_KEY, data.token)
    setUser(data.user)
  }

  async function logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    setUser(null)
  }

  async function setTokenAndUser(token: string, nextUser: AuthUserDto): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
    setUser(nextUser)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setTokenAndUser }}>
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
