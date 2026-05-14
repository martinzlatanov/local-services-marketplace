# Phase 13: Provider & Client Identity — Research

**Researched:** 2026-05-14
**Domain:** Identity display (web + mobile), public user API, Drizzle schema migration
**Confidence:** HIGH — all decisions locked in CONTEXT.md; codebase fully inspected

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01** Provider email + name shown inline in the existing job card/row on the client dashboard when `providerId` is set. No navigation required — data fetched via `GET /api/users/[providerId]` when providerId is non-null.
- **D-02** Client email + name shown inline in the existing job detail screen (`apps/mobile/app/(app)/jobs/[id].tsx`). Always shown when job data is loaded — no conditional by status.
- **D-03** Identity fields are NOT embedded in `JobDto`. `clientId`/`providerId` raw strings remain unchanged. Each platform makes a separate `GET /api/users/[id]` call to resolve identity.
- **D-04** `GET /api/users/[id]` requires authentication (Bearer token). Consistent with all other API routes.
- **D-05** Provider profile page accessible to any authenticated user (client or provider).
- **D-06** Avatar initials: if name set → first letters of each word (e.g. "John Smith" → "JS"), max 2 chars. If name null → first letter of email. If `avatarUrl` set, show image instead of initials circle.
- **D-07** Empty reviews state: show profile header + "No reviews yet" message. Star rating shown as "No rating yet".
- **D-08** New migration file `apps/web/drizzle/0002_add_user_identity.sql` adds `name VARCHAR(100)` (nullable, no default) and `avatar_url TEXT` (nullable, no default). Update `apps/web/lib/db/schema.ts`.
- **D-09** When name is null: avatar shows first letter of email; name field not rendered (omitted, not replaced with placeholder); email always shown as primary identifier.
- **D-10** New `PublicUserDto` interface in `packages/types/src/index.ts`: `{ id: string, email: string, name: string | null, avatarUrl: string | null, role: Role, createdAt: string }`. `AuthUserDto` left unchanged.
- **D-11** Add `getUser(token: string, userId: string): Promise<PublicUserDto>` to `apps/mobile/lib/api.ts`.

### Claude's Discretion

- Exact Tailwind classes for the provider identity section in web job detail
- Layout of the identity section in the mobile job detail screen (label/value rows vs inline)
- Loading state behavior while user identity fetch is in progress (skeleton, spinner, or deferred render)
- Provider profile page layout details (card vs full-width, review list vs grid)
- Average star rating calculation from `clientCommunication`, `clientQuality`, `clientPunctuality` fields in ReviewDTO

### Deferred Ideas (OUT OF SCOPE)

- Profile editing (name, avatar upload)
- Provider self-view of their own profile ("My Profile" link)

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IDENTITY-01 | Web task detail view shows provider email/name when job has been accepted (visible to client) | D-01, D-03: `JobDetailCard.tsx` calls `GET /api/users/[providerId]` when `job.providerId` non-null |
| IDENTITY-02 | Mobile job detail screen shows client email/name (visible to provider who accepted or is viewing) | D-02, D-11: `getUser(token, job.clientId)` added to mobile `api.ts`; inline section in `[id].tsx` |
| IDENTITY-03 | Provider public profile page at `/providers/[id]` displays avatar initials, email, name, member-since, approved reviews with star ratings | D-05, D-06, D-07, D-10; uses `GET /api/users/[id]` + existing `GET /api/reviews?userId=X&approved=true` |
| IDENTITY-04 | `GET /api/users/[id]` returns public user DTO with no password hash | D-04, D-10: new route at `apps/web/app/api/users/[id]/route.ts` projecting only `PublicUserDto` fields |
| IDENTITY-05 | Users table gains optional `name` and `avatarUrl` columns; existing rows unaffected | D-08: new SQL migration `0002_add_user_identity.sql`; schema.ts updated to match |

</phase_requirements>

---

## Summary

Phase 13 surfaces identity on both platforms. On the web, clients see provider name/email inline within the job card after a job is accepted. On mobile, providers always see client name/email when viewing a job's detail screen. A new public provider profile page at `/providers/[id]` aggregates the user's identity fields and all approved reviews.

All decisions are locked in CONTEXT.md. No new libraries are required — the phase uses the existing stack (Next.js API Routes, Drizzle ORM, Neon PostgreSQL, React Native Paper). The only schema change is two nullable `ALTER TABLE ADD COLUMN` statements. The only new API endpoint is `GET /api/users/[id]`.

