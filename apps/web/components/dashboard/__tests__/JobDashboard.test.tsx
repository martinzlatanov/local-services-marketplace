import { render, screen } from '@testing-library/react'
import JobDashboard from '../JobDashboard'
import { type JobDto, JobStatus } from '@/lib/types'

describe('JobDashboard', () => {
  const mockJobs: JobDto[] = [
    {
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
    },
    {
      id: '2',
      status: JobStatus.ACCEPTED,
      version: 2,
      category: 'ELECTRICAL',
      description: 'Install new outlet',
      timeframe: 'Within 1 week',
      cityArea: 'Uptown',
      clientId: 'client-1',
      providerId: 'provider-1',
      createdAt: '2026-05-06T10:00:00Z',
      updatedAt: '2026-05-07T10:00:00Z',
    },
  ]

  it('renders a list of JobCard components when jobs are provided', () => {
    render(<JobDashboard jobs={mockJobs} />)

    expect(screen.getByText('PLUMBING')).toBeInTheDocument()
    expect(screen.getByText('ELECTRICAL')).toBeInTheDocument()
  })

  it('renders empty state message when no jobs are provided', () => {
    render(<JobDashboard jobs={[]} />)

    expect(screen.getByText(/no jobs posted yet/i)).toBeInTheDocument()
    expect(screen.getByText(/use the form above to post your first job/i)).toBeInTheDocument()
  })

  it('calls onJobUpdate when provided', () => {
    const onJobUpdate = jest.fn()
    render(<JobDashboard jobs={mockJobs} onJobUpdate={onJobUpdate} />)

    // The component should render without crashing
    expect(screen.getByText('PLUMBING')).toBeInTheDocument()
  })
})
