'use client'

interface BulkActionBarProps {
  count: number
  onSuspend: () => void
  onActivate: () => void
  onClear: () => void
}

export default function BulkActionBar({
  count,
  onSuspend,
  onActivate,
  onClear,
}: BulkActionBarProps) {
  return (
    <div className="mb-6 sticky bottom-6 flex items-center gap-4 rounded-[var(--radius-card)] bg-surface-900 text-white px-6 py-4 shadow-lg">
      {/* Count */}
      <span className="text-sm font-medium">
        {count} {count === 1 ? 'user' : 'users'} selected
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <button
        onClick={onActivate}
        className="px-4 py-2 rounded-[var(--radius-btn)] bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors"
      >
        Activate
      </button>
      <button
        onClick={onSuspend}
        className="px-4 py-2 rounded-[var(--radius-btn)] bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors"
      >
        Suspend
      </button>
      <button
        onClick={onClear}
        className="px-4 py-2 rounded-[var(--radius-btn)] bg-surface-700 text-white font-medium text-sm hover:bg-surface-600 transition-colors"
      >
        Clear
      </button>
    </div>
  )
}
