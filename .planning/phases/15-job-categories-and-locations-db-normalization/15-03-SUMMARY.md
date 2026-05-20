---
phase: 15-job-categories-and-locations-db-normalization
plan: "03"
subsystem: types-and-consumers
tags:
  - normalization
  - breaking-change
  - types
  - api
  - web
  - mobile
dependency_graph:
  requires:
    - "15-01 (schema migration — jobs.categoryId and jobs.locationId FK columns)"
    - "15-02 (GET /api/categories and GET /api/locations endpoints)"
  provides:
    - "Normalized JobDto shape used by all web and mobile consumers"
    - "POST /api/jobs accepting integer IDs"
  affects:
    - "All components rendering job.category and job.location"
    - "All test fixtures using JobDto"
tech_stack:
  added: []
  patterns:
    - "DTO normalization: string fields replaced by {id, name} objects"
    - "Integer FK submission replacing string name lookup at POST time"
key_files:
  created: []
  modified:
    - packages/types/src/index.ts
    - apps/web/lib/types.ts
    - apps/web/lib/db/job-query.ts
    - apps/web/app/api/jobs/route.ts
    - apps/web/app/api/jobs/[id]/route.ts
    - apps/web/app/api/jobs/[id]/accept/route.ts
    - apps/web/components/ReviewDisplay.tsx
    - apps/web/components/dashboard/JobPostingForm.tsx
    - apps/web/components/dashboard/JobCard.tsx
    - apps/web/components/dashboard/JobDetailCard.tsx
    - apps/web/components/dashboard/ActiveJobCard.tsx
    - apps/web/components/dashboard/ProviderDashboard.tsx
    - apps/web/components/dashboard/__tests__/JobCard.test.tsx
    - apps/web/components/dashboard/__tests__/JobDetailCard.test.tsx
    - apps/web/components/dashboard/__tests__/JobDashboard.test.tsx
    - apps/web/components/dashboard/__tests__/JobDetailCard.identity.test.tsx
    - apps/web/app/browse/page.tsx
    - apps/web/app/providers/[id]/page.tsx
    - apps/web/__tests__/job-acceptance.integration.test.ts
    - apps/mobile/app/(app)/(tabs)/feed.tsx
    - apps/mobile/app/(app)/jobs/[id].tsx
decisions:
  - "GET /api/jobs cityArea query param renamed to location (name-based filter) to eliminate all cityArea references in lockstep with client rename"
  - "CITY_AREAS and JOB_CATEGORIES constants deprecated with JSDoc rather than removed — runtime consumers exist in mobile (onboarding.tsx, settings.tsx) which are out of scope for this plan"
  - "clientName and clientEmail left on JobDto in apps/web/lib/types.ts — used by rowToJobDto for display; not in packages/types (asymmetry pre-exists)"
  - "ReviewDTO.job field never populated by the API server-side — type updated to match new shape; display reads are dead code paths until the API is updated to join job data"
  - "providers/[id]/page.tsx updated as deviation (not in plan file list) — it contained job.category and job.cityArea references that would break TS"
  - "apps/web/__tests__/job-acceptance.integration.test.ts updated as deviation — contained cityArea in mock data violating acceptance criteria"
metrics:
  duration_seconds: 499
  completed_date: "2026-05-20"
  tasks_completed: 4
  files_modified: 21
---

# Phase 15 Plan 03: DTO Normalization — Types and All Consumers Summary

Coordinated breaking-change migration of `JobDto.category` (string→object), `JobDto.cityArea` (removed→`location` object), and `CreateJobRequest` (string fields→integer IDs) across all TypeScript layers.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Update shared types (packages/types, apps/web/lib/types, ReviewDTO) | 4cd454f |
| 2 | Update JOB_JOIN_SHAPE and rowToJobDto in job-query.ts | 14bea5a |
| 3 | Update POST /api/jobs — integer IDs, validation, remove string-to-ID lookups | bc40172 |
| 4 | Update all web/mobile consumers, test fixtures, integration test | a7c3727, 0f0ef25 |

## Files Modified

### Task 1 — Shared Types
- **packages/types/src/index.ts**: `JobDto.category: {id,name}`, `JobDto.location: {id,name}`, `CreateJobRequest.categoryId/locationId: number`; CITY_AREAS and JOB_CATEGORIES marked `@deprecated`
- **apps/web/lib/types.ts**: Identical changes plus `ReviewDTO.job.cityArea→location: {id,name}` and `ReviewDTO.job.category: {id,name}`

### Task 2 — Query Layer
- **apps/web/lib/db/job-query.ts**: `JOB_JOIN_SHAPE` selects `categoryId`, `categoryName`, `locationId`, `locationName`; `rowToJobDto` returns `category: {id,name}` and `location: {id,name}` objects

