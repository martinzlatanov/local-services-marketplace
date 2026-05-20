---
phase: 15-job-categories-and-locations-db-normalization
plan: "02"
subsystem: backend-api
tags: [lookup-endpoints, categories, locations, drizzle]
dependency_graph:
  requires: []
  provides: [GET /api/categories, GET /api/locations]
  affects: [apps/web/app/browse/page.tsx]
tech_stack:
  added: []
  patterns: [drizzle-select-specific-columns, bare-array-response]
key_files:
  created: []
  modified:
    - apps/web/app/api/categories/route.ts
    - apps/web/app/api/locations/route.ts
    - apps/web/app/browse/page.tsx
decisions:
  - Return bare array (no wrapper object) for lookup endpoints to keep client code minimal
metrics:
  duration: ~5 min
  completed: "2026-05-20T18:35:42Z"
---

# Phase 15 Plan 02: Lookup API Endpoints Summary

**One-liner:** Two read-only lookup endpoints querying job_categories and locations tables via Drizzle, returning bare id+name arrays ordered by name.

## What Was Built

- `GET /api/categories` — queries `job_categories` table, returns `{ id, name }[]` ordered by name ascending
- `GET /api/locations` — queries `locations` table, returns `{ id, name }[]` ordered by name ascending
- Both endpoints are unauthenticated, use try/catch with 500 fallback, and return the array directly with no wrapper

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated browse page consumer for bare-array response shape**
- **Found during:** Task 1 (when checking existing file content before overwriting)
- **Issue:** `apps/web/app/browse/page.tsx` consumed `/api/categories` and `/api/locations` using `d.data` accessor, expecting `{ data: [] }` wrapper. Changing to bare array without updating the consumer would silently break the dropdown population.
- **Fix:** Updated both `.then()` handlers in browse page to use `Array.isArray(d)` guard instead of `d.data` check.
- **Files modified:** `apps/web/app/browse/page.tsx`
- **Commit:** 3935c10

## Known Stubs

None.

## Threat Flags

None — lookup endpoints return public read-only data with no auth requirement, no write surface, and no sensitive fields exposed.

## Self-Check: PASSED

- `apps/web/app/api/categories/route.ts` — exists, exports GET, selects id+name, uses asc(), returns bare array
- `apps/web/app/api/locations/route.ts` — exists, exports GET, selects id+name, uses asc(), returns bare array
- Commits: 621df0a (categories), 00c900d (locations), 3935c10 (browse fix)
