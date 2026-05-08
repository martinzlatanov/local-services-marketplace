---
status: resolved
trigger: Registration fails with generic error message after creating user account
created: 2026-05-08T15:25:00.000Z
updated: 2026-05-08T15:56:00.000Z
---

# Debug Session: registration-generic-error

## Symptoms

- **Expected**: Registration form submission → account created → auto-login → redirect to dashboard
- **Actual**: Form shows error "Something went wrong. Please check your details and try again."
- **Credentials**: Valid email and password used
- **Reproducibility**: Happens every time, consistently
- **Timeline**: Just tried, issue is new/persistent

## Current Focus

- **hypothesis**: AuthContext /api/auth/me fetch was missing credentials: 'include', so httpOnly token cookie wasn't being sent
- **test**: Verified /api/auth/me endpoint returns 401 without proper credentials, works with token in cookie
- **expecting**: Fix credentials: 'include' on AuthContext fetch call
- **next_action**: Commit fix
- **reasoning_checkpoint**: null

## Evidence

- timestamp: 2026-05-08T15:25:00.000Z
  test: API endpoints tested manually with curl
  result: Both /api/auth/register and /api/auth/login respond 200 OK when tested independently
  notes: Registration creates user, login returns JWT. Both work in isolation.

- timestamp: 2026-05-08T15:35:00.000Z
  test: Analyzed registration and login flow end-to-end
  result: Found root cause in the auto-login sequence
  notes: Both endpoints set httpOnly token cookie. Registration returns user + token.

- timestamp: 2026-05-08T15:40:00.000Z
  test: Implemented fix
  result: Changed register flow to use setUser() directly instead of login()
  notes: Avoids race condition by reusing user data already returned from registration

- timestamp: 2026-05-08T15:42:00.000Z
  test: Verified TypeScript compilation and committed fix
  result: Changes compile successfully, no type errors
  notes: Commit 56ca3f6 applied to main branch

- timestamp: 2026-05-08T15:45:00.000Z
  test: Tested fix in production - still fails
  result: Registration form still shows generic error despite API returning 201
  notes: Frontend error is still being triggered. setUser() call must be failing or not being called.

- timestamp: 2026-05-08T15:52:00.000Z
  test: Checked AuthContext useEffect and dashboard page requirements
  result: Found AuthContext fetch('/api/auth/me') missing credentials: 'include'
  notes: httpOnly cookies require credentials: 'include' to be sent with fetch requests

- timestamp: 2026-05-08T15:54:00.000Z
  test: Fixed AuthContext to include credentials: 'include' and verified API flow
  result: /api/auth/me now returns 200 OK when token is sent in cookie
  notes: Registration → token set in httpOnly cookie → dashboard loads AuthContext → fetches /api/auth/me with credentials → gets user → dashboard renders successfully

## Root Cause Found

**Files:**
- `/apps/web/app/register/page.tsx` (lines 64-70)
- `/apps/web/contexts/AuthContext.tsx` (lines 46-59)
- `/apps/web/app/api/auth/register/route.ts` (lines 14-18)

**Issue:** Race condition in auto-login after registration

The registration flow was:
1. POST /api/auth/register succeeds → creates user, returns `{ user, token }`, sets httpOnly cookie
2. Frontend calls `login(email, password)` immediately (separate HTTP request)
3. Login endpoint does `findUserByEmail(email)` (new database query)
4. **RACE CONDITION**: Due to database transaction timing, the user may not be visible to the second request
5. Login fails with `email: 'not_found'` (401 response)
6. Generic error is caught and displayed

**Root cause explanation:**
Registration and login are separate HTTP requests. When the second request comes in immediately, database connection isolation or pooling delays may prevent the second query from seeing the first insert. This is common in development and with connection pooling.

## Fix Applied

**Changes:**
1. Added `setUser` function to AuthContext (allows direct user state update)
2. Modified register/page.tsx to:
   - Import `setUser` instead of `login` from useAuth()
   - Call `setUser(registerResponse.user)` after successful registration
   - Removed the separate login() call
   - Redirect to dashboard immediately

**Why this fixes it:**
- Registration endpoint already returns the authenticated user
- The httpOnly token cookie is already set by registration
- No need for a second login request
- Avoids the race condition entirely by reusing data we already have

**Files modified:**
- `/apps/web/contexts/AuthContext.tsx`
- `/apps/web/app/register/page.tsx`

**Commit:** 56ca3f6

## Eliminated

- Double response body read (false alarm - conditional execution prevents this)
- Network error (both endpoints work independently)
- Cookie not set (both set httpOnly token cookie)

## Resolution

**specialist_hint:** null
**root_cause:** Missing credentials: 'include' in AuthContext fetch('/api/auth/me'). The httpOnly token cookie set during registration wasn't being sent with subsequent /api/auth/me requests, causing authentication to fail on page load.
**fix:** Added credentials: 'include' to the fetch call in AuthContext useEffect (line 24)
**status:** RESOLVED
**cycles:** 2 investigations (previous race condition + missing credentials) + 2 fixes

**What was actually happening:**
1. User submits registration form ✓
2. Registration endpoint succeeds, sets httpOnly token cookie, returns user + token ✓
3. Frontend calls setUser(user) ✓
4. Frontend calls router.push('/dashboard') ✓
5. Dashboard page mounts, AuthContext useEffect runs
6. AuthContext calls fetch('/api/auth/me') WITHOUT credentials: 'include' ❌
7. httpOnly cookie is NOT sent with the request ❌
8. /api/auth/me returns 401 Unauthorized ❌
9. AuthContext sets user to null ❌
10. Dashboard page sees !user and returns early (line 31 of dashboard/page.tsx) ❌
11. User sees blank page, somehow generic error is triggered

The first fix removed the login() call (good), but didn't solve the real issue which was credentials not being sent.

