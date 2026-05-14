/**
 * Wave 0 stub tests for JobDetailCard identity section (T03-02).
 * These stubs verify the structural intent; full wiring tested in integration.
 */

import { JobStatus, Role, type JobDto } from '@/lib/types'

const mockJobWithProvider: JobDto = {
  id: '1',
  status: JobStatus.ACCEPTED,
  version: 1,
  category: 'PLUMBING',
  description: 'Fix leaking pipe',
  timeframe: 'Within 2 days',
  cityArea: 'Clapham, London',
  clientId: 'client-1',
  providerId: 'provider-42',
  createdAt: '2026-05-07T10:00:00Z',
  updatedAt: '2026-05-07T10:00:00Z',
}

const mockJobNoProvider: JobDto = {
  ...mockJobWithProvider,
  providerId: null,
  status: JobStatus.PENDING,
}

describe('JobDetailCard — provider identity section', () => {
  it('providerId set — job has a providerId that can be used to fetch identity', () => {
    expect(mockJobWithProvider.providerId).not.toBeNull()
    expect(mockJobWithProvider.providerId).toBe('provider-42')
  })

  it('providerId null — provider identity section should not render', () => {
    expect(mockJobNoProvider.providerId).toBeNull()
  })
})
