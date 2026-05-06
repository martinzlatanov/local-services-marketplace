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

export const CITY_AREAS = [
  'Downtown',
  'Uptown',
  'Midtown',
  'Riverside',
  'Old Town',
  'Harbor',
  'Hillcrest',
  'Westside',
  'Eastside',
  'Midtown Heights',
] as const

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

// Validation error payload: field -> message map (required by Phase 2 D-03)
export interface ApiErrorResponse {
  errors: Record<string, string>
}

// Job-related request shapes (keep intact)
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

// Auth DTOs for Phase 2
export interface AuthRegisterRequest {
  email: string
  password: string
  role?: Role
}

export interface AuthLoginRequest {
  email: string
  password: string
}

export interface AuthUserDto {
  id: string
  email: string
  role: Role
  createdAt: string
}

export interface AuthRegisterResponse {
  user: AuthUserDto
}

export interface AuthLoginResponse {
  user: AuthUserDto
}

// WebSocket event types for Phase 6 Real-Time Infrastructure
export type WsEventType = 'JOB_UPDATED'

export interface WsEvent {
  type: WsEventType
  payload: JobDto
}
