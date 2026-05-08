'use client'

interface LiveIndicatorProps {
  status: 'connecting' | 'connected' | 'disconnected'
}

export default function LiveIndicator({ status }: LiveIndicatorProps) {
  const colors = {
    connected: { dot: 'bg-emerald-500', ping: 'bg-emerald-400', label: 'Live' },
    connecting: { dot: 'bg-amber-400', ping: 'bg-amber-300', label: 'Connecting...' },
    disconnected: { dot: 'bg-red-400', ping: '', label: 'Disconnected' },
  }

  const config = colors[status]
  const srText = `Live updates: ${status}`

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-3 w-3">
        {config.ping && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.ping} opacity-75`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${config.dot}`} />
      </div>
      <span className="text-xs font-medium text-surface-600">{config.label}</span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {srText}
      </span>
    </div>
  )
}
