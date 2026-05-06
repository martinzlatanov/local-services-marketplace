# Test Plan: Phase 07 - Web Client — Job Posting & Dashboard

## Classification

### TDD (Unit Tests)
- `apps/web/components/dashboard/JobPostingForm.tsx`
  - Reason: Form component with validation, submission logic, and state management.
- `apps/web/components/dashboard/JobCard.tsx`
  - Reason: UI component that renders job details and status badges based on props.
- `apps/web/components/dashboard/JobDashboard.tsx`
  - Reason: Dashboard component that fetches data, renders a list of cards, and handles empty states.

### E2E (Browser Tests)
- `apps/web/app/dashboard/page.tsx`
  - Reason: Page component that integrates the form and dashboard, requiring browser interaction to verify the full flow (posting a job and seeing it appear).

### Skip
- None

## Test Scenarios

### Unit Tests

**`apps/web/components/dashboard/JobPostingForm.test.tsx`**
- Renders all form fields (category, description, timeframe, cityArea).
- Submits form data to `/api/jobs` on submit.
- Displays success message and calls `onSuccess` callback on successful submission.
- Displays error message on failed submission.
- Disables submit button while loading.

**`apps/web/components/dashboard/JobCard.test.tsx`**
- Renders job details (category, description, timeframe, cityArea).
- Renders correct status badge based on job status (PENDING, ACCEPTED, IN_PROGRESS, COMPLETED).

**`apps/web/components/dashboard/JobDashboard.test.tsx`**
- Renders a list of `JobCard` components when jobs are provided.
- Renders empty state message when no jobs are provided.

### E2E Tests

**`apps/web/app/dashboard/page.e2e.ts`**
- Scenario: Client posts a new job and sees it appear on the dashboard.
  - Action: Fill out the job posting form and submit.
  - Expected: Form clears, success message appears, and the new job is visible in the dashboard list with status PENDING.

## Test Commands
- Unit: `npm test` (needs to be configured in `apps/web/package.json`)
- E2E: `npx playwright test` (needs to be configured)
