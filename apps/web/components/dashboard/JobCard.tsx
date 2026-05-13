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
  const categoryIcon = categoryIcons[job.category] || '•'

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-200">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-surface-900 flex items-center gap-2">
            <span>{categoryIcon}</span>
            {job.category}
          </h3>
          <p className="text-sm text-surface-600 mt-1">{job.description}</p>
          <p className="flex items-center gap-1 text-xs text-surface-500 mt-2">
            <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {job.cityArea} • {job.timeframe}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1.5 rounded-[var(--radius-badge)] font-medium flex-shrink-0 ${
            statusColors[job.status] || 'bg-surface-100 text-surface-800'
          }`}
        >
          {job.status}
        </span>
      </div>
      <div className="mt-3 text-xs text-surface-400">
        Created: {new Date(job.createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}
