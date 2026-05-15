'use client'

import { useState, useEffect } from 'react'
import { JobDto, JobStatus, ReviewDTO } from '@/lib/types'
import { MapPin, Loader2, CheckCircle2, Star, MessageSquare } from 'lucide-react'
import ReviewForm from '../ReviewForm'

interface ActiveJobCardProps {
  job: JobDto
  onStatusAdvance: (jobId: string, status: JobStatus) => Promise<void>
}

const statusOrder = [JobStatus.ACCEPTED, JobStatus.IN_PROGRESS, JobStatus.COMPLETED]

const statusColors: Record<string, string> = {
  [JobStatus.PENDING]: 'bg-status-pending-bg text-status-pending-text',
  [JobStatus.ACCEPTED]: 'bg-status-accepted-bg text-status-accepted-text',
  [JobStatus.IN_PROGRESS]: 'bg-status-progress-bg text-status-progress-text',
  [JobStatus.COMPLETED]: 'bg-status-completed-bg text-status-completed-text',
}

export default function ActiveJobCard({ job, onStatusAdvance }: ActiveJobCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState<ReviewDTO[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [hasProvidedReview, setHasProvidedReview] = useState(false)

  useEffect(() => {
    if (job.status === JobStatus.COMPLETED) {
      const fetchReviews = async () => {
        try {
          setReviewsLoading(true)
          const res = await fetch(`/api/reviews?jobId=${job.id}`, { credentials: 'include' })
          if (res.ok) {
            const data = await res.json()
            setReviews(data.data || [])
          }
        } catch (err) {
          console.error('Failed to fetch reviews:', err)
        } finally {
          setReviewsLoading(false)
        }
      }
      fetchReviews()
    }
  }, [job.id, job.status])

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

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-surface-400 mb-0.5">{job.category}</p>
          <p className="text-[14px] font-medium text-surface-800 truncate">{job.description}</p>
          <p className="flex items-center gap-1 text-[12px] text-surface-500 mt-1">
            <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {job.cityArea} · {job.timeframe}
          </p>
          {job.clientName && (
            <p className="text-[12px] text-surface-600 font-medium mt-2">Client: {job.clientName}</p>
          )}
        </div>
        <span className={`text-[11px] px-2.5 py-1 rounded-[var(--radius-badge)] font-medium flex-shrink-0 ${statusColors[job.status] || 'bg-surface-100 text-surface-800'}`}>
          {job.status.replace('_', ' ')}
        </span>
      </div>

      {/* 4-step progress track using globals.css utilities */}
      <div className="progress-track mt-4 mb-1">
        {[JobStatus.PENDING, JobStatus.ACCEPTED, JobStatus.IN_PROGRESS, JobStatus.COMPLETED].map((step, i, arr) => {
          const currentIdx = [JobStatus.PENDING, JobStatus.ACCEPTED, JobStatus.IN_PROGRESS, JobStatus.COMPLETED].indexOf(job.status)
          const isDone   = i < currentIdx
          const isActive = i === currentIdx
          return (
            <div key={step} className="flex items-center" style={{ flex: i < arr.length - 1 ? 1 : undefined }}>
              <span className={`progress-dot${isDone ? ' done' : isActive ? ' active' : ''}`} />
              {i < arr.length - 1 && (
                <span className={`progress-line${isDone ? ' done' : ''}`} />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[11px] text-surface-400 mb-4 px-0.5">
        <span>Pending</span><span>Accepted</span><span>In Progress</span><span>Done</span>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="flex gap-2">
        {job.status === JobStatus.ACCEPTED && (
          <button
            onClick={() => handleAdvance(JobStatus.IN_PROGRESS)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-900 text-white text-[13px] font-semibold rounded-[var(--radius-btn)] hover:opacity-[0.88] disabled:opacity-50 transition-opacity"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            Start Work
          </button>
        )}
        {job.status === JobStatus.IN_PROGRESS && (
          <button
            onClick={() => handleAdvance(JobStatus.COMPLETED)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-900 text-white text-[13px] font-semibold rounded-[var(--radius-btn)] hover:opacity-[0.88] disabled:opacity-50 transition-opacity"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            Mark Complete
          </button>
        )}
      </div>

      {/* Reviews section for completed jobs */}
      {job.status === JobStatus.COMPLETED && (
        <div className="mt-6 pt-6 border-t border-surface-200">
          <h4 className="text-sm font-semibold text-surface-900 mb-4">Client Review</h4>
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-surface-400" aria-hidden="true" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-surface-500">No reviews yet. Check back later.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => {
                const ratings = {
                  payment: review.clientCommunication || 0,
                  communication: review.clientQuality || 0,
                  professionalism: review.clientPunctuality || 0,
                }
                const avgRatingNum = ratings.payment && ratings.communication && ratings.professionalism
                  ? (ratings.payment + ratings.communication + ratings.professionalism) / 3
                  : 0
                const avgRatingStr = avgRatingNum.toFixed(1)

                return (
                  <div key={review.id} className="bg-surface-50 rounded-[var(--radius-input)] p-3 border border-surface-200 space-y-3">
                    {/* Category ratings - horizontal layout */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center gap-1 p-2 bg-white rounded-[var(--radius-input)]">
                        <span className="text-xs font-medium text-surface-600 text-center">Communication</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= ratings.payment
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-surface-300'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-surface-900">{ratings.payment}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 p-2 bg-white rounded-[var(--radius-input)]">
                        <span className="text-xs font-medium text-surface-600 text-center">Quality</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= ratings.communication
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-surface-300'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-surface-900">{ratings.communication}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 p-2 bg-white rounded-[var(--radius-input)]">
                        <span className="text-xs font-medium text-surface-600 text-center">Punctuality</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= ratings.professionalism
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-surface-300'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-surface-900">{ratings.professionalism}</span>
                      </div>
                    </div>

                    {/* Review text */}
                    {review.text && (
                      <p className="text-sm text-surface-700 bg-white rounded-[var(--radius-input)] p-2">{review.text}</p>
                    )}

                    {/* Photo */}
                    {review.photoUrl && (
                      <button
                        onClick={() => window.open(review.photoUrl ?? undefined, '_blank')}
                        className="h-16 w-16 rounded-[var(--radius-input)] overflow-hidden border border-surface-300 hover:border-brand-400 transition-colors cursor-pointer"
                      >
                        <img
                          src={review.photoUrl}
                          alt="Review"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        {/* Review submission section */}
        {!hasProvidedReview && !showReviewForm && (
          <div className="mt-4">
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-[var(--radius-btn)] transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              Leave Review for Client
            </button>
          </div>
        )}

        {/* Review form */}
        {showReviewForm && (
          <div className="mt-4 pt-4 border-t border-surface-200">
            <ReviewForm
              jobId={job.id}
              reviewType="provider"
              reviewerUserId={job.providerId ?? ''}
              revieweeUserId={job.clientId}
              onSuccess={() => {
                setShowReviewForm(false)
                setHasProvidedReview(true)
              }}
            />
          </div>
        )}
        </div>
      )}
    </div>
  )
}
