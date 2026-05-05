# Phase 2: Backend Auth API - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Build registration and login endpoints in the Next.js API. Users can sign up with email, password, and role (Client or Provider); log in to receive an auth token; and log out to revoke their session. Backend enforces role at signup and issues JWTs. All auth failures are validated at the API boundary before hitting the database.

**Requirements:** AUTH-01 (register), AUTH-02 (login)

**Out of scope:** Email verification, password reset, MFA, multi-device session management.

</domain>

<decisions>
## Implementation Decisions

### Session & Token Management
- **D-01:** Token storage: **httpOnly Cookies + JWT**
  - Backend issues JWT in an `httpOnly` cookie on successful login
  - Browser automatically includes cookie in every request; survives page refresh
  - Immune to XSS; protected by httpOnly and SameSite flags
  - Invalidation: server revokes via cookie clear on logout

- **D-02:** Logout behavior: **Server-Side Invalidation + Client Clear**
  - Client sends POST `/auth/logout` request to backend
  - Backend clears the auth cookie via Set-Cookie header and invalidates the session
  - Client also clears any local auth state (context, flags)
  - Logout is immediate; stale cookies cannot be reused
  - Backend must maintain a revocation mechanism (Redis, database, or in-memory blocklist)

### Error & Validation Contract
- **D-03:** Error responses: **Structured Validation Errors with Field Map**
  - `400 Bad Request` for input validation failures: `{ "errors": { "email": "Invalid format", "password": "Required" } }`
  - `401 Unauthorized` for authentication failures (e.g., email not found, password mismatch)
  - Each field in the error map shows a human-readable message (e.g., "Invalid email format", "Email not found")
  - Enables field-by-field form error highlighting on the client

### Database Schema & Hashing
- **D-04 (Claude's discretion):** Password hashing algorithm: bcrypt (standard, proven, no dependencies on external services)
- **D-05 (Claude's discretion):** JWT expiry: 15 minutes (short-lived token, requires refresh token or re-login; minimizes stale-token risk)
- **D-06 (Claude's discretion):** User table fields: `id` (PK), `email` (unique), `passwordHash`, `role` (CLIENT | PROVIDER, immutable after signup), `createdAt`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specification
- `.planning/PROJECT.md` — project goals, core value (atomic job acceptance), constraints
- `.planning/REQUIREMENTS.md` — AUTH-01, AUTH-02 requirements and full v1 requirements list
- `.planning/ROADMAP.md` — Phase 2 success criteria and dependencies

### Architecture & Stack
- `.planning/codebase/STACK.md` — technology stack (Next.js API Routes, Neon + Drizzle ORM)
- `.planning/codebase/ARCHITECTURE.md` — API design patterns (REST, error codes, vertical slices)
- `Agents.md` — TypeScript strict mode, shared types, behavioral guidelines

### Prior Phase Context
- `.planning/phases/01-monorepo-foundation-and-shared-types/01-CONTEXT.md` — Phase 1 decisions (monorepo structure, shared types)

### Standards & Guidelines
- `behavioral-guidelines.md` — simplicity-first, surgical changes, goal-driven execution
- `.planning/REQUIREMENTS.md ## Traceability` — AUTH-01, AUTH-02 are Phase 2 requirements

</canonical_refs>

<code_context>
## Codebase Integration Points

### Reusable Assets
- `packages/types/src/index.ts` — Export location for `ApiErrorResponse` (already defined per D-08 from Phase 1)
  - Error response shape: `{ "errors": { [field]: string } }`
  - Planner should ensure this type matches the field-map contract in D-03

### Established Patterns
- **Vertical slice pattern:** Auth is implemented as:
  - Backend: `/auth/register` and `/auth/login` POST endpoints + `/auth/logout` endpoint
  - Database: User table with Drizzle schema
  - No client UI in this phase (client auth integration is Phase 3)

- **API error responses:** Standardized error codes from `ARCHITECTURE.md`:
  - `400 Bad Request` — validation failures
  - `401 Unauthorized` — auth failures
  - Structured response shape defined in `packages/types`

- **Monorepo imports:** All auth endpoints live in `apps/web/app/api/auth/` and import from `packages/types`

### Integration Points
- **Next.js API Routes:** Auth endpoints at `apps/web/app/api/auth/register`, `apps/web/app/api/auth/login`, `apps/web/app/api/auth/logout`
- **Drizzle ORM + Neon:** User table schema, migrations, and query client
- **Shared types:** `packages/types` exports the error response shape and any auth DTOs needed by clients in Phase 3+

</code_context>

<specifics>
## Specific Implementation Notes

- **No email verification in Phase 2:** Registration succeeds immediately; emails are assumed valid (no async email verification step).
- **No password reset:** Out of scope for v1; users cannot change passwords.
- **Role is immutable:** Once set at registration, a user's role cannot be changed.
- **JWT signing:** Use Node.js `crypto` module or a lightweight JWT library (e.g., `jose`); no heavy auth frameworks.
- **Cookie flags:** httpOnly, Secure (HTTPS only in production), SameSite=Strict
- **Token revocation:** For Phase 2, a simple in-memory Set of revoked token JTIs (JWT IDs) is acceptable; upgrade to Redis if Phase 6+ adds token complexity.

</specifics>

<deferred>
## Deferred Ideas

- Email verification before login (v2 feature)
- Password reset / forgot password flow (v2 feature)
- Multi-device session management (v2 feature)
- MFA / two-factor authentication (v2 feature)
- OAuth social login (v2 feature)

</deferred>

---

*Phase: 02-backend-auth-api*
*Context gathered: 2026-05-05*
