'use client'

import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import type { AuthUserDto, ApiErrorResponse, AuthLoginResponse } from '@/lib/types'

interface AuthContextValue {
  user: AuthUserDto | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: AuthUserDto | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    fetch('/api/auth/me', { credentials: 'include', signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return null
        return (await res.json()) as { user?: AuthUserDto }
      })
      .then((data) => {
        if (!active) return
        setUser(data?.user ?? null)
      })
      .catch(() => {
        if (!active) return
        setUser(null)
      })
      .finally(() => {
        clearTimeout(timeout)
        if (!active) return
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function login(email: string, password: string): Promise<void> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      throw (await res.json()) as ApiErrorResponse
    }

    const data = (await res.json()) as AuthLoginResponse & { token?: string }
    setUser(data.user)
  }

  async function logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, setUser }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
