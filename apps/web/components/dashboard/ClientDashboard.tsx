'use client'

import { useState, useEffect, useCallback } from 'react'
import { JobDto, JobStatus, Role, ReviewDTO } from '@/lib/types'
import JobPostingForm from './JobPostingForm'
import JobDashboard from './JobDashboard'
import ReviewDisplay from '../ReviewDisplay'

interface ClientDashboardProps {
  jobs: JobDto[]
  onJobPosted: (job: JobDto) => void
  onJobUpdate: (job: JobDto) => void
  userId: number
}

const JOB_TABS = ['All', 'Active', 'Completed'] as const
type JobTab = typeof JOB_TABS[number]
type Tab = 'jobs' | 'reviews'

export default function ClientDashboard({ jobs, onJobPosted, onJobUpdate, userId }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('jobs')
  const [activeJobTab, setActiveJobTab] = useState<JobTab>('All')
  const [receivedReviews, setReceivedReviews] = useState<ReviewDTO[]>([])
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({})
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const fetchReceivedReviews = useCallback(async () => {
    if (!userId) return
    setReviewsLoading(true)
    try {
      const res = await fetch(`/api/reviews?userId=${userId}&approved=true`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setReceivedReviews(data.data?.reviews ?? [])
        setAverageRatings(data.data?.averageRatings ?? {})
      }
    } catch {}
    setReviewsLoading(false)
  }, [userId])

  useEffect(() => {
    if (activeTab === 'reviews') fetchReceivedReviews()
  }, [activeTab, fetchReceivedReviews])

  const filteredJobs = jobs.filter((job) => {
    if (activeJobTab === 'Active') return job.status !== JobStatus.COMPLETED
    if (activeJobTab === 'Completed') return job.status === JobStatus.COMPLETED
    return true
  })

  const counts = {
    All: jobs.length,
    Active: jobs.filter((j) => j.status !== JobStatus.COMPLETED).length,
    Completed: jobs.filter((j) => j.status === JobStatus.COMPLETED).length,
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <p className="eyebrow mb-3">Client Dashboard</p>
        <h1 className="text-[32px] font-extrabold tracking-[-1px] text-surface-900">My Jobs</h1>
        <p className="text-[14px] text-surface-500 mt-1">Post new jobs and track their progress in real time.</p>
      </div>

      {/* Stats strip */}
      <div className="border border-surface-200 rounded-[var(--radius-card)] overflow-hidden mb-8">
        <div className="grid grid-cols-4">
          {([
            { label: 'Posted',    value: jobs.length },
            { label: 'Active',    value: counts.Active },
            { label: 'Completed', value: counts.Completed },
            { label: 'Pending',   value: jobs.filter((j) => j.status === JobStatus.PENDING).length },
          ] as const).map((stat, i) => (
            <div key={stat.label} className={`px-6 py-5 ${i < 3 ? 'border-r border-surface-200' : ''}`}>
              <p className="text-[28px] font-extrabold tracking-[-1px] text-surface-900 font-mono">{stat.value}</p>
              <p className="text-[12px] text-surface-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two-panel grid */}
      <div className="grid lg:grid-cols-[2fr_3fr] gap-0 border border-surface-200 rounded-[var(--radius-card)] overflow-hidden">

        {/* LEFT: Post-job form panel */}
        <div className="border-r border-surface-200 p-6">
          <p className="text-[11px] font-bold tracking-[0.06em] text-surface-400 mb-4">01 /</p>
          <h2 className="text-[16px] font-bold tracking-[-0.3px] text-surface-900 mb-5">Post a Job</h2>
          <JobPostingForm onSuccess={onJobPosted} />
        </div>

        {/* RIGHT: Jobs table panel */}
        <div className="p-6">
          <p className="text-[11px] font-bold tracking-[0.06em] text-surface-400 mb-4">02 /</p>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold tracking-[-0.3px] text-surface-900">My Jobs</h2>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-surface-200 mb-4 gap-0">
            {(['jobs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? 'border-surface-900 text-surface-900'
                    : 'border-transparent text-surface-500 hover:text-surface-700'
                }`}
              >
                {tab === 'jobs' ? 'Jobs' : 'Reviews'}
                {tab === 'reviews' && receivedReviews.length > 0 && (
                  <span className="ml-1.5 text-[11px] bg-surface-100 text-surface-600 px-1.5 py-0.5 rounded-full">
                    {receivedReviews.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'jobs' && (
            <>
              {/* Job sub-tabs */}
              <div className="flex gap-1 mb-4">
                {JOB_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveJobTab(tab)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                      activeJobTab === tab
                        ? 'bg-surface-900 text-white'
                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                    }`}
                  >
                    {tab} <span className="opacity-60">({counts[tab]})</span>
                  </button>
                ))}
              </div>

              {jobs.length === 0 && (
                <p className="text-sm text-surface-500 bg-surface-50 border border-surface-200 rounded-[var(--radius-btn)] px-4 py-3 mb-4">
                  No jobs yet — post one using the form on the left.
                </p>
              )}

              <JobDashboard jobs={filteredJobs} userRole={Role.CLIENT} onJobUpdate={onJobUpdate} />
            </>
          )}

          {activeTab === 'reviews' && (
            <ReviewDisplay
              userId={userId}
              reviews={receivedReviews}
              averageRatings={averageRatings}
              isLoading={reviewsLoading}
              reviewType="provider"
            />
          )}
        </div>
      </div>
    </div>
  )
}
