'use client'

import { JobDto } from '@/lib/types'
import { Role } from '@/lib/types'
import { Inbox } from 'lucide-react'
import JobCard from './JobCard'
import JobDetailCard from './JobDetailCard'

interface JobDashboardProps {
  jobs: JobDto[]
  userRole?: Role
  onJobUpdate?: (updatedJob: JobDto) => void
}

export default function JobDashboard({ jobs, userRole = Role.CLIENT, onJobUpdate }: JobDashboardProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox className="h-12 w-12 text-surface-300 mx-auto mb-4" aria-hidden="true" />
        <p className="text-surface-500 text-lg font-medium">No jobs posted yet.</p>
        <p className="text-surface-400 text-sm mt-2">
          Use the form above to post your first job!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map(job =>
        userRole === Role.CLIENT ? (
          <JobDetailCard key={job.id} job={job} userRole={userRole} />
        ) : (
          <JobCard key={job.id} job={job} />
        )
      )}
    </div>
  )
}
