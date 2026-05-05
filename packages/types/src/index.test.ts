// TDD: type-level tests for packages/types/src/index.ts exports (D-08)

import {
  JobStatus,
  Role,
  JobDto,
  ApiSuccessResponse,
  ApiErrorResponse,
  CreateJobRequest,
  AcceptJobRequest,
  UpdateJobStatusRequest,
  AuthRegisterRequest,
  AuthLoginRequest,
  AuthUserDto,
} from './index'

// Verify enum string values at type level via assignability
const _pending: 'PENDING' = JobStatus.PENDING
const _accepted: 'ACCEPTED' = JobStatus.ACCEPTED
const _inProgress: 'IN_PROGRESS' = JobStatus.IN_PROGRESS
const _completed: 'COMPLETED' = JobStatus.COMPLETED

const _client: 'CLIENT' = Role.CLIENT
const _provider: 'PROVIDER' = Role.PROVIDER

// Verify interface shapes compile
const _job: JobDto = {
  id: 'test-id',
  status: JobStatus.PENDING,
  version: 1,
  category: 'plumbing',
  description: 'fix leak',
  timeframe: '2h',
  cityArea: 'downtown',
  clientId: 'client-1',
  providerId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const _success: ApiSuccessResponse<JobDto> = { data: _job }
const _error: ApiErrorResponse = { errors: { email: 'required' } }

const _create: CreateJobRequest = {
  category: 'plumbing',
  description: 'fix leak',
  timeframe: '2h',
  cityArea: 'downtown',
}

const _accept: AcceptJobRequest = { version: 1 }
const _updateStatus: UpdateJobStatusRequest = { status: JobStatus.ACCEPTED }

// Auth DTO checks
const _registerReq: AuthRegisterRequest = { email: 'a@b.com', password: 'secret', role: Role.CLIENT }
const _loginReq: AuthLoginRequest = { email: 'a@b.com', password: 'secret' }
const _user: AuthUserDto = { id: 'u1', email: 'a@b.com', role: Role.CLIENT, createdAt: new Date().toISOString() }

// Suppress unused variable warnings
void _pending; void _accepted; void _inProgress; void _completed
void _client; void _provider
void _job; void _success; void _error; void _create; void _accept; void _updateStatus
void _registerReq; void _loginReq; void _user