**Primary recommendation:** Implement in this order — (1) schema migration, (2) `PublicUserDto` type + `schema.ts` update, (3) new API route, (4) web identity section + profile page, (5) mobile API helper + mobile identity section. This minimises integration failures since each layer depends on the one below.

---

## Project Constraints (from CLAUDE.md)

- **Language:** TypeScript strict mode throughout.
- **Shared types:** All DTOs added to `packages/types/src/index.ts`. Web (`apps/web`) re-exports via `apps/web/lib/types.ts`; mobile imports from `@local/types`.
- **Database source of truth:** Neon serverless PostgreSQL via Drizzle ORM.
- **Error codes:** 400 bad request, 401 unauthorized, 404 not found — all used by the new endpoint.
- **Vertical slices:** Backend API → Web UI → Mobile UI, in that order.
- **No speculative code:** Only the fields in `PublicUserDto` are permitted in the user endpoint response.
- **security_enforcement is `false`** in config.json — Security Domain section omitted.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Public user DTO + password exclusion | API / Backend | — | Server owns data projection; `passwordHash` must never reach the client tier |
| Schema migration (name, avatarUrl columns) | Database / Storage | — | DDL is database-only; schema.ts kept in sync as convention |
| Avatar initials derivation | Browser / Client | Mobile client | Pure display logic; no server involvement |
| Inline provider identity (web) | Browser / Client | API (data source) | Client-side fetch triggered by `job.providerId` non-null |
| Inline client identity (mobile) | Mobile client | API (data source) | Client-side fetch after job loads |
| Provider profile page | Browser / Client (SSR eligible) | API (data sources: user + reviews) | Page composes two API calls; no server-only requirement |
| Average star rating calculation | Browser / Client | — | Pre-computed averages already returned by `GET /api/reviews?userId=X`; front-end formula: `(comm + quality + punct) / 3` |

---

## Standard Stack

Phase uses the existing project stack. No new dependencies are introduced.

| Layer | Library | Already Installed | Notes |
|-------|---------|-------------------|-------|
| ORM | Drizzle ORM | Yes | `varchar`, `text` column types used for schema addition |
| Web framework | Next.js App Router | Yes | New API route + page follow existing file conventions |
| Shared types | `packages/types` / `@local/types` | Yes | Append `PublicUserDto` only |
| Mobile UI | React Native Paper | Yes | `Avatar.Text`, `Avatar.Image`, `Divider` used in mobile identity section |
| Web icons | lucide-react | Yes | `Star` (16px) for rating display; `Loader2` for loading states |

**Version verification:** Skipped — no new packages. Installation command: none.

---

## Architecture Patterns

### System Architecture Diagram

```
[Client browser / Mobile app]
        |
        | GET /api/users/[id]  (Bearer token)
        v
[Next.js API Route: /api/users/[id]/route.ts]
        |
        | db.select().from(users).where(eq(users.id, userId))
        v
[Neon PostgreSQL — users table]
        |
        | row: { id, email, name, avatarUrl, role, createdAt, passwordHash }
        v
[PublicUserDto projection — passwordHash excluded]
        |
        | { data: PublicUserDto }
        v
[Client: renders inline identity section or provider profile page]
```

Provider profile page additionally calls `GET /api/reviews?userId=[id]&approved=true` (existing endpoint, no change required).

### Recommended File Additions / Modifications

```
packages/types/src/index.ts        ← append PublicUserDto
apps/web/drizzle/
  0002_add_user_identity.sql       ← new migration (nullable ALTER TABLE ADD COLUMN)
apps/web/lib/db/schema.ts          ← add name + avatarUrl to users pgTable
apps/web/app/api/users/[id]/
  route.ts                         ← new GET endpoint
apps/web/components/ui/
  AvatarInitials.tsx               ← new presentational component (web)
apps/web/components/dashboard/
  JobDetailCard.tsx                ← modify: add provider identity section
apps/web/app/providers/[id]/
  page.tsx                         ← new public provider profile page
apps/mobile/lib/api.ts             ← add getUser() function
apps/mobile/app/(app)/jobs/[id].tsx ← modify: add client identity section
apps/mobile/components/
  AvatarInitials.tsx               ← new presentational component (mobile)
```

### Established Patterns (reference 13-PATTERNS.md for analog code)

All pattern analog code lives in `13-PATTERNS.md`. Summaries for the planner:

