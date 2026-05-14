'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { JobDto, JobStatus, Role, PublicUserDto } from '@/lib/types'
import { MapPin, User, Clock, AlertCircle } from 'lucide-react'
import ReviewForm from '../ReviewForm'
import { useAuth } from '@/contexts/AuthContext'
import AvatarInitials from '@/components/ui/AvatarInitials'

interface JobDetailCardProps {
  job: JobDto
  userRole: Role
}

const statusInfo: Record<string, { color: string; label: string; description: string }> = {
  [JobStatus.PENDING]: {
    color: 'bg-status-pending-bg border-status-pending-border text-status-pending-text',
    label: 'Pending',
    description: 'Waiting for a provider to accept'
  },
  [JobStatus.ACCEPTED]: {
    color: 'bg-status-accepted-bg border-status-accepted-border text-status-accepted-text',
    label: 'Accepted',
    description: 'A provider has accepted your job'
  },
  [JobStatus.IN_PROGRESS]: {
    color: 'bg-status-progress-bg border-status-progress-border text-status-progress-text',
    label: 'In Progress',
    description: 'Work is underway'
  },
  [JobStatus.COMPLETED]: {
    color: 'bg-status-completed-bg border-status-completed-border text-status-completed-text',
    label: 'Completed',
    description: 'Job finished'
  },
}

export default function JobDetailCard({ job, userRole }: JobDetailCardProps) {
  const status = statusInfo[job.status] || statusInfo[JobStatus.PENDING]
  const { user } = useAuth()
  const [hasReviewed, setHasReviewed] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [providerUser, setProviderUser] = useState<PublicUserDto | null>(null)
  const [isProviderLoading, setIsProviderLoading] = useState(false)

  useEffect(() => {
    if (!user || job.status !== JobStatus.COMPLETED) return

    const checkReviewStatus = async () => {
      try {
        const jobId = parseInt(job.id, 10)
        const res = await fetch(`/api/reviews?jobId=${jobId}`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          const userReview = (data.data || []).find((r: any) => String(r.reviewerId) === String(user.id))
          setHasReviewed(!!userReview)
        }
      } catch {
        // silently omit on error
      }
    }

    checkReviewStatus()
  }, [job.id, user, job.status])

  useEffect(() => {
    if (!job.providerId) return

    const controller = new AbortController()
    const fetchProvider = async () => {
      setIsProviderLoading(true)
      try {
        const res = await fetch(`/api/users/${job.providerId}`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          setProviderUser(data.data)
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // silently omit section on error
        }
      } finally {
        setIsProviderLoading(false)
      }
    }

    void fetchProvider()
    return () => controller.abort()
  }, [job.providerId])

  const handleReviewSuccess = () => {
    setHasReviewed(true)
    setShowReviewForm(false)
  }

  return (
    <div className={`border rounded-[var(--radius-card)] p-4 ${status.color}`}>
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

      {/* Provider identity section */}
      {job.providerId && (
        <div className="mt-4 pt-4 border-t border-surface-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-surface-400 mb-3">Provider</p>
          {isProviderLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-100 animate-pulse flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-surface-100 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-surface-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ) : providerUser ? (
            <div className="flex items-center gap-3">
              <AvatarInitials
                name={providerUser.name}
                email={providerUser.email}
                avatarUrl={providerUser.avatarUrl}
                size="sm"
              />
              <div>
                {providerUser.name && (
                  <p className="text-[14px] font-medium text-surface-900">{providerUser.name}</p>
                )}
                <p className="text-[13px] text-surface-600">{providerUser.email}</p>
                <Link
                  href={`/providers/${job.providerId}`}
                  className="text-[12px] text-surface-900 underline underline-offset-2 hover:text-surface-600 transition-colors"
                >
                  View profile
                </Link>
              </div>
            </div>
          ) : null}
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
