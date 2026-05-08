import { render, screen } from '@testing-library/react'
import JobDetailCard from '../JobDetailCard'
import { JobStatus, Role, type JobDto } from '@/lib/types'

describe('JobDetailCard', () => {
  const mockJob: JobDto = {
    id: '1',
    status: JobStatus.PENDING,
    version: 1,
    category: 'PLUMBING',
    description: 'Fix leaking pipe',
    timeframe: 'Within 2 days',
    cityArea: 'Clapham, London',
    clientId: 'client-1',
    providerId: null,
    createdAt: '2026-05-07T10:00:00Z',
    updatedAt: '2026-05-07T10:00:00Z',
  }

  describe('Client view', () => {
    it('displays job details for client', () => {
      render(<JobDetailCard job={mockJob} userRole={Role.CLIENT} />)

      expect(screen.getByText('PLUMBING')).toBeInTheDocument()
      expect(screen.getByText('Fix leaking pipe')).toBeInTheDocument()
      expect(screen.getByText('Clapham, London')).toBeInTheDocument()
    })

    it('shows PENDING status', () => {
      render(<JobDetailCard job={mockJob} userRole={Role.CLIENT} />)

      expect(screen.getByText('Pending')).toBeInTheDocument()
      // PENDING jobs don't show provider messaging
    })

    it('shows ACCEPTED status with provider assignment message', () => {
      const acceptedJob: JobDto = {
        ...mockJob,
        status: JobStatus.ACCEPTED,
        providerId: 'provider-1',
      }

      render(<JobDetailCard job={acceptedJob} userRole={Role.CLIENT} />)

      expect(screen.getByText('Accepted')).toBeInTheDocument()
      expect(screen.getByText('Provider Assigned')).toBeInTheDocument()
      expect(
        screen.getByText(/service professional has accepted your job/i)
      ).toBeInTheDocument()
    })

    it('shows IN_PROGRESS status with work message', () => {
      const inProgressJob: JobDto = {
        ...mockJob,
        status: JobStatus.IN_PROGRESS,
        providerId: 'provider-1',
      }

      render(<JobDetailCard job={inProgressJob} userRole={Role.CLIENT} />)

      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Work in Progress')).toBeInTheDocument()
      expect(
        screen.getByText(/service professional is currently working/i)
      ).toBeInTheDocument()
    })

    it('shows COMPLETED status with review suggestion', () => {
      const completedJob: JobDto = {
        ...mockJob,
        status: JobStatus.COMPLETED,
        providerId: 'provider-1',
      }

      render(<JobDetailCard job={completedJob} userRole={Role.CLIENT} />)

      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Job Complete')).toBeInTheDocument()
      expect(screen.getByText(/consider leaving a review/i)).toBeInTheDocument()
    })

    it('does not show provider info for PENDING jobs', () => {
      render(<JobDetailCard job={mockJob} userRole={Role.CLIENT} />)

      expect(screen.queryByText('Provider Assigned')).not.toBeInTheDocument()
    })
  })

  describe('Provider view', () => {
    it('displays job details for provider', () => {
      render(<JobDetailCard job={mockJob} userRole={Role.PROVIDER} />)

      expect(screen.getByText('PLUMBING')).toBeInTheDocument()
      expect(screen.getByText('Fix leaking pipe')).toBeInTheDocument()
    })

    it('does not show provider-specific messages for provider role', () => {
      const acceptedJob: JobDto = {
        ...mockJob,
        status: JobStatus.ACCEPTED,
        providerId: 'provider-1',
      }

      render(<JobDetailCard job={acceptedJob} userRole={Role.PROVIDER} />)

      expect(screen.queryByText('Provider Assigned')).not.toBeInTheDocument()
    })
  })

  describe('Visual indicators', () => {
    it('displays creation date', () => {
      render(<JobDetailCard job={mockJob} userRole={Role.CLIENT} />)

      expect(screen.getByText(/posted/i)).toBeInTheDocument()
    })

    it('shows all job details (timeframe and location)', () => {
      render(<JobDetailCard job={mockJob} userRole={Role.CLIENT} />)

      expect(screen.getByText('Within 2 days')).toBeInTheDocument()
      expect(screen.getByText('Clapham, London')).toBeInTheDocument()
    })
  })
})
