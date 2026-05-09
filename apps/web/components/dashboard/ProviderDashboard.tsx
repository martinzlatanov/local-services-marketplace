'use client'

import { useState, useEffect, useCallback } from 'react'
import { JobDto, JobStatus, CITY_AREAS, ReviewDTO } from '@/lib/types'
import { JOB_CATEGORIES } from '@/lib/db/categories'
import ProviderJobFeed from './ProviderJobFeed'
import ActiveJobCard from './ActiveJobCard'
import ReviewDisplay from '../ReviewDisplay'
import Toast from '../ui/Toast'

type Tab = 'feed' | 'active' | 'completed' | 'reviews'

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [selectedArea, setSelectedArea] = useState<string>('All')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [pendingJobs, setPendingJobs] = useState<JobDto[]>([])
  const [activeJobs, setActiveJobs] = useState<JobDto[]>([])
  const [completedJobs, setCompletedJobs] = useState<JobDto[]>([])
  const [receivedReviews, setReceivedReviews] = useState<ReviewDTO[]>([])
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({})
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const fetchPendingJobs = useCallback(async () => {
    const params = new URLSearchParams()
    params.append('browse', '1')
    if (selectedArea !== 'All') params.append('cityArea', selectedArea)
    if (selectedCategory !== 'All') params.append('category', selectedCategory)
    const url = `/api/jobs?${params.toString()}`
    try {
      const res = await fetch(url, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setPendingJobs(data.data ?? [])
      }
    } catch {}
  }, [selectedArea, selectedCategory])

  const fetchActiveJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs/mine', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const jobs = data.data ?? []
        const active = jobs.filter((j: JobDto) => j.status !== JobStatus.COMPLETED)
        const completed = jobs.filter((j: JobDto) => j.status === JobStatus.COMPLETED)
        setActiveJobs(active)
        setCompletedJobs(completed)
      }
    } catch {}
  }, [])

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

  useEffect(() => { fetchPendingJobs() }, [fetchPendingJobs])
  useEffect(() => { fetchActiveJobs() }, [fetchActiveJobs])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/test-auth', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUserId(parseInt(data.user.id, 10))
        }
      } catch {}
    }
    fetchUserData()
  }, [])

  useEffect(() => {
    if (activeTab === 'reviews' && userId) {
      fetchReceivedReviews()
    }
  }, [activeTab, userId, fetchReceivedReviews])

  const handleAccept = async (jobId: string, version: number) => {
    const res = await fetch(`/api/jobs/${jobId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ version }),
    })

    if (res.ok) {
      const data = await res.json()
      setPendingJobs((prev) => prev.filter((j) => j.id !== jobId))
      setActiveJobs((prev) => [...prev, data.data])
      setToast({ message: 'Job accepted! Check My Active Jobs.', type: 'success' })
    } else if (res.status === 409) {
      setPendingJobs((prev) => prev.filter((j) => j.id !== jobId))
      setToast({ message: 'This job was just accepted by another provider.', type: 'info' })
      fetchPendingJobs()
    } else {
      throw new Error('Accept failed')
    }
  }

  const handleStatusAdvance = async (jobId: string, status: JobStatus) => {
    const res = await fetch(`/api/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      const data = await res.json()
      setActiveJobs((prev) => prev.map((j) => (j.id === jobId ? data.data : j)))
      if (status === JobStatus.COMPLETED) {
        setToast({ message: 'Job marked as complete!', type: 'success' })
      }
    } else {
      throw new Error('Status update failed')
    }
  }

  return (
    <div className="mt-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-[var(--radius-btn)] w-fit mb-6">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-5 py-2 text-sm font-medium rounded-[var(--radius-btn)] transition-colors ${
            activeTab === 'feed'
              ? 'bg-surface-0 text-surface-900 shadow-sm'
              : 'text-surface-600 hover:text-surface-900'
          }`}
        >
          Find Jobs
          {pendingJobs.length > 0 && (
            <span className="ml-1.5 text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">
              {pendingJobs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2 text-sm font-medium rounded-[var(--radius-btn)] transition-colors ${
            activeTab === 'active'
              ? 'bg-surface-0 text-surface-900 shadow-sm'
              : 'text-surface-600 hover:text-surface-900'
          }`}
        >
          My Active Jobs
          {activeJobs.length > 0 && (
            <span className="ml-1.5 text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">
              {activeJobs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-5 py-2 text-sm font-medium rounded-[var(--radius-btn)] transition-colors ${
            activeTab === 'completed'
              ? 'bg-surface-0 text-surface-900 shadow-sm'
              : 'text-surface-600 hover:text-surface-900'
          }`}
        >
          Completed
          {completedJobs.length > 0 && (
            <span className="ml-1.5 text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">
              {completedJobs.length}
            </span>
          )}
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

      {/* Find Jobs tab */}
      {activeTab === 'feed' && (
        <div>
          {/* Filters */}
          <div className="space-y-4 mb-6">
            {/* City area filter */}
            <div>
              <h3 className="text-xs font-semibold text-surface-700 mb-2 uppercase tracking-wide">Location</h3>
              <div className="flex gap-2 flex-wrap">
                {['All', ...CITY_AREAS].map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`px-3 py-1.5 text-sm rounded-[var(--radius-badge)] font-medium transition-colors ${
                      selectedArea === area
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <h3 className="text-xs font-semibold text-surface-700 mb-2 uppercase tracking-wide">Category</h3>
              <div className="flex gap-2 flex-wrap">
                {['All', ...JOB_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-sm rounded-[var(--radius-badge)] font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ProviderJobFeed jobs={pendingJobs} onAccept={handleAccept} />
        </div>
      )}

      {/* Active jobs tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-surface-500 font-medium">No active jobs yet.</p>
              <p className="text-surface-400 text-sm mt-1">Accept a job from the feed to get started.</p>
            </div>
          ) : (
            activeJobs.map((job) => (
              <ActiveJobCard key={job.id} job={job} onStatusAdvance={handleStatusAdvance} />
            ))
          )}
        </div>
      )}

      {/* Completed jobs tab */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-surface-500 font-medium">No completed jobs yet.</p>
              <p className="text-surface-400 text-sm mt-1">Complete a job to submit and receive reviews.</p>
            </div>
          ) : (
            completedJobs.map((job) => (
              <ActiveJobCard key={job.id} job={job} onStatusAdvance={handleStatusAdvance} />
            ))
          )}
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === 'reviews' && userId && (
        <ReviewDisplay
          userId={userId}
          reviews={receivedReviews}
          averageRatings={averageRatings}
          isLoading={reviewsLoading}
          reviewType="client"
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