- **API route (new):** Follow `apps/web/app/api/jobs/[id]/route.ts` — static imports, `getAuthenticatedUser`, `parseInt(id, 10)` + `isNaN` guard, `db.select().from(...).where(...).limit(1)`, explicit DTO projection, `{ data: dto }` response.
- **Drizzle schema modification:** Append `name: varchar("name", { length: 100 })` and `avatarUrl: text("avatar_url")` inside the `users` pgTable call — no `.notNull()`, no `.default()`.
- **Migration SQL:** `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" VARCHAR(100);` — matches `0000_initial_user.sql` naming style.
- **Mobile API function:** Follow `getJob` signature exactly — `(token: string, id: string): Promise<T>` delegating to `parseResponse<T>(res)`.
- **Web types import path:** `import { ... } from '@/lib/types'` (the local re-export at `apps/web/lib/types.ts`). **Not** `@local/types` for web routes. Mobile uses `@local/types`.
- **Secondary fetch in component:** Follow the `checkReviewStatus` `useEffect` pattern in `JobDetailCard.tsx` — try/catch, silently handle errors, minimal state (`useState<PublicUserDto | null>` + `useState<boolean>` loading flag).

### Anti-Patterns to Avoid

- **Embedding identity fields in JobDto:** D-03 locks this out. `JobDto.clientId` and `JobDto.providerId` stay as raw string IDs.
- **Using `db.select({ id: users.id, email: users.email, ... })` column selection vs full row + projection:** Either approach works, but the project convention (see `jobs/[id]/route.ts`) is to select the full row then build a DTO object manually. Prefer consistency over micro-optimization.
- **Status-gating the identity section (web):** D-01 says "when `providerId` is set", not "when status is ACCEPTED". A job can have `providerId` set at statuses ACCEPTED, IN_PROGRESS, COMPLETED. The condition must be `job.providerId !== null`, not `job.status === JobStatus.ACCEPTED`.
- **Conditional rendering on mobile:** D-02 says identity section is always rendered when job data is loaded — no status conditional.
- **Using the `@local/types` import path in web routes:** Web resolves types via `@/lib/types` (the local copy at `apps/web/lib/types.ts`). `@local/types` is for mobile only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Avatar initials derivation | Custom multi-file utility | Single function in `AvatarInitials.tsx` per D-06 | Trivial string logic; inline is sufficient |
| Average rating calculation | Dedicated service | One-line formula from `averageRatings` already returned by reviews endpoint | Endpoint already pre-computes per-category averages |
| Skeleton loading animation | CSS keyframes | Tailwind `animate-pulse` (web) / `Animated.Value` opacity (mobile) | Project convention; already used in `ReviewDisplay.tsx` |

---

## Common Pitfalls

### Pitfall 1: `passwordHash` leaked in API response
**What goes wrong:** `db.select().from(users).where(...)` returns the full row including `passwordHash`. If the developer returns `row` directly or spreads it into the response, the password hash is exposed.
**Why it happens:** Drizzle selects all columns by default.
**How to avoid:** Build the `PublicUserDto` object by explicitly listing only the permitted fields: `{ id: String(row.id), email: row.email, name: row.name ?? null, avatarUrl: row.avatarUrl ?? null, role: row.role as Role, createdAt: row.createdAt.toISOString() }`. Never spread `row`.
**Warning signs:** Response JSON contains `password_hash` or `passwordHash` key.

### Pitfall 2: Wrong import path for types in web API route
**What goes wrong:** Using `import { PublicUserDto } from '@local/types'` in `apps/web/app/api/users/[id]/route.ts` causes a module resolution error at build time.
**Why it happens:** Web routes resolve `@local/types` only when the monorepo workspace is set up — but the project uses a local copy at `apps/web/lib/types.ts` re-exporting from `packages/types`. All existing web routes (`jobs/[id]/route.ts`, `reviews/route.ts`, `auth.ts`) use `@/lib/types`.
**How to avoid:** Always `import { PublicUserDto, ... } from '@/lib/types'` in web files. Add `PublicUserDto` to `apps/web/lib/types.ts` re-export if it is not there automatically (it will be if `packages/types/src/index.ts` is the source and the re-export is a wildcard `export *`).
**Warning signs:** TypeScript build error "Cannot find module '@local/types'".

### Pitfall 3: Integer/string ID mismatch at the API boundary
**What goes wrong:** `job.providerId` and `job.clientId` in `JobDto` are strings (e.g. `"42"`). The URL param `[id]` is also a string. `users.id` is a Drizzle `serial` (integer). Passing the string directly to `eq(users.id, id)` may silently fail or return no rows.
**Why it happens:** PostgreSQL will coerce in many cases but Drizzle type safety may not catch this at compile time.
**How to avoid:** Always `parseInt(id, 10)` the URL param and check `isNaN(userId)` before the database query. Pattern is already in `jobs/[id]/route.ts` lines 13-15.
**Warning signs:** Endpoint returns 404 for valid user IDs.

