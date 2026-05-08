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

  const handleAccept = async (job: JobDto) => {
    setAcceptingId(job.id)
    try {
      await onAccept(job.id, job.version)
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
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id}>
          <JobCard job={job} />
          <div className="mt-2">
            <button
              onClick={() => handleAccept(job)}
              disabled={acceptingId === job.id}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-[var(--radius-btn)] hover:bg-brand-700 disabled:bg-brand-300 transition-colors"
            >
              {acceptingId === job.id && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              )}
              Accept Job
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
