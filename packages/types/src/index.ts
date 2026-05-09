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
  version?: number
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

// Review types for Phase 11 Ratings & Reviews
export type ClientRatingCategory = 'communication' | 'quality' | 'punctuality'
export type ProviderRatingCategory = 'paymentReliability' | 'communicationClarity' | 'professionalism'
export type ReviewStatus = 'pending' | 'approved'

export interface ClientRatings {
  communication: number
  quality: number
  punctuality: number
}

export interface ProviderRatings {
  paymentReliability: number
  communicationClarity: number
  professionalism: number
}

export interface ReviewDTO {
  id: number
  jobId: number
  reviewerId: number
  revieweeId: number
  reviewType: 'client' | 'provider'
  clientCommunication?: number
  clientQuality?: number
  clientPunctuality?: number
  providerPaymentReliability?: number
  providerCommunicationClarity?: number
  providerProfessionalism?: number
  text: string
  photoUrl?: string | null
  approvedAt?: string | null
  createdAt: string
  updatedAt: string
}
