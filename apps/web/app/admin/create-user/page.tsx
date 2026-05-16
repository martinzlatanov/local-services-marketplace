'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Role } from '@/lib/types'

const ADMIN_TABS = [
  { href: '/admin/dashboard', label: 'User Management' },
  { href: '/admin/reviews', label: 'Review Moderation' },
  { href: '/admin/locations', label: 'Locations' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/create-user', label: 'Create User' },
]

export default function AdminCreateUserPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>(Role.CLIENT)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/me')
      if (!res.ok) { router.push('/login'); return }
      const data = await res.json()
      if (!data.user?.roles?.includes(Role.ADMIN)) { router.push('/unauthorized'); return }
      setIsAuthorized(true)
    }
    checkAuth()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim(), role }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(Object.values(data.errors ?? {}).join(', ') || 'Failed to create user')
      }
      setSuccess(`User ${data.data.email} created successfully.`)
      setEmail('')
      setPassword('')
      setName('')
      setRole(Role.CLIENT)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthorized) return null

  return (
    <div className="min-h-screen bg-surface-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 border-b border-surface-200 flex gap-1 flex-wrap">
          {ADMIN_TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab.href === '/admin/create-user'
                  ? 'text-brand-700 border-brand-600'
                  : 'text-surface-600 hover:text-surface-900 border-transparent hover:border-surface-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-surface-900">Create User</h1>
          <p className="text-surface-600 mt-1">Manually create a new user account</p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-surface-200 bg-white p-6 max-w-lg">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-[var(--radius-input)] border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 rounded-[var(--radius-input)] border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-[var(--radius-input)] border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Optional display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full px-4 py-2 rounded-[var(--radius-input)] border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={Role.CLIENT}>Client</option>
                <option value={Role.PROVIDER}>Provider</option>
                <option value={Role.ADMIN}>Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-5 py-2.5 rounded-[var(--radius-btn)] bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating…' : 'Create User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