### Pitfall 4: Schema.ts and SQL migration out of sync
**What goes wrong:** Developer adds `name` and `avatarUrl` to `schema.ts` but omits or misnames the columns in the SQL file (or vice versa). Drizzle then generates queries that reference columns the database does not have.
**Why it happens:** This project hand-writes migrations; there is no `drizzle-kit generate` step in the workflow. The SQL file and TypeScript schema must be manually kept in sync.
**How to avoid:** Treat the migration and schema.ts update as a single atomic task in the plan. Verify column names match exactly: `name` ↔ `"name"`, `avatarUrl` ↔ `"avatar_url"`.
**Warning signs:** `column "name" does not exist` PostgreSQL error at runtime.

### Pitfall 5: Migration file numbering
**What goes wrong:** The `apps/web/drizzle/` directory contains two `0000_*` files (`0000_absent_iron_fist.sql` and `0000_initial_user.sql`). This is irregular. Blindly naming the next file `0001_*` would duplicate the `0001_lean_juggernaut.sql` that already exists.
**Why it happens:** Historical inconsistency in migration naming.
**How to avoid:** The next migration prefix is `0002_`. Verify by listing the drizzle directory before writing the file name.
**Warning signs:** Duplicate migration prefix causes Drizzle's migration tracker to behave unpredictably.

### Pitfall 6: Existing `/dashboard/provider/[id]/page.tsx` partial implementation
**What goes wrong:** A partial provider profile page already exists at `apps/web/app/dashboard/provider/[id]/page.tsx`. It fetches reviews but hardcodes "Service Provider" as the heading and skips the `/api/users/[id]` call. If the new page is created at `/providers/[id]` without handling the old route, both routes exist with inconsistent data.
**Why it happens:** Phase 13 adds the full implementation at a new URL; the old page was a placeholder.
**How to avoid:** See Open Questions below — the planner must decide between replace-in-place vs. new route + old route deletion.
**Warning signs:** Navigating to `/dashboard/provider/[id]` shows stale hardcoded heading.

---

## Code Examples

All analog code patterns are in `13-PATTERNS.md`. Critical constraints that are NOT in PATTERNS.md:

### PublicUserDto DTO mapping (safe projection)
```typescript
// Source: D-10, CONTEXT.md + passwordHash exclusion constraint
const dto: PublicUserDto = {
  id: String(row.id),
  email: row.email,
  name: row.name ?? null,
  avatarUrl: row.avatarUrl ?? null,
  role: row.role as Role,
  createdAt: row.createdAt.toISOString(),
}
// Do NOT: return row directly or spread row into any response object.
```

### Average star rating formula
```typescript
// Source: CONTEXT.md §Specifics + reviews/route.ts lines 396-434
// averageRatings is pre-computed by GET /api/reviews?userId=X&approved=true
const avg = (averageRatings.communication + averageRatings.quality + averageRatings.punctuality) / 3
// Show "No rating yet" when avg === 0 or when there are no qualifying reviews
const displayRating = avg > 0 ? avg.toFixed(1) : 'No rating yet'
```

---

## State of the Art

No new patterns introduced; all changes are additive to existing conventions.

| Existing Pattern | This Phase Extends It With |
|-----------------|---------------------------|
| `GET /api/jobs/[id]` route structure | New `GET /api/users/[id]` following identical shape |
| `JobDto` with raw ID strings | `PublicUserDto` resolved from those IDs via separate fetch |
| `checkReviewStatus` secondary fetch in `JobDetailCard.tsx` | Provider identity fetch following same useEffect pattern |
| `getJob()` in `apps/mobile/lib/api.ts` | New `getUser()` following identical signature |
| `dashboard/provider/[id]/page.tsx` partial | Full implementation at `providers/[id]/page.tsx` |

---

## Runtime State Inventory

SKIPPED — this phase is not a rename/refactor. The schema migration adds two new nullable columns; no existing data is renamed or migrated.

---

## Environment Availability

