---
phase: 03-auth-client-integration
plan: 01
subsystem: auth
tags: [jwt, nextjs, drizzle, httponly-cookie, authorization-header, mobile]

# Dependency graph
requires:
  - phase: 02-backend-auth-api
    provides: login, register, and /me routes with httpOnly cookie JWT auth
provides:
  - login route returns token in response body for mobile SecureStore
  - register route issues httpOnly cookie AND returns token in response body
  - /me route accepts httpOnly cookie (web) or Authorization Bearer header (mobile), returns full AuthUserDto from DB
affects: [03-02, 03-03, 03-04, 03-05, mobile-auth]

# Tech tracking
tech-stack:
  added: []
  patterns: [dual-auth extraction (cookie first, header fallback), DB lookup after JWT verify for full DTO]

key-files:
  created: []
  modified:
    - apps/web/app/api/auth/login/route.ts
    - apps/web/app/api/auth/register/route.ts
    - apps/web/app/api/auth/me/route.ts

key-decisions:
  - "Cookie tried first on /me (web path), Authorization header only as fallback (mobile path) — per D-02"
  - "DB lookup after verifyJwt on /me because JWT payload only carries sub+email, not role or createdAt"
  - "Register now sets httpOnly cookie (parity with login) so web auto-signs-in after registration"

patterns-established:
  - "Dual-auth extraction pattern: cookieToken ?? headerToken — cookie wins when both present (prevents XSS header injection)"
  - "After JWT verify, always query DB for full user row before returning AuthUserDto"

requirements-completed: [AUTH-03, AUTH-04]

# Metrics
duration: 10min
completed: 2026-05-06
---

# Phase 03 Plan 01: Auth Routes Dual-Auth Mobile Support Summary

**Login, register, and /me routes extended for dual transport: httpOnly cookie (web) and Authorization Bearer header + response body token (mobile)**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-05-06T00:00:00Z
- **Completed:** 2026-05-06T00:10:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- login route now returns `{ user, token }` — mobile can capture JWT from response body for SecureStore
- register route now signs JWT, sets httpOnly cookie (parity with login), and includes token in response body
- /me rewrote cookie extraction from fragile `split('token=')[1]` to `NextRequest.cookies.get('token')?.value`, added Authorization Bearer header fallback, and queries DB for full AuthUserDto (id, email, role, createdAt)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add token to login and register response bodies** - `b361be8` (feat)
2. **Task 2: Upgrade /me to dual-auth extraction, fix cookie parser, return full AuthUserDto from DB** - `b361be8` (feat)

**Plan metadata:** (committed with tasks in single commit)

## Files Created/Modified
- `apps/web/app/api/auth/login/route.ts` - Added `token` to response body
- `apps/web/app/api/auth/register/route.ts` - Added `signJwt` import, httpOnly cookie, `token` in response body
- `apps/web/app/api/auth/me/route.ts` - Full rewrite: NextRequest, dual-auth, DB query, full AuthUserDto

## Decisions Made
- Committed both tasks in a single commit since they were executed together and both passed typecheck in one pass.
- Register sets httpOnly cookie (not in original plan for register) to match login behavior — web auto-sign-in after registration works without a follow-up /me call.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Register now sets httpOnly cookie for web session parity**
- **Found during:** Task 1
- **Issue:** Plan said to add token to register response body but the original register route set no cookie at all. Without a cookie, web clients registering would be logged out immediately (middleware checks cookie existence per D-04).
- **Fix:** Added `res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax' })` on the register response — same as login.
- **Files modified:** apps/web/app/api/auth/register/route.ts
- **Verification:** typecheck passes, cookie set alongside token in body
- **Committed in:** b361be8

---

**Total deviations:** 1 auto-fixed (missing critical)
**Impact on plan:** Necessary for web correctness — without the cookie, registered users would be immediately redirected to /login by middleware. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Backend now satisfies both web (cookie) and mobile (Bearer + body token) auth transport
- /me returns full AuthUserDto — AuthContext on web and mobile can rely on role and createdAt
- Ready for 03-02 (web AuthContext) and 03-03/03-04 (mobile auth screens/context)

---
*Phase: 03-auth-client-integration*
*Completed: 2026-05-06*
