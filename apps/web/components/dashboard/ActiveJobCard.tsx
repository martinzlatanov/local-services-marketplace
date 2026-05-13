'use client'

import { useState, useEffect } from 'react'
import { JobDto, JobStatus, ReviewDTO } from '@/lib/types'
import { MapPin, Loader2, CheckCircle2, Star } from 'lucide-react'

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

  const currentIndex = statusOrder.indexOf(job.status as JobStatus)

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-surface-900">{job.category}</h3>
          <p className="text-sm text-surface-600 mt-1">{job.description}</p>
          <p className="flex items-center gap-1 text-xs text-surface-500 mt-2">
            <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {job.cityArea} • {job.timeframe}
          </p>
        </div>
      </div>

      {/* Status timeline */}
      <div className="mt-4 flex items-center gap-1">
        {statusOrder.map((status, idx) => (
          <div key={status} className="flex items-center gap-1 flex-1">
            <div className={`flex-1 h-1 rounded-full transition-colors ${
              idx <= currentIndex ? 'bg-brand-500' : 'bg-surface-200'
            }`} />
            {idx < statusOrder.length - 1 && (
              <div className={`flex-1 h-1 rounded-full transition-colors ${
                idx < currentIndex ? 'bg-brand-500' : 'bg-surface-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-xs font-medium text-surface-600 px-0.5">
        <span>Accepted</span>
        <span>In Progress</span>
        <span>Complete</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-2">
        {job.status === JobStatus.ACCEPTED && (
          <button
            onClick={() => handleAdvance(JobStatus.IN_PROGRESS)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-[var(--radius-btn)] hover:bg-brand-700 disabled:bg-brand-300 transition-colors"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            Start Work
          </button>
        )}
        {job.status === JobStatus.IN_PROGRESS && (
          <button
            onClick={() => handleAdvance(JobStatus.COMPLETED)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-[var(--radius-btn)] hover:bg-brand-700 disabled:bg-brand-300 transition-colors"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            Mark Complete
          </button>
        )}
      </div>

      {/* Reviews section for completed jobs */}
      {job.status === JobStatus.COMPLETED && (
        <div className="mt-6 pt-6 border-t border-surface-200">
          <h4 className="text-sm font-semibold text-surface-900 mb-4">Client Reviews</h4>
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-surface-400" aria-hidden="true" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-surface-500">No reviews yet. Check back later.</p>
          ) : (
            <div className="space-y-3">
              {reviews.filter(r => r.approvedAt).map((review) => (
                <div key={review.id} className="bg-surface-50 rounded-[var(--radius-btn)] p-3 border border-surface-200">
                  {review.reviewType === 'provider' && review.providerPaymentReliability && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-surface-600">Payment Reliability</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= (review.providerPaymentReliability || 0)
                                  ? 'fill-brand-500 text-brand-500'
                                  : 'text-surface-300'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-surface-600">Communication</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= (review.providerCommunicationClarity || 0)
                                  ? 'fill-brand-500 text-brand-500'
                                  : 'text-surface-300'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-surface-600">Professionalism</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= (review.providerProfessionalism || 0)
                                  ? 'fill-brand-500 text-brand-500'
                                  : 'text-surface-300'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {review.text && (
                    <p className="text-sm text-surface-700 mt-2">{review.text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
