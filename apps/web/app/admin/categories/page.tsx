'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Role } from '@/lib/types'
import { Trash2 } from 'lucide-react'

interface CategoryRow {
  id: number
  name: string
}

const ADMIN_TABS = [
  { href: '/admin/dashboard', label: 'User Management' },
  { href: '/admin/reviews', label: 'Review Moderation' },
  { href: '/admin/locations', label: 'Locations' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/create-user', label: 'Create User' },
]

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  async function fetchCategories() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      setCategories(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthorized) fetchCategories()
  }, [isAuthorized])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(Object.values(data.errors ?? {}).join(', ') || 'Failed to add category')
      }
      setName('')
      fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete category')
      fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
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
                tab.href === '/admin/categories'
                  ? 'text-brand-700 border-brand-600'
                  : 'text-surface-600 hover:text-surface-900 border-transparent hover:border-surface-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-surface-900">Job Categories</h1>
          <p className="text-surface-600 mt-1">Add or remove job categories</p>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="mb-8 rounded-[var(--radius-card)] border border-surface-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Add Category</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Category name (e.g. ROOFING)"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="flex-1 px-4 py-2 rounded-[var(--radius-input)] border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-[var(--radius-btn)] bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
        )}

        {/* Category list */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-[var(--radius-card)] bg-surface-100 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-surface-500 text-sm">No categories yet.</p>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-surface-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-surface-600">Name</th>
                  <th className="px-4 py-3 text-right font-medium text-surface-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 text-surface-900 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-btn)] text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
