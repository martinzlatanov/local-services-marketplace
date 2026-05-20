'use client'

import { useState, useEffect } from 'react'
import { JobDto } from '@/lib/types'
import { Plus, Loader2 } from 'lucide-react'

interface LookupItem {
  id: number
  name: string
}

interface JobPostingFormProps {
  onSuccess?: (job: JobDto) => void
}

export default function JobPostingForm({ onSuccess }: JobPostingFormProps) {
  const [categoryId, setCategoryId] = useState<number>(0)
  const [locationId, setLocationId] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [timeframe, setTimeframe] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [areas, setAreas] = useState<LookupItem[]>([])
  const [categories, setCategories] = useState<LookupItem[]>([])

  useEffect(() => {
    fetch('/api/locations').then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length) {
        setAreas(d)
        setLocationId((prev) => prev === 0 ? d[0].id : prev)
      }
    }).catch(() => {})
    fetch('/api/categories').then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length) {
        setCategories(d)
        setCategoryId((prev) => prev === 0 ? d[0].id : prev)
      }
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ categoryId, locationId, description, timeframe }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Job posted successfully' })
        setDescription('')
        setTimeframe('')
        if (categories.length) setCategoryId(categories[0].id)
        if (areas.length) setLocationId(areas[0].id)
        if (onSuccess && data.data) {
          onSuccess(data.data)
        }
      } else {
        setMessage({ type: 'error', text: data.errors?.message || 'Failed to post job' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Plus className="h-5 w-5 text-brand-600" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-surface-900">Post a New Job</h2>
      </div>

      {message && (
        <div
          role={message.type === 'success' ? 'status' : 'alert'}
          className={`p-4 rounded-[var(--radius-btn)] text-sm font-medium ${
            message.type === 'success'
              ? 'bg-status-completed-bg text-status-completed-text'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-surface-700 mb-1.5">
          Category
        </label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
          className="w-full border border-surface-300 bg-surface-0 text-surface-900 rounded-[var(--radius-input)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-surface-700 mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border border-surface-300 bg-surface-0 text-surface-900 rounded-[var(--radius-input)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          placeholder="Describe the job details..."
          required
        />
      </div>

      <div>
        <label htmlFor="timeframe" className="block text-sm font-medium text-surface-700 mb-1.5">
          Timeframe
        </label>
        <input
          type="text"
          id="timeframe"
          name="timeframe"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="w-full border border-surface-300 bg-surface-0 text-surface-900 rounded-[var(--radius-input)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="e.g., Within 3 days"
          required
        />
      </div>

      <div>
        <label htmlFor="locationId" className="block text-sm font-medium text-surface-700 mb-1.5">
          City/Area
        </label>
        <select
          id="locationId"
          value={locationId}
          onChange={(e) => setLocationId(parseInt(e.target.value, 10))}
          className="w-full border border-surface-300 bg-surface-0 text-surface-900 rounded-[var(--radius-input)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        >
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand-600 text-white py-2.5 px-4 rounded-[var(--radius-btn)] hover:bg-brand-700 disabled:bg-brand-300 font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Posting...
          </>
        ) : (
          'Post Job'
        )}
      </button>
    </form>
  )
}
