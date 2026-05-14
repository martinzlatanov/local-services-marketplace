---
phase: 13-provider-client-identity
verified: 2026-05-14T22:00:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Open a job detail page on the web client for a job that has been accepted (has a providerId). Verify the Provider section appears below job metadata with an avatar, name/email, and 'View profile' link."
    expected: "Provider identity section renders with AvatarInitials (initials derived from name or email), provider email, and anchor link to /providers/[providerId]."
    why_human: "Depends on live Neon DB columns (name, avatar_url) being applied and a real authenticated session with a job that has an accepted providerId."
  - test: "Navigate to /providers/[id] for an existing provider. Verify profile header shows avatar, name (if set), email, member-since date, star rating (or 'No rating yet'), and review list (or 'No reviews yet.'). Verify error state renders when navigating to a non-existent provider ID."
    expected: "Profile page loads all sections correctly. Empty states and error state match specification strings exactly."
    why_human: "User-visible rendering and data-flow through live API; cannot be verified without a running browser session."
  - test: "Open a job in the mobile app (Expo) where the job has a clientId. Verify the Client identity section appears after the description with a Divider, AvatarInitials (40dp), and the client's email (and name if non-null). Verify the section is absent if getUser fails."
    expected: "Client identity section renders below description. Silent omission on error. No status gate — section appears regardless of job status."
    why_human: "Mobile runtime rendering requires Expo environment; cannot verify React Native output via static analysis."
  - test: "Confirm the live Neon database has the name (character varying 100, nullable) and avatar_url (text, nullable) columns on the users table."
    expected: "psql $DATABASE_URL -c \"\\d users\" shows both columns as nullable with no default."
    why_human: "Migration was applied via psql directly (drizzle-kit push unavailable on v0.18.1). Cannot verify live DB state from codebase alone — only migration SQL file confirms intent, not application."
---

# Phase 13: Provider & Client Identity Verification Report

**Phase Goal:** Add public identity (name, avatar initials, profile page) to both the web and mobile clients so that job detail screens show who posted or accepted the job, and a public provider profile page displays the provider's reviews and rating.
**Verified:** 2026-05-14T22:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Web task detail view shows provider email/name when job has been accepted | ✓ VERIFIED | `JobDetailCard.tsx` lines 66-85: `useEffect` fetches `/api/users/${job.providerId}` and calls `setProviderUser(data.data)`; lines 122-156: JSX section gated on `{job.providerId && ...}` (not status-gated); renders `AvatarInitials`, name (if non-null), email, "View profile" link |
| 2 | Mobile job detail screen shows client email/name to the provider | ✓ VERIFIED | `apps/mobile/app/(app)/jobs/[id].tsx` lines 64-80: `useEffect` calls `getUser(token, job.clientId)`; lines 183-208: renders `Divider`, "Client" label, `AvatarInitials` (size 40), clientUser name/email; no status gate |
| 3 | Provider public profile page at `/providers/[id]` displays profile info and approved reviews with star ratings | ✓ VERIFIED | `apps/web/app/providers/[id]/page.tsx` fully implemented: parallel fetch for `PublicUserDto` + reviews, `AvatarInitials` lg, amber stars (`fill-accent-500`), `ReviewDisplay` component, "No reviews yet.", "No rating yet", "Couldn't load this profile. Refresh to try again.", loading skeleton |
| 4 | `GET /api/users/[id]` returns PublicUserDto with no sensitive fields | ✓ VERIFIED | `apps/web/app/api/users/[id]/route.ts`: auth guard fires first (line 9-10), `isNaN` guard (lines 13-15), DTO built field-by-field (lines 23-30) with `?? null` guards, `passwordHash` absent (grep returns 0), import is `@/lib/types` not `@local/types` (grep returns 0) |
| 5 | Users table has nullable `name` and `avatarUrl` columns; migration exists | ✓ VERIFIED | `apps/web/lib/db/schema.ts` lines 10-11: `name: varchar("name", { length: 100 })` and `avatarUrl: text("avatar_url")` — no `.notNull()`, no `.default()`; `apps/web/drizzle/0002_add_user_identity.sql` has exactly 2 `ADD COLUMN IF NOT EXISTS` lines, no NOT NULL constraint |

