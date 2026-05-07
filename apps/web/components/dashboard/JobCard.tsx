'use client'

import { JobDto, JobStatus } from '@/lib/types'

interface JobCardProps {
  job: JobDto
}

const statusColors = {
  [JobStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [JobStatus.ACCEPTED]: 'bg-blue-100 text-blue-800',
  [JobStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
  [JobStatus.COMPLETED]: 'bg-green-100 text-green-800',
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{job.category}</h3>
          <p className="text-sm text-gray-600 mt-1">{job.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            {job.cityArea} • {job.timeframe}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded font-medium ${
            statusColors[job.status] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {job.status}
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Created: {new Date(job.createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}