SKIPPED — no external dependencies beyond the existing project stack. Neon PostgreSQL connection is already established; no new services required.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest (detected: `apps/web/components/dashboard/__tests__/`) |
| Config file | check for `jest.config.*` at repo root or `apps/web/` |
| Quick run command | `cd apps/web && npx jest --testPathPattern=users --passWithNoTests` |
| Full suite command | `cd apps/web && npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| IDENTITY-04 | `GET /api/users/[id]` returns `PublicUserDto`, no `passwordHash` | unit/integration | `npx jest --testPathPattern=api/users` | Wave 0 |
| IDENTITY-04 | `GET /api/users/[id]` returns 401 when unauthenticated | unit | same | Wave 0 |
| IDENTITY-04 | `GET /api/users/[id]` returns 404 for unknown id | unit | same | Wave 0 |
| IDENTITY-05 | Schema migration adds nullable `name` + `avatar_url` columns | manual (DB inspection) | n/a | manual-only |
| IDENTITY-01 | Web job card renders provider identity section when `providerId` set | component | `npx jest --testPathPattern=JobDetailCard` | Wave 0 |
| IDENTITY-01 | Web job card renders nothing in identity section when `providerId` null | component | same | Wave 0 |
| IDENTITY-03 | Provider profile page renders avatar, email, name, member-since | component/smoke | `npx jest --testPathPattern=providers` | Wave 0 |
| IDENTITY-03 | Provider profile page shows "No reviews yet" empty state | component | same | Wave 0 |
| IDENTITY-02 | Mobile identity section renders after job loads | manual/E2E | n/a | manual-only |

**IDENTITY-05 and IDENTITY-02** are marked manual-only because schema migration verification requires a live DB and mobile E2E requires a device/emulator.

### Sampling Rate

- **Per task commit:** `cd apps/web && npx jest --testPathPattern="(users|JobDetailCard)" --passWithNoTests`
- **Per wave merge:** `cd apps/web && npx jest`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `apps/web/app/api/users/__tests__/route.test.ts` — covers IDENTITY-04 (GET success, 401, 404, no passwordHash)
- [ ] `apps/web/components/dashboard/__tests__/JobDetailCard.identity.test.tsx` — covers IDENTITY-01 (provider section rendered / hidden)
- [ ] `apps/web/app/providers/__tests__/page.test.tsx` — covers IDENTITY-03 (profile data render, empty state)

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `apps/web/lib/types.ts` is a wildcard re-export of `packages/types/src/index.ts` — adding `PublicUserDto` there automatically exposes it via `@/lib/types` in web | Standard Stack / Pitfall 2 | Web routes would need an explicit named re-export added; otherwise type import fails |

**Verification note:** `apps/web/lib/types.ts` was read and confirmed as a local copy/mirror of the shared types file (comment on line 1-2). `PublicUserDto` must be added to BOTH `packages/types/src/index.ts` AND `apps/web/lib/types.ts`. [VERIFIED: direct file read]

*(After reading the file: it is a full copy, not a re-export. Both files must be updated. Assumption A1 is RESOLVED: **update both files**.)*

---

## Open Questions

1. **Old provider profile route: replace or keep?**
   - What we know: `apps/web/app/dashboard/provider/[id]/page.tsx` exists as a partial implementation — fetches reviews but has hardcoded "Service Provider" heading and no `/api/users/[id]` call.
   - What's unclear: CONTEXT.md does not specify whether to delete the old route or leave it.
   - Recommendation: The planner should explicitly decide. Options — (a) replace in place: move implementation to `/providers/[id]/page.tsx` and delete `/dashboard/provider/[id]/page.tsx`; (b) parallel routes: new page at `/providers/[id]`, old route left (but stale). Option (a) is cleaner; option (b) risks confusing future developers.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase reads: `apps/web/lib/db/schema.ts`, `apps/web/lib/auth.ts`, `apps/web/app/api/jobs/[id]/route.ts`, `apps/web/app/api/reviews/route.ts`, `apps/mobile/lib/api.ts`, `apps/mobile/app/(app)/jobs/[id].tsx`, `packages/types/src/index.ts`, `apps/web/components/dashboard/JobDetailCard.tsx`, `apps/web/app/dashboard/provider/[id]/page.tsx`, `apps/web/lib/types.ts`
- `.planning/phases/13-provider-client-identity/13-CONTEXT.md` — locked decisions D-01 through D-11
- `.planning/phases/13-provider-client-identity/13-PATTERNS.md` — file-by-file analog code (authoritative for implementation patterns)
- `.planning/phases/13-provider-client-identity/13-UI-SPEC.md` — visual and interaction contracts

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — IDENTITY-01 through IDENTITY-05 requirement text and acceptance criteria

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — existing stack, no new dependencies
- Architecture: HIGH — all decisions locked; analog code in PATTERNS.md
- Pitfalls: HIGH — all verified via direct file reads
- Validation: MEDIUM — Jest detected from existing test file; config location not confirmed

**Research date:** 2026-05-14
**Valid until:** 2026-06-14 (stable stack; expires only if packages are upgraded or schema changes)
