'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminUserDto, Role } from '@/lib/types'
import UserCard from '@/components/admin/UserCard'
import FilterPanel from '@/components/admin/FilterPanel'
import BulkActionBar from '@/components/admin/BulkActionBar'
import RoleModal from '@/components/admin/RoleModal'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & pagination
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Role modal
  const [roleModalUser, setRoleModalUser] = useState<AdminUserDto | null>(null)

  // Auth check on mount
  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      if (!data.user?.roles?.includes(Role.ADMIN)) {
        router.push('/unauthorized')
        return
      }
      setIsAuthorized(true)
    }
    checkAuth()
  }, [router])

  const fetchUsers = useCallback(async () => {
    if (!isAuthorized) return
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', String(page))

      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.data.users)
      setHasMore(data.data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching users')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthorized, search, roleFilter, statusFilter, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Reset page on filter change
  useEffect(() => {
    setPage(0)
    setSelectedIds(new Set())
  }, [search, roleFilter, statusFilter])

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleBulkStatusChange = async (status: 'active' | 'suspended') => {
    try {
      await fetch('/api/admin/users/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: Array.from(selectedIds).map(Number), status }),
      })
      setSelectedIds(new Set())
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update users')
    }
  }

  const handleStatusChange = async (userId: string, status: 'active' | 'suspended') => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  const handleRoleSave = async (userId: string, roles: Role[]) => {
    try {
      await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles }),
      })
      setRoleModalUser(null)
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update roles')
    }
  }

  if (!isAuthorized) return null

  return (
    <div className="min-h-screen bg-surface-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Admin tabs */}
        <div className="mb-6 border-b border-surface-200 flex gap-1 flex-wrap">
          {[
            { href: '/admin/dashboard', label: 'User Management' },
            { href: '/admin/reviews', label: 'Review Moderation' },
            { href: '/admin/locations', label: 'Locations' },
            { href: '/admin/categories', label: 'Categories' },
            { href: '/admin/create-user', label: 'Create User' },
          ].map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab.href === '/admin/dashboard'
                  ? 'text-brand-700 border-brand-600'
                  : 'text-surface-600 hover:text-surface-900 border-transparent hover:border-surface-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-surface-900">User Management</h1>
          <p className="text-surface-600 mt-1">Manage users, roles, and account status</p>
        </div>

        {/* Search */}
        <div className="mb-4 flex gap-3">
          <input
            type="search"
            placeholder="Search by email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-[var(--radius-input)] border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Advanced Filters */}
        <FilterPanel
          role={roleFilter}
          status={statusFilter}
          onRoleChange={setRoleFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <BulkActionBar
            count={selectedIds.size}
            onSuspend={() => handleBulkStatusChange('suspended')}
            onActivate={() => handleBulkStatusChange('active')}
            onClear={() => setSelectedIds(new Set())}
          />
        )}

        {/* Card grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-[var(--radius-card)] bg-surface-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(u => (
              <UserCard
                key={u.id}
                user={u}
                isSelected={selectedIds.has(u.id)}
                onToggleSelect={() => handleToggleSelect(u.id)}
                onStatusChange={(status) => handleStatusChange(u.id, status)}
                onOpenRoleModal={() => setRoleModalUser(u)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm font-medium rounded-[var(--radius-btn)] border border-surface-300 bg-white text-surface-700 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-surface-500">Page {page + 1}</span>
          <button
            disabled={!hasMore}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm font-medium rounded-[var(--radius-btn)] border border-surface-300 bg-white text-surface-700 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Role Modal */}
      {roleModalUser && (
        <RoleModal
          user={roleModalUser}
          onSave={handleRoleSave}
          onClose={() => setRoleModalUser(null)}
        />
      )}
    </div>
  )
}
