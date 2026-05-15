import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { jobs } from '@/lib/db/schema'
import { buildJobQuery, rowToJobDto } from '@/lib/db/job-query'
import { getAuthenticatedUser } from '@/lib/auth'
import { UpdateJobStatusRequest, JobDto, ApiSuccessResponse, ApiErrorResponse, JobStatus, Role } from '@/lib/types'
import { eq } from 'drizzle-orm'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  const { id } = await params
  const jobId = parseInt(id, 10)
  if (isNaN(jobId)) {
    return NextResponse.json({ errors: { id: 'invalid' } }, { status: 400 })
  }

  const [job] = await buildJobQuery().where(eq(jobs.id, jobId)).limit(1)
  if (!job) {
    return NextResponse.json({ errors: { job: 'not_found' } }, { status: 404 })
  }

  return NextResponse.json({ data: rowToJobDto(job) } as ApiSuccessResponse<JobDto>)
}

// Valid state transitions
const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.PENDING]: [JobStatus.ACCEPTED],
  [JobStatus.ACCEPTED]: [JobStatus.IN_PROGRESS],
  [JobStatus.IN_PROGRESS]: [JobStatus.COMPLETED],
  [JobStatus.COMPLETED]: [],
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // 1. Authenticate user
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  if (!user.roles.includes(Role.PROVIDER)) {
    return NextResponse.json({ errors: { role: 'only_providers_can_update_job_status' } }, { status: 403 })
  }

  // 2. Parse request body
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid_json' } }, { status: 400 })
  
  const payload = body as UpdateJobStatusRequest
  
  if (!payload.status) {
    return NextResponse.json({ errors: { status: 'required' } }, { status: 400 })
  }

  // 3. Fetch current job
  const { id } = await params
  const jobId = parseInt(id, 10)
  if (isNaN(jobId)) {
    return NextResponse.json({ errors: { id: 'invalid' } }, { status: 400 })
  }

  const [currentJob] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
  if (!currentJob) {
    return NextResponse.json({ errors: { job: 'not_found' } }, { status: 404 })
  }

  // 4. Validate state transition
  const currentStatus = currentJob.status as JobStatus
  const requestedStatus = payload.status
  
  if (!VALID_TRANSITIONS[currentStatus]?.includes(requestedStatus)) {
    return NextResponse.json({ 
      errors: { transition: `invalid_transition_from_${currentStatus}_to_${requestedStatus}` } 
    }, { status: 409 })
  }

  // 5. Check version for optimistic concurrency
  if (payload.version && payload.version !== currentJob.version) {
    return NextResponse.json({
      errors: { version: 'conflict', currentVersion: currentJob.version }
    }, { status: 409 })
  }

  // 6. Update job status
  const updateData: any = {
    status: requestedStatus,
    updatedAt: new Date(),
  }
  
  // Set providerId when accepting job
  if (requestedStatus === JobStatus.ACCEPTED) {
    updateData.providerId = parseInt(user.id, 10)
  }
  
  // Increment version
  updateData.version = currentJob.version + 1

  await db.update(jobs)
    .set(updateData)
    .where(eq(jobs.id, jobId))

  // 7. Return updated JobDto (JOIN to resolve category/location names)
  const [updatedRow] = await buildJobQuery().where(eq(jobs.id, jobId)).limit(1)

  return NextResponse.json({ data: rowToJobDto(updatedRow) } as ApiSuccessResponse<JobDto>)
}