**Score:** 5/5 truths verified (code artifacts and wiring confirmed; live DB application requires human check)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/types/src/index.ts` | PublicUserDto exported with correct shape | ✓ VERIFIED | Lines 103-110: all 6 fields present (`id`, `email`, `name`, `avatarUrl`, `role`, `createdAt`); no `passwordHash` |
| `apps/web/lib/types.ts` | Local copy of PublicUserDto | ✓ VERIFIED | Lines 97-104: identical shape; full local copy, not re-export |
| `apps/web/lib/db/schema.ts` | name + avatarUrl nullable columns on users | ✓ VERIFIED | Lines 10-11: both nullable, no constraints |
| `apps/web/drizzle/0002_add_user_identity.sql` | Two idempotent ADD COLUMN statements | ✓ VERIFIED | Exactly 2 `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS` lines |
| `apps/web/app/api/users/[id]/route.ts` | GET handler with auth, NaN, 404, DTO projection | ✓ VERIFIED | All 4 response paths implemented; DTO built field-by-field |
| `apps/web/app/api/users/[id]/__tests__/route.test.ts` | 4-scenario Jest test suite | ✓ VERIFIED | 4 describe blocks: 401, 400, 404, 200; real assertions on response body |
| `apps/web/components/ui/AvatarInitials.tsx` | Presentational avatar with sm/lg sizes | ✓ VERIFIED | Props: name/email/avatarUrl/size; initials logic; avatarUrl image branch; `bg-surface-900 text-surface-0` |
| `apps/web/components/dashboard/JobDetailCard.tsx` | Provider identity section wired | ✓ VERIFIED | State declared; useEffect fetches and sets providerUser; JSX section on `job.providerId` (no status gate); "View profile" link with correct Tailwind classes |
| `apps/web/app/providers/[id]/page.tsx` | Provider profile page with all states | ✓ VERIFIED | Loading skeleton, error state, "No reviews yet.", "No rating yet", `fill-accent-500` stars (not `fill-brand-500`) |
| `apps/web/app/dashboard/provider/[id]/page.tsx` | Deleted — stale stub | ✓ VERIFIED | File does not exist; no residual `dashboard/provider` hrefs found in web app |
| `apps/mobile/lib/api.ts` | `getUser(token, userId)` exported | ✓ VERIFIED | Lines 57-62: correct signature, uses `@local/types`, delegates to `parseResponse<PublicUserDto>` |
| `apps/mobile/components/AvatarInitials.tsx` | Mobile avatar using react-native-paper | ✓ VERIFIED | Uses `Avatar.Image` and `Avatar.Text`; initials logic present; size is numeric dp |
| `apps/mobile/app/(app)/jobs/[id].tsx` | Client identity section wired | ✓ VERIFIED | `clientUser`/`isClientLoading` state; `getUser(token, job.clientId)` in useEffect; Divider; "Client" eyebrow; `AvatarInitials` size=40; silent error handling |
| `apps/web/components/dashboard/__tests__/JobDetailCard.identity.test.tsx` | Wave 0 test stubs | ✓ VERIFIED | File exists |
| `apps/web/app/providers/__tests__/ProviderProfile.test.tsx` | Wave 0 test stubs | ✓ VERIFIED | File exists |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `JobDetailCard.tsx` | `/api/users/[id]` | `fetch` in `useEffect` | ✓ WIRED | `fetch(\`/api/users/${job.providerId}\`)` → `setProviderUser(data.data)` → rendered in JSX |
| `providers/[id]/page.tsx` | `/api/users/[id]` + `/api/reviews` | `Promise.all` in `useEffect` | ✓ WIRED | Parallel fetch; results assigned to state; state rendered in JSX |
| `mobile/jobs/[id].tsx` | `getUser` → `/api/users/${clientId}` | `getUser(token, job.clientId)` in `useEffect` | ✓ WIRED | Fetch → `setClientUser(user)` → rendered conditionally |
| `route.ts` | `users` table | `db.select().from(users).where(eq(users.id, userId)).limit(1)` | ✓ WIRED | Drizzle query; row mapped to DTO field-by-field |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `JobDetailCard.tsx` | `providerUser` | `fetch /api/users/${job.providerId}` → `data.data` | Yes — API route queries DB with `db.select().from(users)` | ✓ FLOWING |
| `providers/[id]/page.tsx` | `providerUser`, `reviews`, `averageRatings` | `Promise.all([/api/users/[id], /api/reviews])` | Yes — both endpoints query DB | ✓ FLOWING |
| `mobile/jobs/[id].tsx` | `clientUser` | `getUser(token, job.clientId)` → `parseResponse` | Yes — delegates to `/api/users/${clientId}` which queries DB | ✓ FLOWING |
| `route.ts` | `dto` | `db.select().from(users).where(eq(users.id, userId))` | Yes — real Drizzle query | ✓ FLOWING |

### Behavioral Spot-Checks

Step 7b: Skipped for API route (test suite covers behavior; running dev server not available in this context).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| IDENTITY-01 | 13-03 | Web task detail shows provider email/name when accepted | ✓ SATISFIED | `JobDetailCard.tsx` provider identity section wired and rendered on `job.providerId` |
| IDENTITY-02 | 13-04 | Mobile job detail shows client email/name | ✓ SATISFIED | `mobile/jobs/[id].tsx` client identity section wired on `job.clientId` |
| IDENTITY-03 | 13-03 | Provider profile page at `/providers/[id]` with reviews and rating | ✓ SATISFIED | `apps/web/app/providers/[id]/page.tsx` fully implemented |
| IDENTITY-04 | 13-02 | `GET /api/users/[id]` returns PublicUserDto without sensitive fields | ✓ SATISFIED | Route file verified; no passwordHash; field-by-field DTO projection |
| IDENTITY-05 | 13-01 | Users table gains optional `name`/`avatarUrl` columns | ✓ SATISFIED | Schema.ts updated; migration SQL file exists and correct; live DB application requires human check |

All 5 IDENTITY requirements claimed in the plan frontmatter are present in REQUIREMENTS.md and map to verified artifacts. No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `mobile/jobs/[id].tsx` | 208 | Client identity `Divider` always rendered even when `clientUser` is null (the "Client" label and Divider appear even when getUser fails) | ℹ️ Info | The plan says "Divider remains" on error — this is intentional per D-02 spec. Not a blocker. |

No stub implementations found. No `return null` / `return {}` / `TODO` placeholders in production code. No hardcoded empty data arrays rendered as final output. No `passwordHash` leaks.

One notable divergence: the `13-01-SUMMARY.md` reports `drizzle-kit push` was unavailable (v0.18.1 has no `push:pg` command) and migration was applied via `psql` directly. The codebase only proves intent (migration SQL exists); whether the columns are live in Neon DB requires human verification.

### Human Verification Required

#### 1. Live DB Column Presence

**Test:** Run `psql $DATABASE_URL -c "\d users"` against the production Neon database.
**Expected:** Output shows `name character varying(100)` (nullable, no default) and `avatar_url text` (nullable, no default) columns on the `users` table.
**Why human:** Migration was applied via `psql` in the worktree session, not via a committed migration runner. The codebase confirms the SQL is correct; live database state cannot be verified statically.

#### 2. Web Provider Identity Rendering (IDENTITY-01)

**Test:** Log in as a client user on the web app. Open a job detail card for a job that has a `providerId` set (status ACCEPTED, IN_PROGRESS, or COMPLETED). Observe the Provider section below the job metadata.
**Expected:** Avatar initials (or image if avatarUrl set), provider name (if non-null), provider email, and "View profile" hyperlink pointing to `/providers/[providerId]`. Section is absent for PENDING jobs with no providerId.
**Why human:** Requires a live Next.js dev session with an authenticated user and a real job record with a populated `providerId`.

#### 3. Provider Profile Page (IDENTITY-03)

**Test:** Navigate to `/providers/[id]` for an existing provider ID (with reviews) and a non-existent ID.
**Expected:** Existing provider: profile header with AvatarInitials (large), email, member-since date, star rating using amber fill, and review list. Non-existent provider: error message "Couldn't load this profile. Refresh to try again." New provider with no reviews: "No reviews yet." and "No rating yet".
**Why human:** User-visible layout, star color, and data accuracy require browser rendering.

#### 4. Mobile Client Identity Rendering (IDENTITY-02)

**Test:** Open the mobile app (Expo) and navigate to a job detail screen for any job (any status). Verify the Client section appears after the description, separated by a horizontal divider, with a 40dp avatar and the client's email. Simulate a network failure for `getUser` and verify the Divider label ("Client") still appears but no avatar/email is shown.
**Expected:** Always-rendered Client section (no status gate). Silent omission of avatar+email content on fetch error. No crash.
**Why human:** React Native / Expo runtime rendering cannot be verified via static file inspection.

---

### Gaps Summary

No code gaps found. All 5 must-have observable truths are backed by substantive, wired, data-flowing artifacts. The phase goal is code-complete.

The only outstanding item requiring human decision is live DB verification of the applied migration — this is an operational confirmation, not a code deficiency. The migration SQL file is correct and idempotent.

---

_Verified: 2026-05-14T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
