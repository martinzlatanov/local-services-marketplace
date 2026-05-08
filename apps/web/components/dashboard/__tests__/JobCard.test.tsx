import { render, screen } from '@testing-library/react'
import JobCard from '../JobCard'
import { JobStatus, type JobDto } from '@/lib/types'

describe('JobCard', () => {
  const mockJob: JobDto = {
    id: '1',
    status: JobStatus.PENDING,
    version: 1,
    category: 'PLUMBING',
    description: 'Fix leaking pipe',
    timeframe: 'Within 2 days',
    cityArea: 'Downtown',
    clientId: 'client-1',
    providerId: null,
    createdAt: '2026-05-07T10:00:00Z',
    updatedAt: '2026-05-07T10:00:00Z',
  }

  it('renders job details', () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText('PLUMBING')).toBeInTheDocument()
    expect(screen.getByText('Fix leaking pipe')).toBeInTheDocument()
    expect(screen.getByText(/downtown.*within 2 days/i)).toBeInTheDocument()
  })

  it('renders correct status badge for PENDING', () => {
    render(<JobCard job={{ ...mockJob, status: JobStatus.PENDING }} />)
    expect(screen.getByText('PENDING')).toBeInTheDocument()
  })

  it('renders correct status badge for ACCEPTED', () => {
    render(<JobCard job={{ ...mockJob, status: JobStatus.ACCEPTED }} />)
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument()
  })

  it('renders correct status badge for IN_PROGRESS', () => {
    render(<JobCard job={{ ...mockJob, status: JobStatus.IN_PROGRESS }} />)
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument()
  })

  it('renders correct status badge for COMPLETED', () => {
    render(<JobCard job={{ ...mockJob, status: JobStatus.COMPLETED }} />)
    expect(screen.getByText('COMPLETED')).toBeInTheDocument()
  })

  it('displays creation date', () => {
    render(<JobCard job={mockJob} />)
    expect(screen.getByText(/created:/i)).toBeInTheDocument()
  })
})
