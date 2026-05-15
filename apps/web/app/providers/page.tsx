'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PublicUserDto, ReviewDTO, Role, CITY_AREAS } from '@/lib/types'
import AvatarInitials from '@/components/ui/AvatarInitials'
import { Star, Search, ChevronDown } from 'lucide-react'

interface ProviderWithRatings extends PublicUserDto {
  averageRating?: number
  reviewCount?: number
  skills?: string[]
}

export default function ProvidersPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<ProviderWithRatings[]>([])
  const [reviews, setReviews] = useState<ReviewDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [selectedRating, setSelectedRating] = useState<string>('0')
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'newest'>('rating')

  useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [usersRes, reviewsRes] = await Promise.all([
          fetch('/api/users?role=PROVIDER', {
            credentials: 'include',
            signal: controller.signal,
          }),
          fetch('/api/reviews?approved=true', {
            credentials: 'include',
            signal: controller.signal,
          }),
        ])

        if (!usersRes.ok) throw new Error('fetch_users_failed')
        const usersData = await usersRes.json()
        const reviewsData = reviewsRes.ok ? await reviewsRes.json() : { data: { reviews: [] } }

        console.log('Reviews API response:', { status: reviewsRes.status, ok: reviewsRes.ok, reviewsData })

        // Extract reviews from API response - handle both structures
        const allReviews = (reviewsData.data?.reviews || reviewsData.data || []) as ReviewDTO[]
        console.log('Extracted reviews:', allReviews, 'Count:', allReviews.length)

        // Calculate ratings for each provider
        const providersWithRatings = (usersData.data || []).map((provider: PublicUserDto) => {
          const providerReviews = allReviews.filter(
            (r: ReviewDTO) => r.revieweeId === parseInt(provider.id, 10) && r.reviewType === 'client'
          )

          const avgRating = providerReviews.length > 0
            ? providerReviews.reduce((sum: number, r: ReviewDTO) =>
                sum + (r.clientCommunication || 0) + (r.clientQuality || 0) + (r.clientPunctuality || 0),
                0) / (providerReviews.length * 3)
            : 0

          return {
            ...provider,
            averageRating: avgRating,
            reviewCount: providerReviews.length,
          }
        })

        setProviders(providersWithRatings)
        setReviews(allReviews)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError("Couldn't load providers. Please try again.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
    return () => controller.abort()
  }, [])

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    let filtered = [...providers]

    // Search by name or email
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          (p.name?.toLowerCase().includes(query) ?? false) ||
          p.email.toLowerCase().includes(query)
      )
    }

    // Filter by rating
    const ratingThreshold = parseFloat(selectedRating)
    if (ratingThreshold > 0) {
      filtered = filtered.filter((p) => (p.averageRating ?? 0) >= ratingThreshold)
    }

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
  }, [providers, searchQuery, selectedRating, sortBy])

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-[28px] font-semibold text-surface-800 mb-8">Find Service Providers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6 space-y-4"
            >
              <div className="h-12 w-12 bg-surface-200 rounded-full animate-pulse" />
              <div className="h-4 bg-surface-200 rounded animate-pulse w-2/3" />
              <div className="h-3 bg-surface-200 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-[14px] text-surface-500 text-center mt-16">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-[28px] font-semibold text-surface-800 mb-8">Find Service Providers</h1>

      {/* Filters section */}
      <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-[var(--radius-input)] text-[14px] focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
            />
          </div>

          {/* Rating filter */}
          <div className="relative">
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-4 py-2 border border-surface-200 rounded-[var(--radius-input)] text-[14px] appearance-none focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 bg-surface-0"
            >
              <option value="0">All Ratings</option>
              <option value="4">4+ stars</option>
              <option value="3">3+ stars</option>
              <option value="2">2+ stars</option>
              <option value="1">1+ stars</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'name' | 'newest')}
              className="w-full px-4 py-2 border border-surface-200 rounded-[var(--radius-input)] text-[14px] appearance-none focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 bg-surface-0"
            >
              <option value="rating">Highest Rating</option>
              <option value="newest">Newest</option>
              <option value="name">Name (A-Z)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          </div>

          {/* Results count */}
          <div className="flex items-center justify-end">
            <p className="text-[13px] text-surface-600">
              {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Providers grid */}
      {filteredProviders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[14px] text-surface-400">No providers found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              onClick={() => router.push(`/providers/${provider.id}`)}
              className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6 hover:border-accent-300 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4 mb-4">
                <AvatarInitials
                  name={provider.name}
                  email={provider.email}
                  avatarUrl={provider.avatarUrl}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  {provider.name && (
                    <h3 className="text-[16px] font-semibold text-surface-800 truncate">
                      {provider.name}
                    </h3>
                  )}
                  <p className="text-[12px] text-surface-500 truncate">{provider.email}</p>
                  <p className="text-[11px] text-surface-400 mt-1">
                    Joined{' '}
                    {new Date(provider.createdAt).toLocaleDateString('en-GB', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Rating section */}
              <div className="pt-4 border-t border-surface-100">
                {(provider.averageRating ?? 0) > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(provider.averageRating ?? 0)
                              ? 'fill-accent-500 stroke-accent-500'
                              : 'stroke-surface-300 fill-none'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="text-[13px] font-medium text-surface-700">
                      {(provider.averageRating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-[12px] text-surface-500">
                      ({provider.reviewCount} review{(provider.reviewCount ?? 0) !== 1 ? 's' : ''})
                    </span>
                  </div>
                ) : (
                  <p className="text-[12px] text-surface-400">No ratings yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
