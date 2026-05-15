import { NextResponse } from 'next/server'
import { jobs } from '@/lib/db/schema'
import { buildJobQuery, rowToJobDto } from '@/lib/db/job-query'
import { getAuthenticatedUser } from '@/lib/auth'
import { JobDto, ApiSuccessResponse, JobStatus } from '@/lib/types'
import { eq, and, inArray } from 'drizzle-orm'

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  const jobList = await buildJobQuery().where(
    and(
      eq(jobs.providerId, parseInt(user.id, 10)),
      inArray(jobs.status, [JobStatus.ACCEPTED, JobStatus.IN_PROGRESS, JobStatus.COMPLETED])
    )
  ).orderBy(jobs.updatedAt)

  return NextResponse.json({ data: jobList.map(rowToJobDto) } as ApiSuccessResponse<JobDto[]>)
}
