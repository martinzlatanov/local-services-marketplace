# Phase 13: Provider & Client Identity - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Surface who is involved in each job: providers see client identity on the mobile job detail screen, clients see provider identity on the web job detail view. Add a public provider profile page at `/providers/[id]` showing avatar initials, email, name, member-since date, average star rating, and all approved reviews. Extend the `users` table with nullable `name` and `avatarUrl` columns (migration only — no backfill). Add `GET /api/users/[id]` returning a public user DTO with no password hash.

**In scope:**
- `apps/web/lib/db/schema.ts` + new Drizzle migration — add `name`, `avatarUrl` columns to users
- `packages/types/src/index.ts` — add `PublicUserDto`
- `apps/web/app/api/users/[id]/route.ts` — new GET endpoint (authenticated)
- `apps/web/app/(client)/dashboard` or job detail view — show provider email/name inline when providerId is set
- `apps/web/app/providers/[id]/page.tsx` — new provider profile page
- `apps/mobile/lib/api.ts` — add `getUser(token, userId)` helper
- `apps/mobile/app/(app)/jobs/[id].tsx` — show client email/name inline

**Out of scope:**
- Editing/updating user profiles (name, avatar upload)
- User settings page
- Provider-to-provider profile navigation
- Any changes to job state machine or WebSocket logic

</domain>

<decisions>
## Implementation Decisions

### D-01 — Identity display on web job detail (client view)
Provider email + name shown **inline in the existing job card/row** on the client dashboard when `providerId` is set. No navigation required — data fetched via a separate `GET /api/users/[providerId]` call when rendering if providerId is non-null.

### D-02 — Identity display on mobile job detail (provider view)
Client email + name shown **inline in the existing job detail screen** (`apps/mobile/app/(app)/jobs/[id].tsx`). Always shown when the job data is loaded — no conditional by status.

### D-03 — Data fetching approach for identity
Identity fields are NOT embedded in `JobDto`. The `clientId`/`providerId` raw strings in `JobDto` remain unchanged. Each platform makes a separate `GET /api/users/[id]` call to resolve identity. `JobDto` stays as-is across both platforms.

### D-04 — GET /api/users/[id] — authentication
The endpoint **requires authentication** (Bearer token). Consistent with all other API routes in this project. Both web and mobile already have tokens available when rendering job detail views.

### D-05 — Provider profile page — access
Accessible to **any authenticated user** (client or provider). Consistent with how approved reviews are fetched via `GET /api/reviews?userId=X&approved=true` (already public to authenticated users).

### D-06 — Avatar initials derivation
If `name` is set → use first letters of each word in name (e.g. "John Smith" → "JS").
If `name` is null → use the first letter of the email address (e.g. "john@example.com" → "J").
`avatarUrl` is nullable; if set, show image instead of initials circle.

### D-07 — Provider profile: empty reviews state
When a provider has no approved reviews: show the profile header (avatar, email, name, member since) and an empty-state message ("No reviews yet") in place of the reviews list. Star rating shown as unrated (e.g. "—" or "No rating yet").

### D-08 — Schema migration
New Drizzle migration file (e.g. `apps/web/drizzle/0002_add_user_identity.sql`) adds:
- `name VARCHAR(100)` — nullable, no default
- `avatar_url TEXT` — nullable, no default

Both columns are nullable — existing rows are unaffected, no backfill. Also update `apps/web/lib/db/schema.ts` to include these fields.

### D-09 — Null name display fallback
When `name` is null:
- Avatar shows first letter of email
- Name field is **not rendered** (omitted from UI, not replaced with placeholder text)
- Email address is always shown as the primary identifier

### D-10 — PublicUserDto in packages/types
Add a **new `PublicUserDto`** interface to `packages/types/src/index.ts`:
```ts
export interface PublicUserDto {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: Role
  createdAt: string
}
```
`AuthUserDto` is left unchanged — it is the auth token payload shape and must not include profile fields.

