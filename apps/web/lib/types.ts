// Shared cross-platform contracts for the Local Services Marketplace.
// Originally from @local/types package - copied locally for Vercel deployment compatibility.

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

export const JOB_CATEGORIES = [
  'PLUMBING',
  'ELECTRICAL',
  'CLEANING',
  'GARDENING',
  'MOVING',
  'HANDYMAN',
  'PAINTING',
  'OTHER',
] as const

export type JobCategory = (typeof JOB_CATEGORIES)[number]

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

// Validation error payload: field -> message map
export interface ApiErrorResponse {
  errors: Record<string, string>
}

// Job-related request shapes
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
  version?: number
}

// Auth DTOs
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

// WebSocket event types
export type WsEventType = 'JOB_UPDATED'

export interface WsEvent {
  type: WsEventType
  payload: JobDto
}
