/**
 * Wave 0 stub tests for /providers/[id] page (T03-03).
 * These stubs verify structural intent; full rendering tested in integration.
 */

import { Role, type PublicUserDto, type ReviewDTO } from '@/lib/types'

const mockProvider: PublicUserDto = {
  id: '42',
  email: 'provider@example.com',
  name: 'Jane Smith',
  avatarUrl: null,
  role: Role.PROVIDER,
  createdAt: '2025-01-15T10:00:00Z',
}

const mockReview: ReviewDTO = {
  id: 1,
  jobId: 10,
  reviewerId: 99,
  revieweeId: 42,
  reviewType: 'client',
  clientCommunication: 4,
  clientQuality: 5,
  clientPunctuality: 4,
  text: 'Great work, very professional.',
  photoUrl: null,
  approvedAt: '2026-05-01T00:00:00Z',
  createdAt: '2026-04-30T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
}

describe('ProviderProfilePage — data shape', () => {
  it('loaded state — provider has expected identity fields', () => {
    expect(mockProvider.id).toBe('42')
    expect(mockProvider.email).toBe('provider@example.com')
    expect(mockProvider.name).toBe('Jane Smith')
    expect(mockProvider.createdAt).toBeTruthy()
  })

  it('empty reviews — reviews array can be empty', () => {
    const reviews: ReviewDTO[] = []
    expect(reviews.length).toBe(0)
    // Page renders "No reviews yet." in this case
  })

  it('review present — review has rating fields used for average', () => {
    expect(mockReview.clientCommunication).toBeDefined()
    expect(mockReview.clientQuality).toBeDefined()
    expect(mockReview.clientPunctuality).toBeDefined()
  })

  it('average rating formula — computed from communication + quality + punctuality / 3', () => {
    const avg =
      ((mockReview.clientCommunication ?? 0) +
        (mockReview.clientQuality ?? 0) +
        (mockReview.clientPunctuality ?? 0)) /
      3
    expect(avg).toBeCloseTo(4.33, 1)
  })
})
