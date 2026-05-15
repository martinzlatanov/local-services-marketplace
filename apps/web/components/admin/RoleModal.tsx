'use client'

import { useState, useEffect } from 'react'
import { AdminUserDto, Role } from '@/lib/types'
import { X } from 'lucide-react'

interface RoleModalProps {
  user: AdminUserDto
  onSave: (userId: string, roles: Role[]) => Promise<void>
  onClose: () => void
}

export default function RoleModal({ user, onSave, onClose }: RoleModalProps) {
  const [selected, setSelected] = useState<Set<Role>>(new Set(user.roles))
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setSelected(new Set(user.roles))
    setError(null)
  }, [user])

  const handleToggle = (role: Role) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(role)) {
        next.delete(role)
      } else {
        next.add(role)
      }
      return next
    })
  }

  const handleSave = async () => {
    if (selected.size === 0) {
      setError('At least one role is required')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      await onSave(user.id, Array.from(selected))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save roles')
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-surface-900">Manage Roles</h2>
            <p className="text-sm text-surface-600 mt-1">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-[var(--radius-btn)] disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-[var(--radius-input)] border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Role checkboxes */}
        <div className="space-y-3 mb-6">
          {Object.values(Role).map(role => (
            <label key={role} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.has(role)}
                onChange={() => handleToggle(role)}
                disabled={isSaving}
                className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500 disabled:opacity-40"
              />
              <span className="text-sm font-medium text-surface-900">{role}</span>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 rounded-[var(--radius-btn)] border border-surface-300 bg-white text-surface-700 font-medium text-sm hover:bg-surface-50 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || selected.size === 0}
            className="flex-1 px-4 py-2 rounded-[var(--radius-btn)] bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 disabled:opacity-40"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
