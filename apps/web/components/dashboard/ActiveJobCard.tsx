'use client'

import { useState } from 'react'
import { JobDto, JobStatus } from '@/lib/types'
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react'

interface ActiveJobCardProps {
  job: JobDto
  onStatusAdvance: (jobId: string, status: JobStatus) => Promise<void>
}

const statusOrder = [JobStatus.ACCEPTED, JobStatus.IN_PROGRESS, JobStatus.COMPLETED]

const statusColors: Record<string, string> = {
  [JobStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [JobStatus.ACCEPTED]: 'bg-blue-100 text-blue-800',
  [JobStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
  [JobStatus.COMPLETED]: 'bg-green-100 text-green-800',
}

export default function ActiveJobCard({ job, onStatusAdvance }: ActiveJobCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdvance = async (nextStatus: JobStatus) => {
    setLoading(true)
    setError('')
    try {
      await onStatusAdvance(job.id, nextStatus)
    } catch {
      setError('Update failed — please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentIndex = statusOrder.indexOf(job.status as JobStatus)

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-surface-900">{job.category}</h3>
          <p className="text-sm text-surface-600 mt-1">{job.description}</p>
          <p className="flex items-center gap-1 text-xs text-surface-500 mt-2">
            <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {job.cityArea} • {job.timeframe}
          </p>
        </div>
      </div>

      {/* Status timeline */}
      <div className="mt-4 flex items-center gap-1">
        {statusOrder.map((status, idx) => (
          <div key={status} className="flex items-center gap-1 flex-1">
            <div className={`flex-1 h-1 rounded-full transition-colors ${
              idx <= currentIndex ? 'bg-emerald-500' : 'bg-surface-200'
            }`} />
            {idx < statusOrder.length - 1 && (
              <div className={`flex-1 h-1 rounded-full transition-colors ${
                idx < currentIndex ? 'bg-emerald-500' : 'bg-surface-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-xs font-medium text-surface-600 px-0.5">
        <span>Accepted</span>
        <span>In Progress</span>
        <span>Complete</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-2">
        {job.status === JobStatus.ACCEPTED && (
          <button
            onClick={() => handleAdvance(JobStatus.IN_PROGRESS)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-[var(--radius-btn)] hover:bg-brand-700 disabled:bg-brand-300 transition-colors"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            Start Work
          </button>
        )}
        {job.status === JobStatus.IN_PROGRESS && (
          <button
            onClick={() => handleAdvance(JobStatus.COMPLETED)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-[var(--radius-btn)] hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            Mark Complete
          </button>
        )}
      </div>
    </div>
  )
}
