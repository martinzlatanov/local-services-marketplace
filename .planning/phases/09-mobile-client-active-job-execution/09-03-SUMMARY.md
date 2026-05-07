---
phase: 09-mobile-client-active-job-execution
plan: 03
subsystem: mobile, ui
tags: [mobile, ui, job lifecycle, status transitions]

# Dependency graph
requires:
  - phase: 09-01
    provides: updateJobStatus API helper
  - phase: 09-02
    provides: Active Jobs tab for navigation
provides:
  - Job detail screen with status-conditional CTAs
  - Complete job lifecycle transitions from mobile
affects: [provider job execution workflow]

# Tech tracking
tech-stack:
  added: []
  patterns: [Status-conditional rendering, job lifecycle management]

key-files:
  modified: [apps/mobile/app/(app)/jobs/[id].tsx]

key-decisions:
  - "Conditional button rendering based on job.status (PENDING/ACCEPTED/IN_PROGRESS)"
  - "Reuse router.back() pattern from Phase 8 for post-action navigation"

patterns-established:
  - "Status-conditional CTA pattern: render different buttons based on current job status"
  - "Job lifecycle transitions: ACCEPTED→IN_PROGRESS (Start Work), IN_PROGRESS→COMPLETED (Finish Work)"

requirements-completed: [LIFECYCLE-01, LIFECYCLE-02]

# Metrics
duration: 5min
completed: 2026-05-07
---

# Phase 09 Plan 03: Detail Screen with Status-Conditional CTAs Summary

**Job detail screen with lifecycle transition buttons based on current status**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-07T05:47:00Z
- **Completed:** 2026-05-07T05:52:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Extended job detail screen with status-conditional CTAs
- PENDING jobs show "Accept job" button (Phase 8 unchanged)
- ACCEPTED jobs show "Start Work" button (transitions to IN_PROGRESS)
- IN_PROGRESS jobs show "Finish Work" button (transitions to COMPLETED)
- All transitions use updateJobStatus helper and navigate back on success
- Error snackbar displayed on transition failures

## Task Commits

1. **Task 1: Add status-conditional button rendering to detail screen** - `f1e2b82` (feat)
2. **Task 2: Add handleStartWork and handleFinishWork handlers** - `f1e2b82` (feat)

**Plan metadata:** `f1e2b82` (docs: complete plan)

## Files Created/Modified

- `apps/mobile/app/(app)/jobs/[id].tsx` - Added conditional rendering, handleStartWork, handleFinishWork

## Decisions Made

- Conditional button rendering based on job.status (PENDING/ACCEPTED/IN_PROGRESS)
- Reuse router.back() pattern from Phase 8 for post-action navigation
- Keep existing "Accept job" flow unchanged for PENDING status

## Deviations from Plan

None - plan executed exactly as written
