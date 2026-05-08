'use client'

import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onDismiss: () => void
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const colors = {
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: CheckCircle },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertCircle },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Info },
  }

  const config = colors[type]
  const Icon = config.icon

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 ${config.bg} border ${config.border} ${config.text} rounded-[var(--radius-btn)] px-4 py-3 shadow-lg animate-slide-up max-w-sm`}
      role="status"
      aria-live="polite"
    >
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="ml-2 p-1 hover:opacity-75 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
