'use client'

import { useState } from 'react'
import { JobDto, JobStatus } from '@/lib/types'
import JobPostingForm from './JobPostingForm'
import JobDashboard from './JobDashboard'

interface ClientDashboardProps {
  jobs: JobDto[]
  onJobPosted: (job: JobDto) => void
  onJobUpdate: (job: JobDto) => void
}

const TABS = ['All', 'Active', 'Completed'] as const
type Tab = typeof TABS[number]

export default function ClientDashboard({ jobs, onJobPosted, onJobUpdate }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('All')

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'Active') return job.status !== JobStatus.COMPLETED
    if (activeTab === 'Completed') return job.status === JobStatus.COMPLETED
    return true
  })

  const counts = {
    All: jobs.length,
    Active: jobs.filter((j) => j.status !== JobStatus.COMPLETED).length,
    Completed: jobs.filter((j) => j.status === JobStatus.COMPLETED).length,
  }

  return (
    <div className="mt-6 grid lg:grid-cols-5 gap-8">
      {/* Left: Post a job form */}
      <div className="lg:col-span-2">
        <JobPostingForm onSuccess={onJobPosted} />
      </div>

      {/* Right: My jobs list */}
      <div className="lg:col-span-3">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-surface-900 mb-3">My Jobs</h2>
          <div className="flex gap-1 bg-surface-100 p-1 rounded-[var(--radius-btn)] w-fit">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-[var(--radius-btn)] transition-colors ${
                  activeTab === tab
                    ? 'bg-surface-0 text-surface-900 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                {tab}
                <span className="ml-1.5 text-xs text-surface-500">({counts[tab]})</span>
              </button>
            ))}
          </div>
        </div>

        {jobs.length === 0 && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-[var(--radius-btn)] px-4 py-3 mb-4">
            Job history resets on refresh — full history view coming soon.
          </p>
        )}

        <JobDashboard jobs={filteredJobs} onJobUpdate={onJobUpdate} />
      </div>
    </div>
  )
}
