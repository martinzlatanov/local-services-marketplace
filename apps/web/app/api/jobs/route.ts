import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { jobs } from '../../../../lib/db/schema'
import { getAuthenticatedUser } from '../../../../lib/auth'
import { CreateJobRequest, JobDto, ApiSuccessResponse, ApiErrorResponse, JobStatus } from '@local/types'
import { JOB_CATEGORIES } from '../../../../lib/db/categories'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  // 1. Authenticate user
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })
  
  // 2. Enforce CLIENT role
  if (user.role !== 'CLIENT') {
    return NextResponse.json({ errors: { role: 'only_clients_can_post_jobs' } }, { status: 403 })
  }

  // 3. Parse and validate request body
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid_json' } }, { status: 400 })
  
  const payload = body as CreateJobRequest
  
  // 4. Validate required fields
  if (!payload.category || !payload.description || !payload.timeframe || !payload.cityArea) {
    return NextResponse.json({ 
      errors: { 
        category: !payload.category ? 'required' : undefined,
        description: !payload.description ? 'required' : undefined,
        timeframe: !payload.timeframe ? 'required' : undefined,
        cityArea: !payload.cityArea ? 'required' : undefined,
      } 
    }, { status: 400 })
  }

  // 5. Validate category against fixed list
  if (!JOB_CATEGORIES.includes(payload.category as any)) {
    return NextResponse.json({ errors: { category: 'invalid_category' } }, { status: 400 })
  }

  // 6. Create job in database
  const [newJob] = await db.insert(jobs).values({
    category: payload.category as any, // Cast to match pgEnum type
    description: payload.description,
    timeframe: payload.timeframe,
    cityArea: payload.cityArea,
    clientId: String(user.id),
    status: JobStatus.PENDING,
    version: 1,
  }).returning()

  // 7. Return JobDto
  const jobDto: JobDto = {
    id: String(newJob.id),
    status: newJob.status as JobStatus,
    version: newJob.version,
    category: newJob.category,
    description: newJob.description,
    timeframe: newJob.timeframe,
    cityArea: newJob.cityArea,
    clientId: newJob.clientId,
    providerId: newJob.providerId,
    createdAt: newJob.createdAt.toISOString(),
    updatedAt: newJob.updatedAt.toISOString(),
  }

  return NextResponse.json({ data: jobDto } as ApiSuccessResponse<JobDto>)
}
