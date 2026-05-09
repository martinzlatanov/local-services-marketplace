import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { jobs } from '@/lib/db/schema'
import { getAuthenticatedUser, verifyJwt } from '@/lib/auth'
import { CreateJobRequest, JobDto, ApiSuccessResponse, ApiErrorResponse, JobStatus } from '@/lib/types'
import { JOB_CATEGORIES } from '@/lib/db/categories'
import { eq, and } from 'drizzle-orm'

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  const url = new URL(req.url)
  const cityArea = url.searchParams.get('cityArea')
  const category = url.searchParams.get('category')

  // If query params provided, user is browsing job market (PENDING jobs only)
  // Otherwise, return user's own jobs
  const isBrowsing = cityArea || category

  const filters = isBrowsing
    ? [eq(jobs.status, JobStatus.PENDING)]
    : [eq(jobs.clientId, String(user.id))]

  if (cityArea) filters.push(eq(jobs.cityArea, cityArea))
  if (category) filters.push(eq(jobs.category, category as any))

  const jobList = await db.select().from(jobs).where(and(...filters))

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

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })
  
  if (user.role !== 'CLIENT') {
    return NextResponse.json({ errors: { role: 'only_clients_can_post_jobs' } }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid_json' } }, { status: 400 })
  
  const payload = body as CreateJobRequest
  
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

  if (!JOB_CATEGORIES.includes(payload.category as any)) {
    return NextResponse.json({ errors: { category: 'invalid_category' } }, { status: 400 })
  }

  const [newJob] = await db.insert(jobs).values({
    category: payload.category as any,
    description: payload.description,
    timeframe: payload.timeframe,
    cityArea: payload.cityArea,
    clientId: String(user.id),
    status: JobStatus.PENDING,
    version: 1,
  }).returning()

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

  return NextResponse.json({ data: jobDto } as ApiSuccessResponse<JobDto>, { status: 201 })
}
