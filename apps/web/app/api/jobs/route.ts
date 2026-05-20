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
  const location = url.searchParams.get('location')
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
  // location/category filters also trigger browse mode for backwards compatibility
  // Without any of these, return the authenticated user's own jobs
  const isBrowsing = browse || location || category

  const filters = isBrowsing
    ? [eq(jobs.status, JobStatus.PENDING)]
    : [eq(jobs.clientId, parseInt(user.id, 10))]

  if (location) filters.push(eq(locations.name, location))
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

  const categoryId = typeof payload.categoryId === 'number' && Number.isInteger(payload.categoryId) && payload.categoryId > 0
    ? payload.categoryId : null
  const locationId = typeof payload.locationId === 'number' && Number.isInteger(payload.locationId) && payload.locationId > 0
    ? payload.locationId : null

  if (!categoryId) {
    return NextResponse.json({ errors: { categoryId: 'required_positive_integer' } }, { status: 400 })
  }
  if (!locationId) {
    return NextResponse.json({ errors: { locationId: 'required_positive_integer' } }, { status: 400 })
  }
  if (!payload.description) {
    return NextResponse.json({ errors: { description: 'required' } }, { status: 400 })
  }
  if (!payload.timeframe) {
    return NextResponse.json({ errors: { timeframe: 'required' } }, { status: 400 })
  }

  const [newJob] = await db.insert(jobs).values({
    categoryId: categoryId,
    locationId: locationId,
    description: payload.description,
    timeframe: payload.timeframe,
    clientId: parseInt(user.id, 10),
    status: JobStatus.PENDING,
    version: 1,
  }).returning()

  const [jobRow] = await buildJobQuery().where(eq(jobs.id, newJob.id)).limit(1)

  return NextResponse.json({ data: rowToJobDto(jobRow) } as ApiSuccessResponse<JobDto>, { status: 201 })
}