### Task 3 — POST /api/jobs
- **apps/web/app/api/jobs/route.ts**: POST validates `categoryId`/`locationId` as positive integers (400 on invalid), inserts directly without string lookup, returns JOIN-resolved DTO via `buildJobQuery`; GET renames `cityArea` query param to `location`

### Task 4 — Consumers
- **apps/web/app/api/jobs/[id]/route.ts**: No changes needed (already clean)
- **apps/web/app/api/jobs/[id]/accept/route.ts**: No changes needed (already clean)
- **apps/web/components/ReviewDisplay.tsx**: `review.job.category.name` and `review.job.location.name`
- **apps/web/components/dashboard/JobPostingForm.tsx**: Fetches `{id,name}` pairs from API; stores IDs; submits `categoryId`/`locationId` integers
- **apps/web/components/dashboard/JobCard.tsx**: `job.category.name`, `job.location.name`, `categoryIcons[job.category.name]`
- **apps/web/components/dashboard/JobDetailCard.tsx**: `job.category.name`, `job.location.name`
- **apps/web/components/dashboard/ActiveJobCard.tsx**: `job.category.name`, `job.location.name`
- **apps/web/components/dashboard/ProviderDashboard.tsx**: `location` query param instead of `cityArea`
- **apps/web/app/browse/page.tsx**: `location` query param; `job.category.name`; `job.location.name`
- **apps/web/app/providers/[id]/page.tsx** *(deviation)*: `job.category.name`, `job.location.name`
- **Test fixtures**: All four `__tests__/` files updated to `category: {id,name}` and `location: {id,name}` objects
- **apps/web/__tests__/job-acceptance.integration.test.ts** *(deviation)*: Mock data updated to `{id,name}` objects
- **apps/mobile/app/(app)/(tabs)/feed.tsx**: `item.category.name` for filter chip comparison and display; `item.location.name` for meta line
- **apps/mobile/app/(app)/jobs/[id].tsx**: `job.category.name`, `job.location.name`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Fix] Updated providers/[id]/page.tsx**
- **Found during:** Task 4 acceptance grep
- **Issue:** `job.category` (string access) and `job.cityArea` at lines 181, 190 — not in the plan's file list but would cause TS type errors and render failures
- **Fix:** Changed to `job.category.name` and `job.location.name`
- **Files modified:** `apps/web/app/providers/[id]/page.tsx`
- **Commit:** a7c3727

**2. [Rule 1 - Bug] Updated integration test mock data**
- **Found during:** Task 4 final acceptance grep
- **Issue:** `apps/web/__tests__/job-acceptance.integration.test.ts` contained `cityArea` in mock objects and filter comparisons, violating the acceptance criterion of zero `cityArea` references in `apps/web`
- **Fix:** Mock objects updated to `{id,name}` shape; filter comparisons use `.name` property
- **Files modified:** `apps/web/__tests__/job-acceptance.integration.test.ts`
- **Commit:** 0f0ef25

## CITY_AREAS / JOB_CATEGORIES Constants

Both constants are retained with `@deprecated` JSDoc in both type files. Runtime consumers found:
- `apps/mobile/app/(app)/onboarding.tsx` — radio button list for service area selection (imports from `@local/types`)
- `apps/mobile/app/(app)/(tabs)/settings.tsx` — area picker modal (imports from `@local/types`)
- `apps/web/app/providers/page.tsx` — imports `CITY_AREAS` from `@/lib/types`
- `apps/web/app/page.tsx` — imports `JOB_CATEGORIES` from `@/lib/types` (marketing display)

These consumers are outside the scope of this plan. The `@deprecated` annotation signals that future plans should migrate them to use the API endpoints.

## ReviewDTO.job — API Verification

The `/api/reviews` route never populates the `job` field on `ReviewDTO`. The nested `job?` field is a type-only definition; the `review.job.category.name` and `review.job.location.name` accesses in `ReviewDisplay.tsx` are dead code paths until the reviews API is updated to JOIN job data. No server-side change required for this plan.

## Known Stubs

None — all data flows are wired to live API endpoints.

## Threat Flags

No new network endpoints, auth paths, or trust boundaries introduced. The T-15-03-01 and T-15-03-02 mitigations from the plan's threat model are implemented: `categoryId` and `locationId` are validated as positive integers at POST /api/jobs entry, and DB FK constraints provide secondary defense.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| SUMMARY.md exists | FOUND |
| Commit 4cd454f (Task 1 — types) | FOUND |
| Commit 14bea5a (Task 2 — job-query) | FOUND |
| Commit bc40172 (Task 3 — POST /api/jobs) | FOUND |
| Commit a7c3727 (Task 4 — consumers) | FOUND |
| Commit 0f0ef25 (Task 4 deviation — integration test) | FOUND |
| Zero cityArea in apps/web | VERIFIED |
| Zero cityArea in apps/mobile | VERIFIED |
| Zero cityArea in packages/types | VERIFIED |
