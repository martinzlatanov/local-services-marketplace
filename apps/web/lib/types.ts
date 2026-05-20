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
  ADMIN = 'ADMIN',
}

/** @deprecated — use GET /api/locations instead */
export const CITY_AREAS = [
  'Clapham, London',
  'Hackney, London',
  'Islington, London',
  'Brixton, London',
  'Shoreditch, London',
  'Camden, London',
  'Peckham, London',
  'Dalston, London',
  'Bethnal Green, London',
  'Stoke Newington, London',
] as const

/** @deprecated — use GET /api/categories instead */
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
  category: { id: number; name: string }
  description: string
  timeframe: string
  location: { id: number; name: string }
  clientId: string
  providerId: string | null
  createdAt: string
  updatedAt: string
  clientName?: string
  clientEmail?: string
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
  categoryId: number
  description: string
  timeframe: string
  locationId: number
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
  roles: Role[]
  status: string
  createdAt: string
}

export interface PublicUserDto {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  roles: Role[]
  createdAt: string
}

export interface AdminUserDto {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  roles: Role[]
  status: string
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
  job?: {
    id: number
    category: { id: number; name: string }
    description: string
    location: { id: number; name: string }
  }
}
