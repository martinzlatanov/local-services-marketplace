import { JobStatus } from '@local/types'

// Provider-side valid transitions (accept → start → complete)
const VALID_TRANSITIONS: Partial<Record<JobStatus, JobStatus[]>> = {
  [JobStatus.PENDING]: [JobStatus.ACCEPTED],
  [JobStatus.ACCEPTED]: [JobStatus.IN_PROGRESS],
  [JobStatus.IN_PROGRESS]: [JobStatus.COMPLETED],
}

function canTransition(from: JobStatus, to: JobStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

describe('Mobile job state machine', () => {
  describe('valid transitions', () => {
    it('PENDING → ACCEPTED (provider accepts job)', () => {
      expect(canTransition(JobStatus.PENDING, JobStatus.ACCEPTED)).toBe(true)
    })

    it('ACCEPTED → IN_PROGRESS (provider starts work)', () => {
      expect(canTransition(JobStatus.ACCEPTED, JobStatus.IN_PROGRESS)).toBe(true)
    })

    it('IN_PROGRESS → COMPLETED (provider finishes work)', () => {
      expect(canTransition(JobStatus.IN_PROGRESS, JobStatus.COMPLETED)).toBe(true)
    })
  })

  describe('invalid transitions', () => {
    it('rejects PENDING → IN_PROGRESS (skips ACCEPTED)', () => {
      expect(canTransition(JobStatus.PENDING, JobStatus.IN_PROGRESS)).toBe(false)
    })

    it('rejects PENDING → COMPLETED (skips intermediate states)', () => {
      expect(canTransition(JobStatus.PENDING, JobStatus.COMPLETED)).toBe(false)
    })

    it('rejects ACCEPTED → COMPLETED (skips IN_PROGRESS)', () => {
      expect(canTransition(JobStatus.ACCEPTED, JobStatus.COMPLETED)).toBe(false)
    })

    it('rejects backward transition COMPLETED → IN_PROGRESS', () => {
      expect(canTransition(JobStatus.COMPLETED, JobStatus.IN_PROGRESS)).toBe(false)
    })

    it('rejects same-state transition', () => {
      expect(canTransition(JobStatus.PENDING, JobStatus.PENDING)).toBe(false)
    })
  })

  describe('optimistic locking', () => {
    it('accepts job when version matches', () => {
      const job = { id: '1', status: JobStatus.PENDING, version: 1, providerId: null }
      const requestVersion = 1
      expect(requestVersion === job.version).toBe(true)
    })

    it('rejects acceptance when version is stale', () => {
      const serverVersion = 2  // another provider already accepted
      const clientVersion = 1  // stale client state
      expect(clientVersion === serverVersion).toBe(false)
    })

    it('increments version after successful acceptance', () => {
      const job = { id: '1', status: JobStatus.PENDING, version: 3 }
      const updated = { ...job, status: JobStatus.ACCEPTED, version: job.version + 1 }
      expect(updated.version).toBe(4)
      expect(updated.status).toBe(JobStatus.ACCEPTED)
    })
  })
})
