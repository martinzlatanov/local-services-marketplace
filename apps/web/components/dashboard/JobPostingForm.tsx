'use client'

import { useState } from 'react'
import { JOB_CATEGORIES, CITY_AREAS, CreateJobRequest, JobDto, JobCategory } from '@/lib/types'
import { Plus, Loader2 } from 'lucide-react'

interface JobPostingFormProps {
  onSuccess?: (job: JobDto) => void
}

export default function JobPostingForm({ onSuccess }: JobPostingFormProps) {
  const [formData, setFormData] = useState<CreateJobRequest>({
    category: JOB_CATEGORIES[0],
    description: '',
    timeframe: '',
    cityArea: CITY_AREAS[0],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Job posted successfully' })
        setFormData({
          category: JOB_CATEGORIES[0],
          description: '',
          timeframe: '',
          cityArea: CITY_AREAS[0],
        })
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
        <label htmlFor="category" className="block text-sm font-medium text-surface-700 mb-1.5">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border border-surface-300 bg-surface-0 text-surface-900 rounded-[var(--radius-input)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        >
          {JOB_CATEGORIES.map((cat: JobCategory) => (
            <option key={cat} value={cat}>
              {cat}
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
          value={formData.description}
          onChange={handleChange}
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
          value={formData.timeframe}
          onChange={handleChange}
          className="w-full border border-surface-300 bg-surface-0 text-surface-900 rounded-[var(--radius-input)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="e.g., Within 3 days"
          required
        />
      </div>

      <div>
        <label htmlFor="cityArea" className="block text-sm font-medium text-surface-700 mb-1.5">
          City/Area
        </label>
        <select
          id="cityArea"
          name="cityArea"
          value={formData.cityArea}
          onChange={handleChange}
          className="w-full border border-surface-300 bg-surface-0 text-surface-900 rounded-[var(--radius-input)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        >
          {CITY_AREAS.map((area) => (
            <option key={area} value={area}>
              {area}
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
