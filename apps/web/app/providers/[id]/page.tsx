'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PublicUserDto, ReviewDTO } from '@/lib/types'
import AvatarInitials from '@/components/ui/AvatarInitials'
import ReviewDisplay from '@/components/ReviewDisplay'
import { Star } from 'lucide-react'

export default function ProviderProfilePage() {
  const params = useParams()
  const providerId = params.id as string

  const [providerUser, setProviderUser] = useState<PublicUserDto | null>(null)
  const [reviews, setReviews] = useState<ReviewDTO[]>([])
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [userRes, reviewsRes] = await Promise.all([
          fetch(`/api/users/${providerId}`, { credentials: 'include' }),
          fetch(`/api/reviews?userId=${providerId}&approved=true`, { credentials: 'include' }),
        ])
        if (!userRes.ok || !reviewsRes.ok) throw new Error('fetch_failed')
        const userData = await userRes.json()
        const reviewsData = await reviewsRes.json()
        setProviderUser(userData.data)
        setReviews(reviewsData.data?.reviews || [])
        setAverageRatings(reviewsData.data?.averageRatings || {})
      } catch {
        setError("Couldn't load this profile. Refresh to try again.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [providerId])

  const avgRating =
    ((averageRatings.communication ?? 0) +
      (averageRatings.quality ?? 0) +
      (averageRatings.punctuality ?? 0)) /
    3
  const hasRating = reviews.length > 0 && avgRating > 0

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6">
          <div className="space-y-4">
            <div className="h-4 bg-surface-200 rounded animate-pulse w-1/3" />
            <div className="h-3 bg-surface-200 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-surface-200 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-[14px] text-surface-500 text-center mt-16">{error}</p>
      </div>
    )
  }

  if (!providerUser) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile header card */}
      <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6 mb-8 flex items-start gap-4">
        <AvatarInitials
          name={providerUser.name}
          email={providerUser.email}
          avatarUrl={providerUser.avatarUrl}
          size="lg"
        />
        <div className="flex-1">
          {providerUser.name && (
            <h1 className="text-[20px] font-semibold text-surface-800 tracking-[-0.5px]">
              {providerUser.name}
            </h1>
          )}
          <p className="text-[14px] text-surface-500">{providerUser.email}</p>
          <p className="text-[12px] text-surface-400 mt-1">
            Joined{' '}
            {new Date(providerUser.createdAt).toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <div className="mt-2">
            {hasRating ? (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(avgRating)
                        ? 'fill-accent-500 stroke-accent-500'
                        : 'stroke-surface-300 fill-none'
                    }`}
                    aria-hidden="true"
                  />
                ))}
                <span className="text-[13px] text-surface-600 ml-1">
                  {avgRating.toFixed(1)}
                </span>
              </div>
            ) : (
              <p className="text-[14px] text-surface-400">No rating yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <p className="text-[11px] font-bold uppercase tracking-wider text-surface-400 mb-4">
        Reviews
      </p>
      {reviews.length === 0 ? (
        <p className="text-[14px] text-surface-400">No reviews yet.</p>
      ) : (
        <ReviewDisplay
          userId={parseInt(providerId, 10)}
          reviews={reviews}
          averageRatings={averageRatings}
          isLoading={false}
          reviewType="client"
        />
      )}
    </div>
  )
}
