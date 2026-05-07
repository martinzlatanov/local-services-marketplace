import { render, screen, fireEvent } from '@testing-library/react'
import JobPostingForm from './JobPostingForm'

// Mock fetch
global.fetch = jest.fn()

describe('JobPostingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<JobPostingForm onSuccess={jest.fn()} />)

    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/timeframe/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city\/area/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /post job/i })).toBeInTheDocument()
  })

  it('submits form data to /api/jobs on submit', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: '1', status: 'PENDING' } }),
    })
    global.fetch = mockFetch

    render(<JobPostingForm onSuccess={jest.fn()} />)

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Fix leaking pipe' },
    })
    fireEvent.change(screen.getByLabelText(/timeframe/i), {
      target: { value: 'Within 2 days' },
    })
    fireEvent.change(screen.getByLabelText(/city\/area/i), {
      target: { value: 'Downtown' },
    })

    fireEvent.click(screen.getByRole('button', { name: /post job/i }))

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/jobs',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('displays success message and calls onSuccess on successful submission', async () => {
    const onSuccess = jest.fn()
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: '1', status: 'PENDING' } }),
    })
    global.fetch = mockFetch

    render(<JobPostingForm onSuccess={onSuccess} />)

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test job' },
    })
    fireEvent.click(screen.getByRole('button', { name: /post job/i }))

    expect(await screen.findByText(/job posted successfully/i)).toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('displays error message on failed submission', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ errors: { message: 'Failed to post job' } }),
    })
    global.fetch = mockFetch

    render(<JobPostingForm onSuccess={jest.fn()} />)

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test job' },
    })
    fireEvent.click(screen.getByRole('button', { name: /post job/i }))

    expect(await screen.findByText(/failed to post job/i)).toBeInTheDocument()
  })

  it('disables submit button while loading', () => {
    render(<JobPostingForm onSuccess={jest.fn()} />)

    const button = screen.getByRole('button', { name: /post job/i })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test' },
    })
    fireEvent.click(button)

    expect(button).toBeDisabled()
  })
})
