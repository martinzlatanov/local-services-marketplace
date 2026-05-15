'use client'

import { useState } from 'react'
import { AdminUserDto, Role } from '@/lib/types'
import { MoreHorizontal, Check } from 'lucide-react'

interface UserCardProps {
  user: AdminUserDto
  isSelected: boolean
  onToggleSelect: () => void
  onStatusChange: (status: 'active' | 'suspended') => void
  onOpenRoleModal: () => void
}

export default function UserCard({
  user,
  isSelected,
  onToggleSelect,
  onStatusChange,
  onOpenRoleModal,
}: UserCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case Role.CLIENT:
        return 'bg-brand-100 text-brand-700 border-brand-200'
      case Role.PROVIDER:
        return 'bg-accent-100 text-accent-600 border-accent-300'
      default:
        return 'bg-surface-100 text-surface-700 border-surface-200'
    }
  }

  const statusColor =
    user.status === 'active'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200'

  return (
    <div className="relative bg-white rounded-[var(--radius-card)] border border-surface-200 p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      {/* Checkbox */}
      <div className="absolute top-4 left-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
        />
      </div>

      {/* More menu */}
      <div className="absolute top-4 right-4 relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-[var(--radius-btn)]"
        >
          <MoreHorizontal size={18} />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-surface-200 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] z-10">
            <button
              onClick={() => {
                onOpenRoleModal()
                setShowMenu(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 rounded-t-[var(--radius-card)]"
            >
              Manage Roles
            </button>
            <button
              onClick={() => {
                onStatusChange(user.status === 'active' ? 'suspended' : 'active')
                setShowMenu(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 rounded-b-[var(--radius-card)]"
            >
              {user.status === 'active' ? 'Suspend User' : 'Activate User'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pl-8 pt-2">
        {/* Email */}
        <p className="text-sm font-medium text-surface-900 truncate pr-8">
          {user.email}
        </p>

        {/* Roles */}
        <div className="flex flex-wrap gap-2 mt-3">
          {user.roles.map(role => (
            <span
              key={role}
              className={`text-xs font-semibold px-2 py-1 rounded-[var(--radius-badge)] border ${getRoleBadgeColor(
                role
              )}`}
            >
              {role}
            </span>
          ))}
        </div>

        {/* Status badge */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-[var(--radius-badge)] border ${statusColor}`}
          >
            {user.status === 'active' ? (
              <>
                <Check className="inline mr-1" size={12} />
                Active
              </>
            ) : (
              'Suspended'
            )}
          </span>
        </div>

        {/* Created */}
        <p className="text-xs text-surface-500 mt-3">
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
