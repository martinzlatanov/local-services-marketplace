'use client'

import { useState } from 'react'
import { JobDto } from '@/lib/types'
import JobCard from './JobCard'
import { Loader2 } from 'lucide-react'

interface ProviderJobFeedProps {
  jobs: JobDto[]
  onAccept: (jobId: string, version: number) => Promise<void>
}

export default function ProviderJobFeed({ jobs, onAccept }: ProviderJobFeedProps) {
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  const handleAccept = async (job: JobDto) => {
    setAcceptingId(job.id)
    setError('')
    try {
      await onAccept(job.id, job.version)
    } catch (err: any) {
      setError(err?.errors?.version || 'Failed to accept job. Please try again.')
    } finally {
      setAcceptingId(null)
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-500 font-medium">No pending jobs in this area right now.</p>
        <p className="text-surface-400 text-sm mt-1">Try a different city area or check back shortly.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-[var(--radius-btn)] text-sm">
          {error}
        </div>
      )}
      {jobs.map((job, i) => (
        <div
          key={job.id}
          className={`border border-surface-200 rounded-[var(--radius-card)] overflow-hidden ${
            i === 0 ? 'border-l-[3px] border-l-brand-500' : ''
          }`}
        >
          <div className="flex items-center gap-3 p-3">
            <div className="flex-1 min-w-0">
              <JobCard job={job} />
            </div>
            <button
              onClick={() => handleAccept(job)}
              disabled={acceptingId === job.id}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-900 text-white text-[13px] font-semibold rounded-[var(--radius-btn)] hover:opacity-[0.88] disabled:opacity-50 transition-opacity flex-shrink-0"
            >
              {acceptingId === job.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : null}
              Accept →
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
