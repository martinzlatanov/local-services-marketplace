---
phase: 04-backend-job-core-posting-state-machine
plan: 02
type: execute
completed: 2026-05-06
tasks_completed: 2
deviations: []
decisions: []
---

# Summary: Phase 04 - Plan 02

## Objective
Implement the job creation endpoint (POST /api/jobs) and state transition endpoint (PATCH /api/jobs/[id]). Enforce CLIENT role for creation and valid state machine transitions.

## Tasks Completed

### Task 1: Implement POST /api/jobs endpoint for job creation
- Created `apps/web/app/api/jobs/route.ts` with POST handler
- Added authentication check using `getAuthenticatedUser` helper
- Enforced CLIENT role (returns 403 if not CLIENT)
- Validated required fields (category, description, timeframe, cityArea)
- Validated category against JOB_CATEGORIES fixed list (returns 400 if invalid)
- Creates job with status PENDING and version 1
- Returns JobDto in ApiSuccessResponse format

### Task 2: Implement PATCH /api/jobs/[id] endpoint for state transitions
- Created `apps/web/app/api/jobs/[id]/route.ts` with PATCH handler
- Validates state transitions using VALID_TRANSITIONS map
- Returns HTTP 409 for invalid transitions
- Returns HTTP 404 if job not found
- Returns updated JobDto on successful transition
- Valid transitions: PENDING→ACCEPTED, ACCEPTED→IN_PROGRESS, IN_PROGRESS→COMPLETED

### Additional Work
- Added `getAuthenticatedUser` function to `apps/web/lib/auth.ts`
- Function extracts JWT from Authorization header or cookie
- Fetches user from database and returns AuthUserDto

## Files Created/Modified
- `apps/web/app/api/jobs/route.ts` (created) - POST endpoint for job creation
- `apps/web/app/api/jobs/[id]/route.ts` (created) - PATCH endpoint for state transitions
- `apps/web/lib/auth.ts` (modified) - Added getAuthenticatedUser function

## Verification Results
- `grep -c "export async function POST" apps/web/app/api/jobs/route.ts` → 1 ✅
- `grep -c "CLIENT" apps/web/app/api/jobs/route.ts` → 2 ✅
- `grep -c "JOB_CATEGORIES" apps/web/app/api/jobs/route.ts` → 2 ✅
- `grep -c "export async function PATCH" apps/web/app/api/jobs/[id]/route.ts` → 1 ✅
- `grep -c "VALID_TRANSITIONS" apps/web/app/api/jobs/[id]/route.ts` → 2 ✅
- `grep -c "409" apps/web/app/api/jobs/[id]/route.ts` → 1 ✅
- `grep -c "getAuthenticatedUser" apps/web/lib/auth.ts` → 1 ✅

## Self-Check: PASSED
All acceptance criteria met. All verification commands passed.
