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
    <div className="mt-6">
      {/* Top-level tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-[var(--radius-btn)] w-fit mb-6">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-5 py-2 text-sm font-medium rounded-[var(--radius-btn)] transition-colors ${
            activeTab === 'jobs'
              ? 'bg-surface-0 text-surface-900 shadow-sm'
              : 'text-surface-600 hover:text-surface-900'
          }`}
        >
          My Jobs
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-2 text-sm font-medium rounded-[var(--radius-btn)] transition-colors ${
            activeTab === 'reviews'
              ? 'bg-surface-0 text-surface-900 shadow-sm'
              : 'text-surface-600 hover:text-surface-900'
          }`}
        >
          Reviews
          {receivedReviews.length > 0 && (
            <span className="ml-1.5 text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">
              {receivedReviews.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'jobs' && (
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Post a job form */}
          <div className="lg:col-span-2">
            <JobPostingForm onSuccess={onJobPosted} />
          </div>

          {/* Right: My jobs list */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-surface-900 mb-3">My Jobs</h2>
              <div className="flex gap-1 bg-surface-100 p-1 rounded-[var(--radius-btn)] w-fit">
                {JOB_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveJobTab(tab)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-[var(--radius-btn)] transition-colors ${
                      activeJobTab === tab
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

            <JobDashboard jobs={filteredJobs} userRole={Role.CLIENT} onJobUpdate={onJobUpdate} />
          </div>
        </div>
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
  )
}
