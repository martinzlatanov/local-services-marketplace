import { NextResponse } from 'next/server'
import { db } from '../../../../../lib/db'
import { jobs } from '../../../../../lib/db/schema'
import { getAuthenticatedUser } from '../../../../../lib/auth'
import { UpdateJobStatusRequest, JobDto, ApiSuccessResponse, ApiErrorResponse, JobStatus } from '@local/types'
import { eq } from 'drizzle-orm'

// Valid state transitions
const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.PENDING]: [JobStatus.ACCEPTED],
  [JobStatus.ACCEPTED]: [JobStatus.IN_PROGRESS],
  [JobStatus.IN_PROGRESS]: [JobStatus.COMPLETED],
  [JobStatus.COMPLETED]: [],
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // 1. Authenticate user
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  // 2. Parse request body
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid_json' } }, { status: 400 })
  
  const payload = body as UpdateJobStatusRequest
  
  if (!payload.status) {
    return NextResponse.json({ errors: { status: 'required' } }, { status: 400 })
  }

  // 3. Fetch current job
  const jobId = parseInt(params.id, 10)
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

  // 5. Update job status
  const [updatedJob] = await db.update(jobs)
    .set({ 
      status: requestedStatus,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId))
    .returning()

  // 6. Return updated JobDto
  const jobDto: JobDto = {
    id: String(updatedJob.id),
    status: updatedJob.status as JobStatus,
    version: updatedJob.version,
    category: updatedJob.category,
    description: updatedJob.description,
    timeframe: updatedJob.timeframe,
    cityArea: updatedJob.cityArea,
    clientId: updatedJob.clientId,
    providerId: updatedJob.providerId,
    createdAt: updatedJob.createdAt.toISOString(),
    updatedAt: updatedJob.updatedAt.toISOString(),
  }

  return NextResponse.json({ data: jobDto } as ApiSuccessResponse<JobDto>)
}
