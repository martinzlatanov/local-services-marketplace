# Phase 07: Web Client — Job Posting & Dashboard - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning
**Source:** Automated analysis

<domain>
## Phase Boundary

This phase delivers the client-facing web UI for posting new jobs and viewing a dashboard of posted jobs with real-time status updates. It connects the Next.js frontend to the backend API and WebSocket infrastructure built in previous phases.
</domain>

<decisions>
## Implementation Decisions

### Job Posting Form
- **Category Selection:** Use a standard HTML `<select>` dropdown populated with the fixed `jobCategoryEnum` values from `packages/types`.
- **Description:** Use a standard `<textarea>` for the freeform description.
- **Timeframe:** Use a standard text input or date picker (keep it simple for v1).
- **City/Area:** Use a standard text input or dropdown (keep it simple for v1).
- **Submission:** On submit, call `POST /api/jobs`. On success, redirect to the dashboard or clear the form and show a success message.

### Dashboard Layout
- **Structure:** A simple list or grid of cards, each representing a posted job.
- **Job Card Content:** Display category, description, timeframe, city/area, and current status.
- **Status Display:** Use clear visual indicators (e.g., badges with different colors) for `PENDING`, `ACCEPTED`, `IN_PROGRESS`, and `COMPLETED`.

### Real-Time Integration
- **WebSocket Connection:** Use the `JobDashboard` component (created in Phase 6) or a similar pattern to establish the WebSocket connection on mount.
- **State Updates:** When a `JOB_UPDATED` event is received, update the local React state to reflect the new status immediately.

### the agent's Discretion
- Specific Tailwind utility classes for styling the form and dashboard.
- Error handling UI (e.g., toast notifications or inline error messages) for failed job postings.
- Loading states (e.g., spinners or skeletons) while fetching the initial job list.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value and constraints
- `.planning/REQUIREMENTS.md` — Detailed requirements (JOB-POST-04)

### Prior Phases
- `.planning/phases/04-backend-job-core-posting-state-machine/04-01-SUMMARY.md` — Job schema and categories
- `.planning/phases/04-backend-job-core-posting-state-machine/04-02-SUMMARY.md` — Job posting API
- `.planning/phases/06-real-time-infrastructure/06-01-SUMMARY.md` — WebSocket event types
- `.planning/phases/06-real-time-infrastructure/06-02-SUMMARY.md` — WebSocket client subscription pattern

</canonical_refs>

<specifics>
## Specific Ideas

- Reuse the `JobDashboard` component pattern from Phase 6 for the real-time updates.
- Ensure the form uses the exact category values defined in `packages/types`.

</specifics>

<deferred>
## Deferred Ideas

- Advanced filtering or sorting on the dashboard (keep it simple for v1).
- Complex date/time pickers for the timeframe (use a simple text input for now).

</deferred>

---

*Phase: 07-web-client-job-posting-dashboard*
*Context gathered: 2026-05-06 via automated analysis*
