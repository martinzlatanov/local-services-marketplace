'use client'

import { useState, useRef } from 'react'
import { ReviewDTO, ClientRatings, ProviderRatings } from '@/lib/types'
import { Star, Upload, X, Loader2 } from 'lucide-react'

interface ReviewFormProps {
  jobId: number
  reviewType: 'client' | 'provider'
  onSuccess: () => void
  reviewerUserId: number
  revieweeUserId: number
}

type ClientRatingKey = 'communication' | 'quality' | 'punctuality'
type ProviderRatingKey = 'paymentReliability' | 'communicationClarity' | 'professionalism'

const CLIENT_RATING_CATEGORIES = {
  communication: 'Communication',
  quality: 'Quality of Work',
  punctuality: 'Punctuality',
}

const PROVIDER_RATING_CATEGORIES = {
  paymentReliability: 'Payment Reliability',
  communicationClarity: 'Communication Clarity',
  professionalism: 'Professionalism',
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
}

export default function ReviewForm({ jobId, reviewType, onSuccess, reviewerUserId, revieweeUserId }: ReviewFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [text, setText] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const categories = reviewType === 'client' ? CLIENT_RATING_CATEGORIES : PROVIDER_RATING_CATEGORIES
  const categoryKeys = Object.keys(categories) as (ClientRatingKey | ProviderRatingKey)[]

  const allRatingsFilled = categoryKeys.every(key => ratings[key] !== undefined && ratings[key] > 0)

  const handleRatingClick = (category: string, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }))
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value.slice(0, 1000))
  }

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed'
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5 MB'
    }
    return null
  }

  const handleFileSelect = (file: File) => {
    setPhotoError(null)
    const error = validateFile(file)
    if (error) {
      setPhotoError(error)
      return
    }
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
    }
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadPhotoToBlob = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.errors?.file || 'Failed to upload photo')
    }

    const data = await res.json()
    return data.data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!allRatingsFilled) {
      setError('Please rate all categories')
      return
    }

    if (text.trim().length === 0) {
      setError('Please provide a review')
      return
    }

    setIsLoading(true)

    try {
      let photoUrl: string | undefined

      if (photoFile) {
        photoUrl = await uploadPhotoToBlob(photoFile)
      }

      const requestBody = {
        jobId,
        text: text.trim(),
        photoUrl: photoUrl || null,
      }

      if (reviewType === 'client') {
        ;(requestBody as any).clientRating = {
          communication: ratings.communication,
          quality: ratings.quality,
          punctuality: ratings.punctuality,
        }
      } else {
        ;(requestBody as any).providerRating = {
          paymentReliability: ratings.paymentReliability,
          communicationClarity: ratings.communicationClarity,
          professionalism: ratings.professionalism,
        }
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 409) {
          setError('You have already submitted a review for this job')
        } else {
          setError(data.errors?.message || 'Failed to submit review')
        }
        return
      }

      setSuccess(true)
      setRatings({})
      setText('')
      setPhotoFile(null)
      setPhotoPreview(null)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6">
        <div className="flex items-center gap-3 text-status-completed-text bg-status-completed-bg rounded-[var(--radius-btn)] p-4">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Review submitted successfully!</p>
            <p className="text-sm opacity-90 mt-0.5">Your review is pending admin approval.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-surface-900 mb-1">
          {reviewType === 'client' ? 'Rate the Provider' : 'Rate the Client'}
        </h2>
        <p className="text-sm text-surface-600">Share your experience to help others make informed decisions</p>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-[var(--radius-btn)] text-sm font-medium bg-red-100 text-red-800">
          {error}
        </div>
      )}

      {/* Rating categories */}
      <div className="space-y-6">
        {categoryKeys.map((category) => {
          const label = categories[category] as string
          const value = ratings[category] || 0

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-surface-700">{label}</label>
                {value > 0 && (
                  <span className="text-xs font-medium text-brand-600">
                    {value} - {RATING_LABELS[value]}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(category, star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${label}: ${star} stars`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= value ? 'fill-brand-500 text-brand-500' : 'text-surface-300'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Text review */}
      <div>
        <label htmlFor="review-text" className="block text-sm font-medium text-surface-700 mb-2">
          Your Review {text.length > 0 && <span className="text-xs text-surface-500">({text.length}/1000)</span>}
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={handleTextChange}
          placeholder="Share details about your experience..."
          rows={4}
          className="w-full border border-surface-300 bg-surface-0 text-surface-900 rounded-[var(--radius-input)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-sm"
          required
        />
      </div>

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">Add a Photo (Optional)</label>

        {!photoPreview ? (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[var(--radius-input)] p-6 text-center transition-colors ${
                isDragging
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-surface-300 hover:border-surface-400'
              }`}
            >
              <Upload className="h-8 w-8 text-surface-400 mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm font-medium text-surface-700 mb-1">Drag and drop your image</p>
              <p className="text-xs text-surface-600 mb-3">or</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-block px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-[var(--radius-btn)] transition-colors"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
                aria-label="Upload photo"
              />
              <p className="text-xs text-surface-600 mt-3">JPEG, PNG or WebP • Max 5 MB</p>
            </div>
            {photoError && (
              <p className="text-xs text-red-600 mt-2">{photoError}</p>
            )}
          </>
        ) : (
          <div className="relative inline-block">
            <img
              src={photoPreview}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-[var(--radius-input)] border border-surface-300"
            />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={!allRatingsFilled || isLoading}
          className={`flex-1 py-2.5 px-4 rounded-[var(--radius-btn)] font-medium text-sm transition-colors ${
            !allRatingsFilled || isLoading
              ? 'bg-surface-200 text-surface-500 cursor-not-allowed'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Submitting...
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
      </div>
    </form>
  )
}
