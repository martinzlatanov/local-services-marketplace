'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReviewDTO, ApiSuccessResponse, Role } from '@/lib/types'
import ReviewApprovalCard from '@/components/ReviewApprovalCard'
import { AlertCircle } from 'lucide-react'

interface PendingReview extends ReviewDTO {
  reviewerName?: string
  revieweeName?: string
}

export default function AdminReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<PendingReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Check authentication and admin role on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login')
          return
        }

        const data = await response.json()
        if (!data.user?.roles?.includes(Role.ADMIN)) {
          router.push('/unauthorized')
          return
        }

        setIsAuthorized(true)
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  // Fetch pending reviews
  useEffect(() => {
    if (!isAuthorized) return

    async function fetchPendingReviews() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/reviews?approved=false')
        if (!response.ok) {
          throw new Error('Failed to fetch pending reviews')
        }

        const data: ApiSuccessResponse<ReviewDTO[]> = await response.json()
        const reviewsWithNames = data.data.map((review) => ({
          ...review,
          reviewerName: `User ${review.reviewerId}`,
          revieweeName: `User ${review.revieweeId}`,
        }))
        setReviews(reviewsWithNames)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch pending reviews:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch reviews')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingReviews()
  }, [isAuthorized])

  if (!isAuthorized) {
    return null // Router will handle redirect
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <svg className="h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    )
  }

  const handleApprove = (reviewId: number) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
  }

  const handleReject = (reviewId: number) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
  }

  return (
    <div className="min-h-screen bg-surface-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-surface-900">Review Moderation Queue</h1>
            <div className="inline-flex items-center rounded-full bg-status-warning-100 px-3 py-1 text-sm font-medium text-status-warning-700">
              {reviews.length} pending
            </div>
          </div>
          <p className="text-surface-600">Manage pending reviews and approve content for publication</p>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-status-error-200 bg-status-error-50 p-4 text-status-error-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {reviews.length === 0 && !error && (
          <div className="rounded-lg border border-surface-200 bg-white p-12 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-surface-100 mb-4">
              <svg className="h-6 w-6 text-surface-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-surface-900 mb-1">No pending reviews</h3>
            <p className="text-surface-600">All reviews have been processed. Check back later for new submissions.</p>
          </div>
        )}

        {/* Reviews grid */}
        {reviews.length > 0 && (
          <div className="grid gap-6 grid-cols-1">
            {reviews.map((review) => (
              <ReviewApprovalCard
                key={review.id}
                review={review}
                reviewerName={review.reviewerName || `User ${review.reviewerId}`}
                revieweeName={review.revieweeName || `User ${review.revieweeId}`}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
