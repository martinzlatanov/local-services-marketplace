import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import type { AuthUserDto } from '@local/types'

// Storage wrapper that works on both web and native
const storage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key)
    } else {
      return await SecureStore.getItemAsync(key)
    }
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value)
    } else {
      await SecureStore.setItemAsync(key, value)
    }
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key)
    } else {
      await SecureStore.deleteItemAsync(key)
    }
  }
}

export const TOKEN_KEY = 'auth_token'
export const SERVICE_AREA_KEY = 'service_area'
export const API_BASE = __DEV__ ? 'http://localhost:3000' : 'https://web-f22sfm8v1-martinzlatanov-8547s-projects.vercel.app'

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
        const token = await storage.getItemAsync(TOKEN_KEY)
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
    setUser(data.user)
  }

  async function logout(): Promise<void> {
    await storage.deleteItemAsync(TOKEN_KEY)
    setUser(null)
  }

  async function setTokenAndUser(token: string, nextUser: AuthUserDto): Promise<void> {
    await storage.setItemAsync(TOKEN_KEY, token)
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
