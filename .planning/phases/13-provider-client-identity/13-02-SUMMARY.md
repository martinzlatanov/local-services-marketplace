---
phase: 13-provider-client-identity
plan: "02"
subsystem: api
tags: [nextjs, api-route, drizzle, auth, jest, typescript]

requires:
  - phase: 13
    plan: "01"
    provides: PublicUserDto in apps/web/lib/types.ts; name/avatarUrl columns live in DB

provides:
  - GET /api/users/[id] route returning PublicUserDto
  - Jest test suite for users API route (4 scenarios: 401, 400, 404, 200)

affects:
  - 13-03 (web identity section and provider profile page call this endpoint)
  - 13-04 (mobile getUser helper calls this endpoint)

tech-stack:
  added: []
  patterns:
    - "Auth-guarded API route following jobs/[id]/route.ts pattern"
    - "DTO projected field-by-field from DB row — never spread; passwordHash excluded"
    - "Jest mocks getAuthenticatedUser and db.client to enable unit testing without live DB"

key-files:
  created:
    - apps/web/app/api/users/[id]/route.ts
    - apps/web/app/api/users/[id]/__tests__/route.test.ts

key-decisions:
  - "D-04: Auth required — getAuthenticatedUser(req) called first; returns 401 if null"
  - "D-10: DTO built field-by-field; passwordHash never included in response"
  - "Import path is @/lib/types not @local/types (avoids Vercel build errors)"
  - "row.name ?? null and row.avatarUrl ?? null handle Drizzle nullable-as-undefined convention"
  - "Test file uses /** @jest-environment node */ to override jest.config.js jsdom default"
  - "getAuthenticatedUser mocked at module level; db.client mocked separately — avoids dynamic import bypass"

metrics:
  duration: 8min
  completed: 2026-05-14T18:49:53Z
---

# Phase 13 Plan 02: API — GET /api/users/[id] Summary

**Auth-guarded GET /api/users/[id] endpoint returning PublicUserDto with field-by-field projection; 4-scenario Jest test suite mocking auth and DB**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-14T18:41:50Z
- **Completed:** 2026-05-14T18:49:53Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments

- `apps/web/app/api/users/[id]/route.ts` created following the `jobs/[id]/route.ts` pattern exactly
- Route guards: 401 (no auth), 400 (NaN id), 404 (user not found), 200 (PublicUserDto)
- DTO built field-by-field; `passwordHash` never present in response; `?? null` guards applied to nullable columns
- Import path uses `@/lib/types` (confirmed not `@local/types`)
- `apps/web/app/api/users/[id]/__tests__/route.test.ts` created with 4 passing test scenarios
- Jest test infrastructure (root `node_modules`) required repair before tests could run — two corrupted packages fixed (see Deviations)

## Task Commits

1. **T02-01: Create GET /api/users/[id] route** — `a625249` (feat)
2. **T02-02: Add stub tests for users API route** — `7bc078b` (test)

## Files Created

- `apps/web/app/api/users/[id]/route.ts` — GET handler with auth guard, NaN guard, 404, and DTO projection
- `apps/web/app/api/users/[id]/__tests__/route.test.ts` — 4 test scenarios; mocks `@/lib/auth` and `@/lib/db/client`

## Decisions Made

- Auth mock (`jest.mock('@/lib/auth')`) used instead of generating real JWTs — `getAuthenticatedUser` uses dynamic `await import()` internally which bypasses static module mocks; mocking the function directly is the only reliable approach
- `/** @jest-environment node */` required at test file top to override `jest.config.js` default of `jsdom` — server primitives (`Request`, `NextResponse`) require node environment

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Corrupted root node_modules prevented Jest from running**
- **Found during:** Task 2 (run acceptance criteria test command)
- **Issue:** Two packages in the root `node_modules` were corrupted: `jest-circus/build/runner.js` was absent (package exports declared it but the file did not exist); `caniuse-lite/dist/` directory was entirely missing
- **Fix:** Deleted and reinstalled `jest-circus` and `caniuse-lite` via `rm -rf node_modules && npm install` at root workspace level
- **Files modified:** `package-lock.json` (updated during reinstall; not committed — root repo file, out of worktree scope)
- **Verification:** `npm test -- --testEnvironment=node --testPathPatterns="api/users" --passWithNoTests` exits 0 with 4 passing tests

**2. [Rule 1 - Bug] Initial test mock strategy failed for 400/404/200 cases**
- **Found during:** Task 2 first test run
- **Issue:** The initial mock of `@/lib/db/client` did not intercept `getAuthenticatedUser`'s internal DB calls because that function uses `await import()` (dynamic imports), bypassing Jest's static module mock system. All authenticated test cases returned 401
- **Fix:** Added `jest.mock('@/lib/auth', ...)` to mock `getAuthenticatedUser` directly, removing dependency on the dynamic import chain. DB mock still needed for the target user lookup within the route itself
- **Files modified:** `apps/web/app/api/users/[id]/__tests__/route.test.ts`
- **Commit:** `7bc078b` (final version)

---

**Total deviations:** 2 auto-fixed (1 blocking infrastructure — corrupted packages; 1 bug — incorrect mock strategy)
**Impact on plan:** Identical outcome to plan intent. All acceptance criteria satisfied.

## Known Stubs

None — this plan creates a fully functional API route and a test suite with real assertions (no `expect(true).toBe(true)` placeholders). All 4 tests exercise the actual route handler with mocked dependencies.

## Threat Flags

None — no new network endpoints beyond the planned `GET /api/users/[id]`. Auth guard enforced on all requests. DTO projection explicitly excludes `passwordHash`.

## Self-Check: PASSED

- `apps/web/app/api/users/[id]/route.ts` — FOUND
- `apps/web/app/api/users/[id]/__tests__/route.test.ts` — FOUND
- Commit `a625249` — FOUND
- Commit `7bc078b` — FOUND
