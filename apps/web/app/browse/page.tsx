'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { JobDto, Role } from '@/lib/types'
import JobCard from '@/components/dashboard/JobCard'
import { Loader2 } from 'lucide-react'

export default function BrowsePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobDto[]>([])
  const [selectedArea, setSelectedArea] = useState<string>('All')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [areas, setAreas] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])

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
    if (!isLoading && user) fetchJobs()
  }, [fetchJobs, isLoading, user])

  useEffect(() => {
    fetch('/api/locations')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAreas(d.map((l: { name: string }) => l.name)) })
      .catch(e => console.error('Failed to load locations', e))
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setCategories(d.map((c: { name: string }) => c.name)) })
      .catch(e => console.error('Failed to load categories', e))
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-surface-400 animate-spin" aria-label="Loading" />
          <p className="text-surface-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user?.roles.includes(Role.PROVIDER)) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-surface-600 mb-4">Only providers can browse jobs.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-surface-900 text-white rounded-[var(--radius-btn)] hover:opacity-[0.88]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <p className="eyebrow mb-3">Provider — Browse</p>
          <div className="flex items-end justify-between">
            <h1 className="text-[32px] font-extrabold tracking-[-1px] text-surface-900">Available Jobs</h1>
            <p className="text-[14px] text-surface-500">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0">
            <div className="border border-surface-200 rounded-[var(--radius-card)] overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-200 bg-surface-50">
                <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-surface-500">Location</p>
              </div>
              <div className="py-1">
                {['All', ...areas].map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                      selectedArea === area
                        ? 'bg-surface-900 text-white font-medium'
                        : 'text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-b border-surface-200 bg-surface-50">
                <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-surface-500">Category</p>
              </div>
              <div className="py-1">
                {['All', ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                      selectedCategory === cat
                        ? 'bg-surface-900 text-white font-medium'
                        : 'text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {isLoadingJobs ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 text-surface-400 animate-spin" aria-label="Loading jobs" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 text-surface-500">
                <p className="font-medium">No jobs found</p>
                <p className="text-sm mt-1 text-surface-400">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <div className="border border-surface-200 rounded-[var(--radius-card)] overflow-hidden">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-surface-200 bg-surface-50">
                      <th className="text-left px-4 py-3 text-[11px] font-bold tracking-[0.06em] text-surface-500 uppercase">Job</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold tracking-[0.06em] text-surface-500 uppercase w-32">Area</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold tracking-[0.06em] text-surface-500 uppercase w-28">Timeframe</th>
                      <th className="text-right px-4 py-3 text-[11px] font-bold tracking-[0.06em] text-surface-500 uppercase w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job, i) => (
                      <tr
                        key={job.id}
                        className={`${i < jobs.length - 1 ? 'border-b border-surface-200' : ''} hover:bg-surface-50 transition-colors`}
                      >
                        <td className="px-4 py-4">
                          <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-surface-400 mb-0.5">{job.category}</p>
                          <p className="text-[14px] font-medium text-surface-800 truncate max-w-xs">{job.description}</p>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-surface-600">{job.cityArea}</td>
                        <td className="px-4 py-4 text-[13px] text-surface-600">{job.timeframe}</td>
                        <td className="px-4 py-4 text-right">
                          <JobCard key={job.id} job={job} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
