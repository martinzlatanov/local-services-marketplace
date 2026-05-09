import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { jobs } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { JobDto, ApiSuccessResponse, JobStatus } from '@/lib/types'
import { eq, and, inArray } from 'drizzle-orm'

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  const jobList = await db.select().from(jobs).where(
    and(
      eq(jobs.providerId, String(user.id)),
      inArray(jobs.status, [JobStatus.ACCEPTED, JobStatus.IN_PROGRESS, JobStatus.COMPLETED])
    )
  ).orderBy(jobs.updatedAt)

  const jobDtos: JobDto[] = jobList.map(job => ({
    id: String(job.id),
    status: job.status as JobStatus,
    version: job.version,
    category: job.category,
    description: job.description,
    timeframe: job.timeframe,
    cityArea: job.cityArea,
    clientId: job.clientId,
    providerId: job.providerId,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }))

  return NextResponse.json({ data: jobDtos } as ApiSuccessResponse<JobDto[]>)
}
