import { JobStatus } from '@local/types'

export default function HomePage() {
  const initialStatus: JobStatus = JobStatus.PENDING
  return (
    <main>
      <h1>Local Services Marketplace</h1>
      <p data-testid="status">Default status: {initialStatus}</p>
    </main>
  )
}
