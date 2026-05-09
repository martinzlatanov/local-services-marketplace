'use client'

import { useState } from 'react'
import { ReviewDTO } from '@/lib/types'
import { Star, Loader2, AlertCircle } from 'lucide-react'

interface ReviewApprovalCardProps {
  review: ReviewDTO
  reviewerName: string
  revieweeName: string
  onApprove: (reviewId: number) => void
  onReject: (reviewId: number) => void
}

export default function ReviewApprovalCard({
  review,
  reviewerName,
  revieweeName,
  onApprove,
  onReject,
}: ReviewApprovalCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Format date
  const createdDate = new Date(review.createdAt)
  const now = new Date()
  const diffMs = now.getTime() - createdDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  let dateStr = ''
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    dateStr = diffHours === 0 ? 'Just now' : `${diffHours}h ago`
  } else if (diffDays === 1) {
    dateStr = 'Yesterday'
  } else if (diffDays < 7) {
    dateStr = `${diffDays}d ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    dateStr = `${weeks}w ago`
  } else {
    const months = Math.floor(diffDays / 30)
    dateStr = `${months}mo ago`
  }

  // Get rating values based on review type
  const getRatings = () => {
    if (review.reviewType === 'client') {
      return {
        communication: review.clientCommunication || 0,
        quality: review.clientQuality || 0,
        punctuality: review.clientPunctuality || 0,
      }
    } else {
      return {
        paymentReliability: review.providerPaymentReliability || 0,
        communicationClarity: review.providerCommunicationClarity || 0,
        professionalism: review.providerProfessionalism || 0,
      }
    }
  }

  // Get category labels
  const getCategoryLabels = () => {
    if (review.reviewType === 'client') {
      return {
        communication: 'Communication',
        quality: 'Quality of Work',
        punctuality: 'Punctuality',
      }
    } else {
      return {
        paymentReliability: 'Payment Reliability',
        communicationClarity: 'Communication Clarity',
        professionalism: 'Professionalism',
      }
    }
  }

  const ratings = getRatings()
  const labels = getCategoryLabels()
  const truncatedText = review.text.length > 500 ? review.text.slice(0, 500) + '...' : review.text
  const isTextTruncated = review.text.length > 500

  // Calculate average rating
  const averageRating = (
    Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length
  ).toFixed(1)

  const handleApprove = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId: review.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.errors?.review || 'Failed to approve review')
      }

      // Show success and remove card
      onApprove(review.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to reject review')
      }

      // Remove card on success
      onReject(review.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-surface-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-900">
            {reviewerName} reviewed {revieweeName}
          </p>
          <p className="text-xs text-surface-500 mt-1">Submitted {dateStr}</p>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-surface-900">
          <Star className="h-4 w-4 fill-brand-500 text-brand-500" />
          {averageRating}
        </div>
      </div>

      {/* Ratings Grid */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {Object.entries(ratings).map(([key, value]) => (
          <div key={key} className="rounded-md bg-surface-50 p-3">
            <p className="text-xs font-medium text-surface-600 mb-2">
              {labels[key as keyof typeof labels]}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= value ? 'fill-brand-500 text-brand-500' : 'text-surface-300'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-surface-900">{value}/5</span>
            </div>
          </div>
        ))}
      </div>

      {/* Review Text */}
      <div className="mb-6">
        <p className="text-sm text-surface-700 bg-surface-50 rounded-md p-4">
          {isExpanded ? review.text : truncatedText}
          {isTextTruncated && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 text-brand-600 hover:text-brand-700 font-medium"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </p>
      </div>

      {/* Photo */}
      {review.photoUrl && (
        <div className="mb-6">
          <p className="text-xs font-medium text-surface-600 mb-2">Attached Photo</p>
          <a href={review.photoUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={review.photoUrl}
              alt="Review attachment"
              className="h-32 w-32 rounded-md object-cover border border-surface-200 hover:border-brand-300 cursor-pointer transition-colors"
            />
          </a>
          <a
            href={review.photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-600 hover:text-brand-700 mt-2 inline-block"
          >
            View full size
          </a>
        </div>
      )}

      {/* Metadata */}
      <div className="mb-6 border-t border-surface-200 pt-4 flex items-center gap-4 text-xs text-surface-600">
        <div>
          <span className="font-medium text-surface-900">Job ID:</span>
          <a
            href={`/jobs/${review.jobId}`}
            className="ml-1 text-brand-600 hover:text-brand-700 underline"
          >
            #{review.jobId}
          </a>
        </div>
        <div>
          <span className="font-medium text-surface-900">Type:</span>
          <span className="ml-1 capitalize">
            {review.reviewType === 'client' ? 'Client Review' : 'Provider Review'}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-status-error-50 p-3 text-status-error-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={isLoading}
          className="flex-1 inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Approving...
            </>
          ) : (
            'Approve'
          )}
        </button>
        <button
          onClick={handleReject}
          disabled={isLoading}
          className="flex-1 inline-flex items-center justify-center rounded-md border border-surface-300 bg-white px-4 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Rejecting...
            </>
          ) : (
            'Reject'
          )}
        </button>
      </div>
    </div>
  )
}
