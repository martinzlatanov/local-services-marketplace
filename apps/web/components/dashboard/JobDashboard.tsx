'use client'

import { JobDto } from '@/lib/types'
import JobCard from './JobCard'

interface JobDashboardProps {
  jobs: JobDto[]
  onJobUpdate?: (updatedJob: JobDto) => void
}

export default function JobDashboard({ jobs, onJobUpdate }: JobDashboardProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No jobs posted yet.</p>
        <p className="text-gray-400 text-sm mt-2">
          Use the form above to post your first job!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
