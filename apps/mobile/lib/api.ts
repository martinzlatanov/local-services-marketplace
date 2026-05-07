import { API_BASE } from '../contexts/AuthContext'
import type { ApiErrorResponse, ApiSuccessResponse, JobDto } from '@local/types'

async function parseResponse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => null)) as ApiSuccessResponse<T> | ApiErrorResponse | null
  if (!res.ok) {
    throw { status: res.status, ...(data as ApiErrorResponse | null) }
  }
  return (data as ApiSuccessResponse<T>).data
}

export async function getJobs(token: string, cityArea: string): Promise<JobDto[]> {
  const res = await fetch(`${API_BASE}/api/jobs?cityArea=${encodeURIComponent(cityArea)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return parseResponse<JobDto[]>(res)
}

export async function getJob(token: string, id: string): Promise<JobDto> {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return parseResponse<JobDto>(res)
}

export async function acceptJob(token: string, id: string, version: number): Promise<JobDto> {
  const res = await fetch(`${API_BASE}/api/jobs/${id}/accept`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ version }),
  })
  return parseResponse<JobDto>(res)
}

export async function getMyJobs(token: string): Promise<JobDto[]> {
  const res = await fetch(`${API_BASE}/api/jobs/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return parseResponse<JobDto[]>(res)
}

export async function updateJobStatus(token: string, id: string, status: string): Promise<JobDto> {
  const res = await fetch(`${API_BASE}/api/jobs/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  return parseResponse<JobDto>(res)
}
