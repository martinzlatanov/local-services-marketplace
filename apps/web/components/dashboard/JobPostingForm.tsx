'use client'

import { useState } from 'react'
import { JOB_CATEGORIES, CreateJobRequest, JobDto, JobCategory } from '@/lib/types'

interface JobPostingFormProps {
  onSuccess?: (job: JobDto) => void
}

export default function JobPostingForm({ onSuccess }: JobPostingFormProps) {
  const [formData, setFormData] = useState<CreateJobRequest>({
    category: JOB_CATEGORIES[0],
    description: '',
    timeframe: '',
    cityArea: '',
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
        setMessage({ type: 'success', text: 'Job posted successfully!' })
        setFormData({
          category: JOB_CATEGORIES[0],
          description: '',
          timeframe: '',
          cityArea: '',
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Post a New Job</h2>

      {message && (
        <div
          className={`p-3 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Describe the job details..."
          required
        />
      </div>

      <div>
        <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">
          Timeframe
        </label>
        <input
          type="text"
          id="timeframe"
          name="timeframe"
          value={formData.timeframe}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Within 3 days"
          required
        />
      </div>

      <div>
        <label htmlFor="cityArea" className="block text-sm font-medium text-gray-700 mb-1">
          City/Area
        </label>
        <input
          type="text"
          id="cityArea"
          name="cityArea"
          value={formData.cityArea}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Downtown"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 font-medium"
      >
        {isSubmitting ? 'Posting...' : 'Post Job'}
      </button>
    </form>
  )
}
