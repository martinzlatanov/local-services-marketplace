'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ReviewDTO, Role } from '@/lib/types'
import ReviewDisplay from '@/components/ReviewDisplay'
import { Loader2, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ProviderProfile {
  id: number
  email: string
  createdAt: string
}

interface ReviewsData {
  reviews: ReviewDTO[]
  averageRatings: Record<string, number>
}

export default function ProviderProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const providerId = parseInt(params.id as string, 10)

  const [provider, setProvider] = useState<ProviderProfile | null>(null)
  const [reviews, setReviews] = useState<ReviewDTO[]>([])
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch provider profile (basic info)
        // Note: In a full implementation, you'd have a dedicated /api/providers endpoint
        // For now, we'll skip it and focus on reviews

        // Fetch reviews for this provider
        const reviewsRes = await fetch(`/api/reviews?userId=${providerId}&approved=true`)
        if (!reviewsRes.ok) {
          throw new Error('Failed to fetch reviews')
        }

        const reviewsData: ReviewsData = await reviewsRes.json()
        setReviews(reviewsData.reviews || [])
        setAverageRatings(reviewsData.averageRatings || {})
      } catch (err: any) {
        setError(err.message || 'Failed to load profile')
        console.error('Profile load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [providerId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-brand-600 animate-spin" aria-label="Loading provider profile" />
              <p className="text-surface-600">Loading provider profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header */}
        <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-10 w-10 text-brand-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-surface-900 mb-1">Service Provider</h1>
              <p className="text-surface-600">Provider ID: {providerId}</p>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-[var(--radius-card)] p-6">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        ) : (
          <ReviewDisplay
            userId={providerId}
            reviews={reviews}
            averageRatings={averageRatings}
            isLoading={isLoading}
            reviewType="client"
          />
        )}
      </div>
    </div>
  )
}
