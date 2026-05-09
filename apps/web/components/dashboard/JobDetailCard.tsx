'use client'

import { useState, useEffect } from 'react'
import { JobDto, JobStatus, Role } from '@/lib/types'
import { MapPin, User, Clock, AlertCircle } from 'lucide-react'
import ReviewForm from '../ReviewForm'
import { useAuth } from '@/contexts/AuthContext'

interface JobDetailCardProps {
  job: JobDto
  userRole: Role
}

const statusInfo: Record<string, { color: string; label: string; description: string }> = {
  [JobStatus.PENDING]: {
    color: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    label: 'Pending',
    description: 'Waiting for a provider to accept'
  },
  [JobStatus.ACCEPTED]: {
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    label: 'Accepted',
    description: 'A provider has accepted your job'
  },
  [JobStatus.IN_PROGRESS]: {
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    label: 'In Progress',
    description: 'Work is underway'
  },
  [JobStatus.COMPLETED]: {
    color: 'bg-green-50 border-green-200 text-green-900',
    label: 'Completed',
    description: 'Job finished'
  },
}

export default function JobDetailCard({ job, userRole }: JobDetailCardProps) {
  const status = statusInfo[job.status] || statusInfo[JobStatus.PENDING]
  const { user } = useAuth()
  const [hasReviewed, setHasReviewed] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    if (!user || job.status !== JobStatus.COMPLETED) return

    const checkReviewStatus = async () => {
      try {
        const jobId = typeof job.id === 'string' ? parseInt(job.id, 10) : job.id
        const res = await fetch(`/api/reviews?jobId=${jobId}`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          const userReview = (data.data || []).find((r: any) => String(r.reviewerId) === String(user.id))
          setHasReviewed(!!userReview)
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err)
      }
    }

    checkReviewStatus()
  }, [job.id, user, job.status])

  const handleReviewSuccess = () => {
    setHasReviewed(true)
    setShowReviewForm(false)
  }

  return (
    <div className={`border rounded-[var(--radius-card)] p-5 ${status.color}`}>
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {job.category}
          </h3>
          <p className="text-sm mt-2 opacity-90">{job.description}</p>

          <div className="flex flex-col gap-2 mt-3 text-sm">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {job.cityArea}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {job.timeframe}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-75">
            Status
          </div>
          <div className="font-bold">{status.label}</div>
        </div>
      </div>

      {/* Status-specific info */}
      {job.status === JobStatus.ACCEPTED && job.providerId && userRole === Role.CLIENT && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20 flex items-start gap-3">
          <User className="h-5 w-5 flex-shrink-0 mt-0.5 opacity-75" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Provider Assigned</p>
            <p className="text-xs opacity-75 mt-0.5">A service professional has accepted your job and will be in touch soon.</p>
          </div>
        </div>
      )}

      {job.status === JobStatus.IN_PROGRESS && userRole === Role.CLIENT && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20 flex items-start gap-3">
          <Clock className="h-5 w-5 flex-shrink-0 mt-0.5 opacity-75 animate-spin" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Work in Progress</p>
            <p className="text-xs opacity-75 mt-0.5">Your service professional is currently working on this job.</p>
          </div>
        </div>
      )}

      {job.status === JobStatus.COMPLETED && userRole === Role.CLIENT && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 opacity-75" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Job Complete</p>
            <p className="text-xs opacity-75 mt-0.5">The work has been finished. Consider leaving a review for the provider.</p>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs opacity-50 pt-3 border-t border-current border-opacity-10">
        Posted {new Date(job.createdAt).toLocaleDateString()}
      </div>

      {/* Review section */}
      {job.status === JobStatus.COMPLETED && userRole === Role.CLIENT && (
        <div className="mt-6 pt-6 border-t border-current border-opacity-20">
          {hasReviewed ? (
            <div className="flex items-center gap-2 p-3 bg-status-completed-bg text-status-completed-text rounded-[var(--radius-btn)]">
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">You have reviewed this job</span>
            </div>
          ) : (
            <>
              {showReviewForm ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-surface-900">Leave a Review</h3>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="text-sm text-surface-600 hover:text-surface-900"
                    >
                      Cancel
                    </button>
                  </div>
                  {user && job.providerId && (
                    <ReviewForm
                      jobId={job.id}
                      reviewType="client"
                      onSuccess={handleReviewSuccess}
                      reviewerUserId={parseInt(user.id, 10)}
                      revieweeUserId={parseInt(job.providerId, 10)}
                    />
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full py-2 px-4 text-sm font-medium bg-brand-600 text-white rounded-[var(--radius-btn)] hover:bg-brand-700 transition-colors"
                >
                  Leave a Review
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
