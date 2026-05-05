// Shared cross-platform contracts for the Local Services Marketplace.
// Per D-08: JobStatus enum, Role enum, JobDto, API response wrappers,
// and request shapes consumed by both apps/web and apps/mobile.

export enum JobStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum Role {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
}

export interface JobDto {
  id: string
  status: JobStatus
  version: number
  category: string
  description: string
  timeframe: string
  cityArea: string
  clientId: string
  providerId: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiSuccessResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  error: string
  code: string
  statusCode: number
}

export interface CreateJobRequest {
  category: string
  description: string
  timeframe: string
  cityArea: string
}

export interface AcceptJobRequest {
  version: number
}

export interface UpdateJobStatusRequest {
  status: JobStatus
}
