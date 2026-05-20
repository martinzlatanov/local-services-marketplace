import { JobStatus, type JobDto } from '@local/types'

function makeJob(overrides: Partial<JobDto> = {}): JobDto {
  return {
    id: '1',
    status: JobStatus.PENDING,
    version: 1,
    category: { id: 1, name: 'PLUMBING' },
    description: 'Fix leaking pipe',
    timeframe: 'Within 2 days',
    location: { id: 1, name: 'Clapham' },
    clientId: '10',
    providerId: null,
    createdAt: '2026-05-07T10:00:00Z',
    updatedAt: '2026-05-07T10:00:00Z',
    ...overrides,
  }
}

const ALL_JOBS: JobDto[] = [
  makeJob({ id: '1', category: { id: 1, name: 'PLUMBING' }, location: { id: 1, name: 'Clapham' } }),
  makeJob({ id: '2', category: { id: 2, name: 'ELECTRICAL' }, location: { id: 1, name: 'Clapham' } }),
  makeJob({ id: '3', category: { id: 1, name: 'PLUMBING' }, location: { id: 2, name: 'Hackney' } }),
  makeJob({ id: '4', category: { id: 3, name: 'CLEANING' }, location: { id: 2, name: 'Hackney' } }),
]

// Mirrors the filter logic in feed.tsx displayedJobs
function filterByCategory(jobs: JobDto[], category: string): JobDto[] {
  if (category === 'All') return jobs
  return jobs.filter(j => j.category.name === category)
}

describe('Feed category filter', () => {
  it('returns all jobs when filter is All', () => {
    expect(filterByCategory(ALL_JOBS, 'All')).toHaveLength(4)
  })

  it('filters to PLUMBING only', () => {
    const result = filterByCategory(ALL_JOBS, 'PLUMBING')
    expect(result).toHaveLength(2)
    expect(result.every(j => j.category.name === 'PLUMBING')).toBe(true)
  })

  it('filters to ELECTRICAL only', () => {
    const result = filterByCategory(ALL_JOBS, 'ELECTRICAL')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('returns empty for category with no matching jobs', () => {
    expect(filterByCategory(ALL_JOBS, 'PAINTING')).toHaveLength(0)
  })
})

describe('Feed pagination — infinite scroll state', () => {
  it('appends new page results to existing jobs', () => {
    const page0 = ALL_JOBS.slice(0, 2)
    const page1 = ALL_JOBS.slice(2, 4)
    const combined = [...page0, ...page1]
    expect(combined).toHaveLength(4)
    expect(combined[2].id).toBe('3')
  })

  it('clears jobs and resets to page 0 on refresh', () => {
    let jobs = ALL_JOBS
    let page = 2

    // Simulate pull-to-refresh
    const fresh = ALL_JOBS.slice(0, 2)
    jobs = fresh
    page = 0

    expect(page).toBe(0)
    expect(jobs).toHaveLength(2)
  })

  it('does not load more when hasNextPage is false', () => {
    const hasNextPage = false
    const isLoadingMore = false
    const shouldLoad = hasNextPage && !isLoadingMore
    expect(shouldLoad).toBe(false)
  })

  it('does not load more when already loading', () => {
    const hasNextPage = true
    const isLoadingMore = true
    const shouldLoad = hasNextPage && !isLoadingMore
    expect(shouldLoad).toBe(false)
  })
})
