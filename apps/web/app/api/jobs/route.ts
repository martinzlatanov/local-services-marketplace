import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { jobs, jobCategories, locations } from '@/lib/db/schema'
import { buildJobQuery, rowToJobDto } from '@/lib/db/job-query'
import { getAuthenticatedUser } from '@/lib/auth'
import { CreateJobRequest, JobDto, ApiSuccessResponse, JobStatus, Role } from '@/lib/types'
import { eq, and } from 'drizzle-orm'

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  const url = new URL(req.url)
  const cityArea = url.searchParams.get('cityArea')
  const category = url.searchParams.get('category')
  const browse = url.searchParams.get('browse')
  const providerId = url.searchParams.get('providerId')
  const status = url.searchParams.get('status')

  // If providerId is specified, return jobs for that provider
  if (providerId) {
    const filters = [eq(jobs.providerId, parseInt(providerId, 10))]
    if (status) filters.push(eq(jobs.status, status as JobStatus))
    const jobList = await buildJobQuery().where(and(...filters))
    return NextResponse.json({ data: jobList.map(rowToJobDto) } as ApiSuccessResponse<JobDto[]>)
  }

  // browse=1 signals the provider job market feed (PENDING jobs only)
  // cityArea/category filters also trigger browse mode for backwards compatibility
  // Without any of these, return the authenticated user's own jobs
  const isBrowsing = browse || cityArea || category

  const filters = isBrowsing
    ? [eq(jobs.status, JobStatus.PENDING)]
    : [eq(jobs.clientId, parseInt(user.id, 10))]

  if (cityArea) filters.push(eq(locations.name, cityArea))
  if (category) filters.push(eq(jobCategories.name, category))

  const jobList = await buildJobQuery().where(and(...filters))

  return NextResponse.json({ data: jobList.map(rowToJobDto) } as ApiSuccessResponse<JobDto[]>)
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  if (!user.roles.includes(Role.CLIENT)) {
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

  const [catRow] = await db
    .select({ id: jobCategories.id })
    .from(jobCategories)
    .where(eq(jobCategories.name, payload.category))
    .limit(1)
  if (!catRow) {
    return NextResponse.json({ errors: { category: 'invalid_category' } }, { status: 400 })
  }

  const [locRow] = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.name, payload.cityArea))
    .limit(1)
  if (!locRow) {
    return NextResponse.json({ errors: { cityArea: 'invalid_city_area' } }, { status: 400 })
  }

  const [newJob] = await db.insert(jobs).values({
    categoryId: catRow.id,
    locationId: locRow.id,
    description: payload.description,
    timeframe: payload.timeframe,
    clientId: parseInt(user.id, 10),
    status: JobStatus.PENDING,
    version: 1,
  }).returning()

  const jobDto: JobDto = {
    id: String(newJob.id),
    status: newJob.status as JobStatus,
    version: newJob.version,
    category: payload.category,
    description: newJob.description,
    timeframe: newJob.timeframe,
    cityArea: payload.cityArea,
    clientId: String(newJob.clientId),
    providerId: null,
    createdAt: newJob.createdAt.toISOString(),
    updatedAt: newJob.updatedAt.toISOString(),
  }

  return NextResponse.json({ data: jobDto } as ApiSuccessResponse<JobDto>, { status: 201 })
}
