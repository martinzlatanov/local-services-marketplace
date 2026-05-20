'use client'

import { JobDto, JobStatus } from '@/lib/types'
import { MapPin } from 'lucide-react'

interface JobCardProps {
  job: JobDto
}

const statusColors = {
  [JobStatus.PENDING]: 'bg-status-pending-bg text-status-pending-text',
  [JobStatus.ACCEPTED]: 'bg-status-accepted-bg text-status-accepted-text',
  [JobStatus.IN_PROGRESS]: 'bg-status-progress-bg text-status-progress-text',
  [JobStatus.COMPLETED]: 'bg-status-completed-bg text-status-completed-text',
}

const categoryIcons: Record<string, string> = {
  PLUMBING: '💧',
  ELECTRICAL: '⚡',
  CLEANING: '✨',
  GARDENING: '🌿',
  MOVING: '🚚',
  HANDYMAN: '🔨',
  PAINTING: '🎨',
  OTHER: '⋯',
}

export default function JobCard({ job }: JobCardProps) {
  const categoryIcon = categoryIcons[job.category.name] || '•'

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-200 flex items-start gap-3">
      {/* Icon tile */}
      <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0 text-[18px]">
        {categoryIcon}
      </div>
      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-surface-400 mb-0.5">{job.category.name}</p>
        <p className="text-[14px] font-medium text-surface-800 truncate">{job.description}</p>
        <p className="flex items-center gap-1 text-[12px] text-surface-500 mt-1">
          <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          {job.location.name} · {job.timeframe}
        </p>
      </div>
      {/* Right: badge + date */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={`text-[11px] px-2.5 py-1 rounded-[var(--radius-badge)] font-medium ${statusColors[job.status] || 'bg-surface-100 text-surface-800'}`}>
          {job.status.replace('_', ' ')}
        </span>
        <span className="text-[11px] text-surface-400">{new Date(job.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
