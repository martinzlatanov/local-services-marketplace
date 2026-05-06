---
phase: 06-real-time-infrastructure
plan: 02
type: execute
completed: 2026-05-06
tasks_completed: 3
deviations: []
decisions: []
---

# Summary: Phase 06 - Plan 02

## Objective
Wire state transition logic to broadcast events on every job status change; implement client-side subscription in Next.js dashboard (context or hook); verify PENDING→ACCEPTED, ACCEPTED→IN_PROGRESS, IN_PROGRESS→COMPLETED all arrive in real time.

## Tasks Completed

### Task 1: Broadcast events on job acceptance
- Updated `apps/web/app/api/jobs/[id]/accept/route.ts` to broadcast `JOB_UPDATED` event
- Imported `broadcastToUser` from `apps/web/lib/ws/server.ts`
- Called `broadcastToUser` with client ID and updated job data after successful acceptance

### Task 2: Broadcast events on job status updates
- Created `apps/web/app/api/jobs/[id]/status/route.ts` to handle provider status updates
- Implemented route handler to update job status in database, ensuring provider owns the job
- Imported `broadcastToUser` from `apps/web/lib/ws/server.ts`
- Called `broadcastToUser` with client ID and updated job data after successful status update

### Task 3: Implement client-side WebSocket subscription
- Updated `apps/web/components/dashboard/JobDashboard.tsx` to connect to WebSocket server
- Used `useEffect` hook to establish WebSocket connection on mount
- Handled incoming `JOB_UPDATED` events by updating local state with new job data
- Implemented reconnection logic to refetch current job state from API
- Ensured WebSocket connection is closed on component unmount

## Files Created/Modified
- `apps/web/app/api/jobs/[id]/accept/route.ts` (modified)
- `apps/web/app/api/jobs/[id]/status/route.ts` (created)
- `apps/web/components/dashboard/JobDashboard.tsx` (modified)

## Verification Results
- `npm run typecheck` passes
- `grep -c "broadcastToUser" apps/web/app/api/jobs/\[id\]/accept/route.ts` returns > 0
- `grep -c "broadcastToUser" apps/web/app/api/jobs/\[id\]/status/route.ts` returns > 0
- `grep -c "new WebSocket" apps/web/components/dashboard/JobDashboard.tsx` returns > 0

## Self-Check: PASSED
All acceptance criteria met. All verification commands passed.
