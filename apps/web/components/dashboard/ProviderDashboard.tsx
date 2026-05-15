'use client'

import { useState, useEffect, useCallback } from 'react'
import { JobDto, JobStatus, CITY_AREAS, ReviewDTO, JOB_CATEGORIES } from '@/lib/types'
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
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-[32px] font-extrabold tracking-[-1px] text-surface-900">My Work</h1>
        <p className="text-[14px] text-surface-500 mt-1">Browse available jobs and manage your active work.</p>
      </div>

      {/* Stats strip */}
      <div className="border border-surface-200 rounded-[var(--radius-card)] overflow-hidden mb-8">
        <div className="grid grid-cols-4">
          {([
            { label: 'Available', value: pendingJobs.length },
            { label: 'Active',    value: activeJobs.length },
            { label: 'Completed', value: completedJobs.length },
            { label: 'Reviews',   value: receivedReviews.length },
          ] as const).map((stat, i) => (
            <div key={stat.label} className={`px-6 py-5 ${i < 3 ? 'border-r border-surface-200' : ''}`}>
              <p className="text-[28px] font-extrabold tracking-[-1px] text-surface-900 font-mono">{stat.value}</p>
              <p className="text-[12px] text-surface-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Underline tab bar */}
      <div className="flex border-b border-surface-200 mb-6 gap-0">
        {([
          { key: 'feed',      label: 'Find Jobs',      count: pendingJobs.length },
          { key: 'active',    label: 'Active Jobs',    count: activeJobs.length },
          { key: 'completed', label: 'Completed',      count: completedJobs.length },
          { key: 'reviews',   label: 'Reviews',        count: receivedReviews.length },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-surface-900 text-surface-900'
                : 'border-transparent text-surface-500 hover:text-surface-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-[11px] bg-surface-100 text-surface-600 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Find Jobs tab */}
      {activeTab === 'feed' && (
        <div className="grid lg:grid-cols-[2fr_3fr] gap-0 border border-surface-200 rounded-[var(--radius-card)] overflow-hidden">
          {/* Left: filters */}
          <div className="border-r border-surface-200 p-6">
            <p className="text-[11px] font-bold tracking-[0.06em] text-surface-400 mb-5">01 / Filters</p>
            <div className="mb-6">
              <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-surface-500 mb-3">Location</p>
              <div className="flex flex-col gap-1">
                {['All', ...CITY_AREAS].map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`text-left px-3 py-2 text-[13px] rounded-md transition-colors ${
                      selectedArea === area
                        ? 'bg-surface-900 text-white font-medium'
                        : 'text-surface-600 hover:bg-surface-100'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-surface-500 mb-3">Category</p>
              <div className="flex flex-col gap-1">
                {['All', ...JOB_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left px-3 py-2 text-[13px] rounded-md transition-colors ${
                      selectedCategory === cat
                        ? 'bg-surface-900 text-white font-medium'
                        : 'text-surface-600 hover:bg-surface-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Right: job feed */}
          <div className="p-6">
            <p className="text-[11px] font-bold tracking-[0.06em] text-surface-400 mb-5">02 / Available Jobs</p>
            <ProviderJobFeed jobs={pendingJobs} onAccept={handleAccept} />
          </div>
        </div>
      )}

      {/* Active jobs tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeJobs.length === 0 ? (
            <div className="text-center py-12 text-surface-500">No active jobs yet — accept one from the feed.</div>
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
            <div className="text-center py-12 text-surface-500">No completed jobs yet.</div>
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

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  )
}
