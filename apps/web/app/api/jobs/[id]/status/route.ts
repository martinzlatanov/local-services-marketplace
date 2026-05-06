import { NextResponse } from 'next/server'
import { db } from '../../../../../../lib/db'
import { jobs } from '../../../../../../lib/db/schema'
import { getAuthenticatedUser } from '../../../../../../lib/auth'
import { broadcastToUser } from '../../../../../../lib/ws/server'
import { UpdateJobStatusRequest, JobDto, ApiSuccessResponse, ApiErrorResponse, JobStatus, Role } from '@local/types'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // 1. Authenticate user
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  // 2. Enforce PROVIDER role
  if (user.role !== Role.PROVIDER) {
    return NextResponse.json({ errors: { role: 'only_providers_can_update_status' } }, { status: 403 })
  }

  // 3. Parse request body
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid_json' } }, { status: 400 })

  const payload = body as UpdateJobStatusRequest

  // 4. Validate required fields
  if (!payload.status) {
    return NextResponse.json({ errors: { status: 'required' } }, { status: 400 })
  }

  // 5. Parse and validate job ID
  const jobId = parseInt(params.id, 10)
  if (isNaN(jobId)) {
    return NextResponse.json({ errors: { id: 'invalid' } }, { status: 400 })
  }

  // 6. Fetch current job and verify provider owns it
  const [currentJob] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
  if (!currentJob) {
    return NextResponse.json({ errors: { job: 'not_found' } }, { status: 404 })
  }

  // 7. Verify the provider owns this job
  if (currentJob.providerId !== String(user.id)) {
    return NextResponse.json({ errors: { job: 'not_your_job' } }, { status: 403 })
  }

  // 8. Validate state machine transition
  const validTransitions: Record<string, string[]> = {
    [JobStatus.ACCEPTED]: [JobStatus.IN_PROGRESS],
    [JobStatus.IN_PROGRESS]: [JobStatus.COMPLETED],
  }

  const allowedNext = validTransitions[currentJob.status]
  if (!allowedNext || !allowedNext.includes(payload.status)) {
    return NextResponse.json(
      { errors: { status: `invalid_transition_from_${currentJob.status}` } },
      { status: 400 }
    )
  }

  // 9. Update job status
  const [updatedJob] = await db.update(jobs)
    .set({
      status: payload.status,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId))
    .returning()

  if (!updatedJob) {
    return NextResponse.json(
      { errors: { job: 'update_failed' } },
      { status: 500 }
    )
  }

  // 10. Broadcast JOB_UPDATED event to the client
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

  // Broadcast to the client who posted the job
  broadcastToUser(updatedJob.clientId, { type: 'JOB_UPDATED', payload: jobDto })

  return NextResponse.json({ data: jobDto } as ApiSuccessResponse<JobDto>)
}
