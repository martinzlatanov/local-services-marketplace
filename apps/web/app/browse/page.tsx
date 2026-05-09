'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { JobDto, CITY_AREAS, Role } from '@/lib/types'
import { JOB_CATEGORIES } from '@/lib/db/categories'
import JobCard from '@/components/dashboard/JobCard'
import { Loader2 } from 'lucide-react'

export default function BrowsePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobDto[]>([])
  const [selectedArea, setSelectedArea] = useState<string>('All')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)

  const fetchJobs = useCallback(async () => {
    setIsLoadingJobs(true)
    const params = new URLSearchParams()
    params.append('browse', '1')
    if (selectedArea !== 'All') params.append('cityArea', selectedArea)
    if (selectedCategory !== 'All') params.append('category', selectedCategory)
    const url = `/api/jobs?${params.toString()}`
    try {
      const res = await fetch(url, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setJobs(data.data ?? [])
      }
    } catch {}
    finally {
      setIsLoadingJobs(false)
    }
  }, [selectedArea, selectedCategory])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" aria-label="Loading" />
          <p className="text-surface-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user?.role !== Role.PROVIDER) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-surface-600 mb-4">Only providers can browse jobs.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-brand-600 text-white rounded-[var(--radius-btn)] hover:bg-brand-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900">Browse Jobs</h1>
          <p className="text-surface-600 mt-2">Find available jobs in your area and expertise</p>
        </div>

        {/* Filters */}
        <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6 mb-8">
          <div className="space-y-6">
            {/* Location filter */}
            <div>
              <h3 className="text-sm font-semibold text-surface-900 mb-3">Location</h3>
              <div className="flex gap-2 flex-wrap">
                {['All', ...CITY_AREAS].map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`px-3 py-1.5 text-sm rounded-[var(--radius-badge)] font-medium transition-colors ${
                      selectedArea === area
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <h3 className="text-sm font-semibold text-surface-900 mb-3">Category</h3>
              <div className="flex gap-2 flex-wrap">
                {['All', ...JOB_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-sm rounded-[var(--radius-badge)] font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Jobs list */}
        {isLoadingJobs ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-brand-600 animate-spin" aria-label="Loading jobs" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-surface-500 font-medium">No jobs found</p>
            <p className="text-surface-400 text-sm mt-1">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
