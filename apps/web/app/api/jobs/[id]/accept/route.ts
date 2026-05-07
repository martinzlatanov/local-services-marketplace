import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { jobs } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { broadcastToUser } from '@/lib/ws/server'
import { AcceptJobRequest, JobDto, ApiSuccessResponse, ApiErrorResponse, JobStatus, Role } from '@/lib/types'
import { eq, and } from 'drizzle-orm'

interface RouteContext {
  params: { id: string }
}

export async function POST(req: Request, context: { params: Promise<RouteContext['params']> }) {
  const { id } = await context.params;
  
  // 1. Authenticate user
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  // 2. Enforce PROVIDER role
  if (user.role !== Role.PROVIDER) {
    return NextResponse.json({ errors: { role: 'only_providers_can_accept_jobs' } }, { status: 403 })
  }

  // 3. Parse request body
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid_json' } }, { status: 400 })

  const payload = body as AcceptJobRequest;

  // 4. Validate required fields
  if (payload.version === undefined || payload.version === null) {
    return NextResponse.json({ errors: { version: 'required' } }, { status: 400 })
  }

  // 5. Parse and validate job ID
  const jobId = parseInt(id, 10)
  if (isNaN(jobId)) {
    return NextResponse.json({ errors: { id: 'invalid' } }, { status: 400 })
  }

  // 6. Fetch current job
  const [currentJob] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
  if (!currentJob) {
    return NextResponse.json({ errors: { job: 'not_found' } }, { status: 404 })
  }

  // 7. Verify job is in PENDING status
  if (currentJob.status !== JobStatus.PENDING) {
    return NextResponse.json(
      { errors: { status: 'job_not_pending' } },
      { status: 409 }
    )
  }

  // 8. Atomic update with optimistic locking:
  const [updatedJob] = await db.update(jobs)
    .set({
      status: JobStatus.ACCEPTED,
      providerId: String(user.id),
      version: currentJob.version + 1,
      updatedAt: new Date(),
    })
    .where(and(
      eq(jobs.id, jobId),
      eq(jobs.version, currentJob.version)
    ))
    .returning()

  // 9. Handle concurrent acceptance
  if (!updatedJob) {
    return NextResponse.json(
      { errors: { version: 'job_already_accepted' } },
      { status: 409 }
    )
  }

  // 10. Broadcast real-time update
  const jobDto: JobDto = {
    id: String(updatedJob.id),
    status: updatedJob.status as JobStatus,
    version: updatedJob.version,
    category: updatedJob.category,
    description: updatedJob.description,
    timeframe: updatedJob.timeframe,
    cityArea: updatedJob.cityArea,
    clientId: String(updatedJob.clientId),
    providerId: String(updatedJob.providerId),
    createdAt: updatedJob.createdAt.toISOString(),
    updatedAt: updatedJob.updatedAt.toISOString(),
  }
  
  broadcastToUser(String(currentJob.clientId), {
    type: 'JOB_UPDATED',
    payload: jobDto,
  })

  // 11. Return updated job
  return NextResponse.json({ data: updatedJob as unknown as JobDto } as ApiSuccessResponse<JobDto>)
}
