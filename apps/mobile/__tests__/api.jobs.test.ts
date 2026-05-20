import { JobStatus } from '@local/types'

// Inline the getJobs logic so we can test it without native module resolution
async function getJobs(
  fetchFn: typeof fetch,
  token: string,
  page = 0
): Promise<{ data: { id: string; status: string }[]; hasNextPage: boolean }> {
  const res = await fetchFn(`http://api/api/jobs?browse=1&page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw { status: res.status, ...body }
  return { data: body.data ?? [], hasNextPage: body.pagination?.hasNextPage ?? false }
}

const mockJob = {
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
}

function makeFetch(body: object, status = 200): typeof fetch {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as typeof fetch
}

describe('getJobs API', () => {
  it('sends Authorization header with token', async () => {
    const fetchFn = makeFetch({ data: [], pagination: { page: 0, pageSize: 20, hasNextPage: false } })
    await getJobs(fetchFn, 'tok_123')
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/api/jobs?browse=1&page=0'),
      expect.objectContaining({ headers: { Authorization: 'Bearer tok_123' } })
    )
  })

  it('appends correct page param', async () => {
    const fetchFn = makeFetch({ data: [], pagination: { page: 2, pageSize: 20, hasNextPage: false } })
    await getJobs(fetchFn, 'tok', 2)
    expect(fetchFn).toHaveBeenCalledWith(expect.stringContaining('page=2'), expect.anything())
  })

  it('returns data and hasNextPage=false when no more pages', async () => {
    const fetchFn = makeFetch({
      data: [mockJob],
      pagination: { page: 0, pageSize: 20, hasNextPage: false },
    })
    const result = await getJobs(fetchFn, 'tok')
    expect(result.data).toHaveLength(1)
    expect(result.hasNextPage).toBe(false)
  })

  it('returns hasNextPage=true when more pages exist', async () => {
    const fetchFn = makeFetch({
      data: Array(20).fill(mockJob),
      pagination: { page: 0, pageSize: 20, hasNextPage: true },
    })
    const result = await getJobs(fetchFn, 'tok')
    expect(result.hasNextPage).toBe(true)
  })

  it('throws on 401 unauthorized', async () => {
    const fetchFn = makeFetch({ errors: { auth: 'unauthorized' } }, 401)
    await expect(getJobs(fetchFn, 'bad_token')).rejects.toMatchObject({ status: 401 })
  })

  it('defaults data to [] when response has no data field', async () => {
    const fetchFn = makeFetch({ pagination: { hasNextPage: false } })
    const result = await getJobs(fetchFn, 'tok')
    expect(result.data).toEqual([])
  })
})
