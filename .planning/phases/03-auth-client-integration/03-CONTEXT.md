# Phase 3: Auth Client Integration - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement client-side token persistence and logout integration for web and mobile. Users stay logged in across sessions via httpOnly cookies (web) and SecureStore + Authorization header (mobile). Logout clears tokens on both client and server. Auth state is managed via React AuthContext on web; mobile uses navigation guards.

**Requirements:** AUTH-03 (session persistence), AUTH-04 (logout)

**Out of scope:** Email verification, password reset, MFA, multi-device session management, social login.
</domain>

<decisions>
## Implementation Decisions

### Web Token Rehydration
- **D-01:** Token verification: **Call `/api/auth/me` once on app mount (in root `layout.tsx`)**
  - Caches user info in AuthContext state (avoids repeated /me calls)
  - On 401 from /me: clear local auth state and redirect to login
  - Cookie is httpOnly, so client can't read it — must verify via endpoint

### Mobile Token Handling
- **D-02:** Backend supports dual auth methods: **Cookie (web) + Authorization header (mobile)**
  - Modify Phase 2 routes to check: cookie first, then `Authorization: Bearer <token>` header
  - Mobile login returns token in response body: `{ user: {...}, token: "jwt..." }`
  - Mobile stores token in Expo SecureStore, sends in Authorization header
  - No separate mobile endpoints needed — same routes work for both platforms

### Auth State Management (Web)
- **D-03:** AuthContext provides: **`user`, `login()`, `logout()`, `isLoading`**
  - AuthProvider wraps entire app in root `layout.tsx`
  - On mount: calls /me, sets `user` state, sets `isLoading = false`
  - `login(email, password)`: calls /api/auth/login, on success sets user state
  - `logout()`: calls /api/auth/logout, clears user state
  - Pages access via `useAuth()` hook

### Route Protection Strategy (Web)
- **D-04:** Next.js **middleware.ts** checks cookie existence
  - Protected routes: all routes under `/dashboard`, `/jobs`, `/post-job`
  - Public routes: `/`, `/login`, `/register`, `/api/auth/*`
  - On missing/invalid cookie: redirect to `/login`
  - Middleware just checks cookie existence (fast) — /me validates on page load

### Login/Register UI & Redirects
- **D-05:** After login: **Redirect to `/dashboard` (client)**
  - After registration: auto-login + redirect to `/dashboard`
  - Same redirect for both roles (web is client-only)
  - Mobile redirects handled by Expo navigation (not web)

### the agent's Discretion
- Mobile navigation guards: use Expo Router's `useEffect` + auth state to redirect
- Error display: use field-map errors from D-03 (Phase 2) to show validation errors inline
- Logout on mobile: clear SecureStore, redirect to login screen
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specification
- `.planning/PROJECT.md` — project goals, core value, constraints (TypeScript strict, shared types)
- `.planning/REQUIREMENTS.md` — AUTH-03, AUTH-04 requirements and full v1 requirements list
- `.planning/ROADMAP.md` — Phase 3 success criteria and dependencies (depends on Phase 2)

### Architecture & Stack
- `.planning/codebase/STACK.md` — technology stack (Next.js App Router, Expo SDK 55, Neon + Drizzle ORM)
- `.planning/codebase/ARCHITECTURE.md` — API design patterns, error codes, vertical slices
- `Agents.md` — TypeScript strict mode, shared types, behavioral guidelines

### Prior Phase Context
- `.planning/phases/02-backend-auth-api/02-CONTEXT.md` — Phase 2 decisions (httpOnly cookies, JWT, logout behavior, error contract)
- `.planning/phases/02-backend-auth-api/02-01-PLAN.md` — Drizzle schema, migration
- `.planning/phases/02-backend-auth-api/02-02-PLAN.md` — Auth routes implementation

### Standards & Guidelines
- `behavioral-guidelines.md` — simplicity-first, surgical changes, goal-driven execution
- `.planning/REQUIREMENTS.md ## Traceability` — AUTH-03, AUTH-04 are Phase 3 requirements
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/types/src/index.ts` — Auth DTOs (AuthLoginRequest, AuthRegisterRequest, AuthUserDto), ApiErrorResponse (field-map format)
- `apps/web/lib/auth.ts` — JWT verify function (`verifyJwt`), can be used in middleware
- `apps/web/app/api/auth/me/route.ts` — GET endpoint for token verification (returns user or 401)

### Established Patterns
- **Vertical slice pattern:** Auth UI (this phase) connects to existing API routes (Phase 2)
- **API error responses:** Structured field-map: `{ errors: { field: message } }` (per D-03 from Phase 2)
- **Monorepo imports:** All types imported from `packages/types` (no local duplicates)

### Integration Points
- **Web:** `apps/web/app/` — login/register pages, middleware.ts, AuthContext provider
- **Mobile:** `apps/mobile/` — login/register screens, SecureStore, navigation guards
- **Backend modification:** `apps/web/app/api/auth/*` — add Authorization header support
</code_context>

<specifics>
## Specific Implementation Notes

- **Dual auth backend:** Modify Phase 2 routes to extract token from:
  1. Cookie: `request.cookies.get('token')`
  2. Header: `request.headers.get('Authorization')?.replace('Bearer ', '')`
- **AuthContext:** Custom hook `useAuth()` returns `{ user, login, logout, isLoading }`
- **Middleware:** Runs on every request, checks for cookie, redirects if missing on protected routes
- **Mobile token storage:** Expo SecureStore (encrypted, persists across app restarts)
- **Mobile token usage:** Include in fetch headers: `{ Authorization: `Bearer ${token}` }`
</specifics>

<deferred>
## Deferred Ideas

- Email verification before login (v2 feature)
- Password reset / forgot password flow (v2 feature)
- Multi-device session management (v2 feature)
- MFA / two-factor authentication (v2 feature)
- OAuth social login (v2 feature)
- Role switching (user is Client or Provider, fixed at registration)
</deferred>

---

*Phase: 03-auth-client-integration*
*Context gathered: 2026-05-05*
