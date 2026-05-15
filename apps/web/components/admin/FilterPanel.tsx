'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FilterPanelProps {
  role: string
  status: string
  onRoleChange: (role: string) => void
  onStatusChange: (status: string) => void
}

export default function FilterPanel({
  role,
  status,
  onRoleChange,
  onStatusChange,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mb-6">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-btn)] border border-surface-300 bg-white text-surface-700 font-medium text-sm hover:bg-surface-50"
      >
        Filters
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Filter controls */}
      {isOpen && (
        <div className="mt-3 p-4 rounded-[var(--radius-card)] border border-surface-200 bg-surface-50 flex gap-4">
          {/* Role filter */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-surface-600 uppercase">Role</label>
            <select
              value={role}
              onChange={e => onRoleChange(e.target.value)}
              className="px-3 py-2 rounded-[var(--radius-input)] border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Roles</option>
              <option value="CLIENT">Client</option>
              <option value="PROVIDER">Provider</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-surface-600 uppercase">Status</label>
            <select
              value={status}
              onChange={e => onStatusChange(e.target.value)}
              className="px-3 py-2 rounded-[var(--radius-input)] border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
