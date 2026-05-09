'use client'

import { useState } from 'react'
import { ReviewDTO } from '@/lib/types'
import { Star, X } from 'lucide-react'

interface ReviewDisplayProps {
  userId: number
  reviews: ReviewDTO[]
  averageRatings: Record<string, number>
  isLoading: boolean
  reviewType: 'client' | 'provider'
}

const CATEGORY_LABELS_CLIENT = {
  communication: 'Communication',
  quality: 'Quality of Work',
  punctuality: 'Punctuality',
}

const CATEGORY_LABELS_PROVIDER = {
  paymentReliability: 'Payment Reliability',
  communicationClarity: 'Communication Clarity',
  professionalism: 'Professionalism',
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeMap[size]} ${
            star <= Math.round(rating) ? 'fill-brand-500 text-brand-500' : 'text-surface-300'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function ReviewCard({ review, categoryLabels }: { review: ReviewDTO; categoryLabels: Record<string, string> }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const truncatedText = review.text.length > 300 ? review.text.slice(0, 300) + '...' : review.text
  const isTextTruncated = review.text.length > 300

  const getRatings = (): Record<string, number> => {
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

  const ratings = getRatings()
  const averageRating = Object.values(ratings).length > 0
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length).toFixed(1)
    : '0'

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

  return (
    <>
      <div className="border border-surface-200 rounded-[var(--radius-card)] p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-surface-900">Reviewer</p>
            <p className="text-xs text-surface-600 mt-0.5">{dateStr}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-surface-900">{averageRating}</p>
            <StarRating rating={parseFloat(averageRating)} size="sm" />
          </div>
        </div>

        {/* Category ratings */}
        <div className="bg-surface-50 rounded-[var(--radius-input)] p-3 space-y-2">
          {Object.entries(ratings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-surface-700 font-medium">{categoryLabels[key as keyof typeof categoryLabels]}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-surface-900">{value}</span>
                <div className="w-12">
                  <StarRating rating={value} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Review text */}
        <div>
          <p className="text-sm text-surface-800 leading-relaxed">
            {isExpanded ? review.text : truncatedText}
          </p>
          {isTextTruncated && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 mt-2 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Photo */}
        {review.photoUrl && (
          <div className="mt-3">
            <button
              onClick={() => setSelectedImage(review.photoUrl || null)}
              className="h-24 w-24 rounded-[var(--radius-input)] overflow-hidden border border-surface-300 hover:border-brand-400 transition-colors cursor-pointer"
            >
              {review.photoUrl.startsWith('data:') ? (
                <img
                  src={review.photoUrl}
                  alt="Review photo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={review.photoUrl}
                  alt="Review photo"
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Photo modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-surface-200 transition-colors p-2"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
            {selectedImage.startsWith('data:') ? (
              <img
                src={selectedImage}
                alt="Full size review photo"
                className="w-auto h-auto max-h-[80vh] max-w-2xl rounded-[var(--radius-card)]"
              />
            ) : (
              <img
                src={selectedImage}
                alt="Full size review photo"
                className="w-auto h-auto max-h-[80vh] max-w-2xl rounded-[var(--radius-card)]"
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default function ReviewDisplay({
  userId,
  reviews,
  averageRatings,
  isLoading,
  reviewType,
}: ReviewDisplayProps) {
  const categoryLabels = reviewType === 'client' ? CATEGORY_LABELS_CLIENT : CATEGORY_LABELS_PROVIDER
  const categoryKeys = Object.keys(categoryLabels) as string[]

  // Calculate overall average
  const validRatings = categoryKeys
    .map(key => averageRatings[key] || 0)
    .filter(r => r > 0)
  const overallAverage = validRatings.length > 0
    ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
    : '0'

  if (isLoading) {
    return (
      <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6">
        <div className="space-y-4">
          <div className="h-4 bg-surface-200 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-surface-200 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-surface-200 rounded animate-pulse w-2/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header section with average rating */}
      <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">
          {reviewType === 'client' ? 'Client Reviews' : 'Provider Reviews'}
        </h2>

        {reviews.length > 0 ? (
          <>
            {/* Overall rating */}
            <div className="flex items-end gap-4 mb-6 pb-6 border-b border-surface-200">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-surface-900">{overallAverage}</span>
                <span className="text-sm text-surface-600 pb-1">out of 5</span>
              </div>
              <div className="mb-1">
                <StarRating rating={parseFloat(overallAverage)} size="md" />
              </div>
              <div className="ml-auto text-sm text-surface-600">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryKeys.map((key) => {
                const rating = averageRatings[key] || 0
                return (
                  <div key={key} className="bg-surface-50 rounded-[var(--radius-input)] p-4">
                    <p className="text-xs font-medium text-surface-600 uppercase tracking-wide mb-2">
                      {categoryLabels[key as keyof typeof categoryLabels]}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-surface-900">
                        {rating > 0 ? rating.toFixed(1) : '—'}
                      </span>
                      {rating > 0 && <StarRating rating={rating} size="sm" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-surface-600">No reviews yet</p>
        )}
      </div>

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-surface-900 px-1">All Reviews</h3>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} categoryLabels={categoryLabels} />
          ))}
        </div>
      )}
    </div>
  )
}
