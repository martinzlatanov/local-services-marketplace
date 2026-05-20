import { db } from './client'
import { jobs, jobCategories, locations, users } from './schema'
import { eq } from 'drizzle-orm'
import { JobDto, JobStatus } from '../types'

export const JOB_JOIN_SHAPE = {
  id: jobs.id,
  status: jobs.status,
  version: jobs.version,
  categoryId: jobCategories.id,
  categoryName: jobCategories.name,
  description: jobs.description,
  timeframe: jobs.timeframe,
  locationId: locations.id,
  locationName: locations.name,
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
  categoryId: number
  categoryName: string
  description: string
  timeframe: string
  locationId: number
  locationName: string
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
    category: { id: row.categoryId, name: row.categoryName },
    description: row.description,
    timeframe: row.timeframe,
    location: { id: row.locationId, name: row.locationName },
    clientId: String(row.clientId),
    providerId: row.providerId != null ? String(row.providerId) : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    clientName: row.clientName || undefined,
    clientEmail: row.clientEmail || undefined,
  }
}
