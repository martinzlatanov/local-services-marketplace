'use client'

import { Star } from 'lucide-react'

interface UserRatingProps {
  averageRating: number | string
  reviewCount: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function UserRating({ averageRating, reviewCount, showLabel = true, size = 'md' }: UserRatingProps) {
  const rating = typeof averageRating === 'string' ? parseFloat(averageRating) : averageRating
  const isValid = !isNaN(rating) && rating > 0

  const sizeMap = {
    sm: { star: 'h-3 w-3', text: 'text-xs' },
    md: { star: 'h-4 w-4', text: 'text-sm' },
    lg: { star: 'h-5 w-5', text: 'text-base' },
  }

  if (!isValid) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`${sizeMap[size].star} text-surface-300`}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className={`${sizeMap[size].text} text-surface-500`}>No reviews yet</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeMap[size].star} ${
              star <= Math.round(rating) ? 'fill-brand-500 text-brand-500' : 'text-surface-300'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      {showLabel && (
        <>
          <span className={`${sizeMap[size].text} font-semibold text-surface-900`}>{rating.toFixed(1)}</span>
          <span className={`${sizeMap[size].text} text-surface-600`}>({reviewCount})</span>
        </>
      )}
    </div>
  )
}