### D-11 — Mobile API helper
Add `getUser(token: string, userId: string): Promise<PublicUserDto>` to `apps/mobile/lib/api.ts`. Consistent with all other API calls in mobile (getJob, acceptJob, updateJobStatus, etc.).

### Claude's Discretion
- Exact Tailwind classes for the provider identity section in web job detail
- Layout of the identity section in the mobile job detail screen (label/value rows vs inline)
- Loading state behavior while user identity fetch is in progress (skeleton, spinner, or deferred render)
- Provider profile page layout details (card vs full-width, review list vs grid)
- Average star rating calculation from `clientCommunication`, `clientQuality`, `clientPunctuality` fields in ReviewDTO

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — IDENTITY-01 through IDENTITY-05 (full requirement text and acceptance criteria)
- `.planning/ROADMAP.md` §Phase 13 — 5 success criteria and phase dependencies

### Existing source files (must read before modifying)
- `packages/types/src/index.ts` — Add PublicUserDto here; AuthUserDto (do NOT change), JobDto (do NOT change), ReviewDTO
- `apps/web/lib/db/schema.ts` — users table definition; add name + avatarUrl columns here
- `apps/web/lib/auth.ts` — getAuthenticatedUser() pattern used by all API routes; follow this for the new /api/users/[id] route
- `apps/web/app/api/jobs/[id]/route.ts` — reference implementation for a job GET route using getAuthenticatedUser
- `apps/web/app/api/reviews/route.ts` — reference for fetching approved reviews by userId (`?userId=X&approved=true`)
- `apps/mobile/lib/api.ts` — add getUser() here; follow existing function signatures
- `apps/mobile/app/(app)/jobs/[id].tsx` — mobile job detail screen where client identity section goes

### Existing migration files (reference for new migration format)
- `apps/web/drizzle/0000_initial_user.sql` — initial users table schema
- `apps/web/drizzle/0001_lean_juggernaut.sql` — reference for migration file format

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/app/api/reviews/route.ts` §GET `?userId=X&approved=true` — already fetches approved reviews for a user by ID; the provider profile page can reuse this query pattern
- `apps/web/lib/auth.ts` `getAuthenticatedUser()` — standard auth guard used in all routes; use verbatim in the new `/api/users/[id]` route
- `apps/mobile/lib/api.ts` — all mobile API calls live here with consistent `(token, ...args)` signature; add `getUser` following this pattern

### Established Patterns
- All API routes return `{ data: T }` (ApiSuccessResponse) on success and `{ errors: Record<string, string> }` (ApiErrorResponse) on failure — the new user endpoint must follow this
- `JobDto.clientId` and `JobDto.providerId` are raw string IDs — identity is resolved via a separate user fetch, not embedded in the job DTO
- Drizzle migrations are SQL files in `apps/web/drizzle/` with incrementing numeric prefix; schema.ts is kept in sync

### Integration Points
- `apps/web/app/api/users/[id]/route.ts` — new file; connects to the users table via `db.select().from(users).where(eq(users.id, userId))`
- `apps/web/app/providers/[id]/page.tsx` — new file; calls `/api/users/[id]` and `/api/reviews?userId=[id]&approved=true`
- Web job detail view — needs to call `/api/users/[providerId]` when `job.providerId` is non-null
- Mobile job detail — needs to call `getUser(token, job.clientId)` via the new lib/api helper

</code_context>

<specifics>
## Specific Ideas

- The ReviewDTO already has `photoUrl?: string | null` — approved reviews on the provider profile page should display the photo if present
- Average star rating for a provider is computed from `clientCommunication`, `clientQuality`, `clientPunctuality` fields on reviews where `reviewType === 'client'`
- The reviews endpoint already supports `GET /api/reviews?userId=X&approved=true` — the provider profile page can use this directly without a new endpoint

</specifics>

<deferred>
## Deferred Ideas

- Profile editing (name, avatar upload) — not in scope for this phase; would be its own phase
- Provider self-view of their own profile — not scoped; providers can technically navigate to `/providers/[id]` but there's no explicit "My Profile" link

</deferred>

---

*Phase: 13-provider-client-identity*
*Context gathered: 2026-05-14*
