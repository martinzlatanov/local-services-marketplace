import { db } from './client'
import { jobs, jobCategories, locations, users } from './schema'
import { eq } from 'drizzle-orm'
import { JobDto, JobStatus } from '../types'

export const JOB_JOIN_SHAPE = {
  id: jobs.id,
  status: jobs.status,
  version: jobs.version,
  category: jobCategories.name,
  description: jobs.description,
  timeframe: jobs.timeframe,
  cityArea: locations.name,
  clientId: jobs.clientId,
  providerId: jobs.providerId,
  createdAt: jobs.createdAt,
  updatedAt: jobs.updatedAt,
  clientEmail: users.email,
  clientName: users.name,
}

export function buildJobQuery() {
  return db
    .select(JOB_JOIN_SHAPE)
    .from(jobs)
    .innerJoin(jobCategories, eq(jobs.categoryId, jobCategories.id))
    .innerJoin(locations, eq(jobs.locationId, locations.id))
    .leftJoin(users, eq(jobs.clientId, users.id))
}

export function rowToJobDto(row: {
  id: number
  status: string
  version: number
  category: string
  description: string
  timeframe: string
  cityArea: string
  clientId: number
  providerId: number | null
  createdAt: Date
  updatedAt: Date
  clientEmail?: string | null
  clientName?: string | null
}): JobDto {
  return {
    id: String(row.id),
    status: row.status as JobStatus,
    version: row.version,
    category: row.category,
    description: row.description,
    timeframe: row.timeframe,
    cityArea: row.cityArea,
    clientId: String(row.clientId),
    providerId: row.providerId != null ? String(row.providerId) : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    clientName: row.clientName || undefined,
    clientEmail: row.clientEmail || undefined,
  }
}
