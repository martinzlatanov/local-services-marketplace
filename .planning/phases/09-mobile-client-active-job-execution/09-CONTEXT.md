# Phase 9: Mobile Client — Active Job Execution - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Mobile (Expo / React Native) screens for the **Provider** role: a logged-in provider sees an "Active Jobs" tab listing the jobs they have accepted (`ACCEPTED` and `IN_PROGRESS`), opens an active job's detail, and transitions it through `ACCEPTED → IN_PROGRESS` ("Start Work") and `IN_PROGRESS → COMPLETED` ("Finish Work"). The backend endpoint for status transitions (`PATCH /api/jobs/:id/status`) is already implemented from Phase 4.

**Requirements covered:** LIFECYCLE-01, LIFECYCLE-02 (per `.planning/REQUIREMENTS.md`).

**Out of scope (this phase):**
- LIFECYCLE-03 (invalid-transition rejection) — backend already enforces this
- LIFECYCLE-04 (WebSocket broadcast on status update) — backend already broadcasts; client dashboard already receives it (Phase 6)
- CLOSE-01 / CLOSE-02 (client-side job closure) — web dashboard, Phase 10
- Ratings & Reviews — Phase 10
- Persisting completed jobs in the Active Jobs view — they disappear on `COMPLETED`

</domain>

<decisions>
## Implementation Decisions

### Active Jobs API
- **D-01:** Add a new **`GET /api/jobs/mine`** endpoint (do not extend the existing `GET /api/jobs`). The new route requires authentication, returns only jobs where `providerId = current user id`, and filters to **`ACCEPTED` and `IN_PROGRESS` statuses only** (not COMPLETED). Keeps the existing jobs endpoint unchanged.
- **D-02:** The endpoint is authenticated via the existing `getAuthenticatedUser` middleware (Bearer token, same pattern as all other job routes).

### Active Jobs Tab
- **D-03:** Add an `active-jobs` tab to the existing `apps/mobile/app/(app)/(tabs)/` directory alongside `feed.tsx` and `settings.tsx`. Tab order: Feed | Active Jobs | Settings. No restructuring of auth boundaries or the `(app)` group layout (per Phase 8 D-04).
- **D-04:** The Active Jobs tab **refreshes on tab focus + pull-to-refresh**. When the provider navigates to the tab, it fetches from `GET /api/jobs/mine` automatically. Pull-to-refresh remains the manual fallback.

### Status Transition UX
- **D-05:** Tapping an active job card navigates to the **existing `/app/jobs/[id]` detail screen** (reuse, no new route). The detail screen renders **conditionally based on `job.status`**:
  - `ACCEPTED` → primary "Start Work" button (`PATCH /api/jobs/:id/status` with `{ status: 'IN_PROGRESS' }`)
  - `IN_PROGRESS` → primary "Finish Work" button (`PATCH /api/jobs/:id/status` with `{ status: 'COMPLETED' }`)
  - `PENDING` → existing "Accept job" button (Phase 8, unchanged)
- **D-06:** After "Start Work" or "Finish Work" succeeds, **navigate back to the Active Jobs list**. Matches the accept-then-back-to-feed pattern from Phase 8.

### COMPLETED Job Visibility
- **D-07:** When "Finish Work" succeeds, the job transitions to `COMPLETED` and **disappears from the Active Jobs list** on the next fetch. `GET /api/jobs/mine` returns `ACCEPTED + IN_PROGRESS` only — COMPLETED jobs are not returned. The list updates naturally on the next tab-focus refresh.
- **D-08:** No "Completed" badge or history view in the Active Jobs tab — the job simply drops out. The client manages the completed job's lifecycle (closure, rating) from the web dashboard.

### Claude's Discretion
- Specific Paper component choices for the Active Jobs tab (list item layout, status badge/chip, icon for the tab bar).
- Loading / empty / error states UI on Active Jobs tab (e.g., "You have no active jobs" empty copy).
- Error handling when "Start Work" / "Finish Work" fails (e.g., network error → snackbar, similar to Phase 8 error patterns).
- The `updateJobStatus` API helper should be added to `apps/mobile/lib/api.ts` alongside the existing `acceptJob` / `getJob` / `getJobs` functions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specification
- `.planning/PROJECT.md` — core value (atomic acceptance, no stale state), constraints (TypeScript strict, shared types via `packages/types`)
- `.planning/REQUIREMENTS.md` — LIFECYCLE-01, LIFECYCLE-02 (Phase 9 requirements); LIFECYCLE-03 (backend validation, already enforced); LIFECYCLE-04 (WS broadcast, already implemented)
- `.planning/ROADMAP.md` Phase 9 — success criteria (Active Jobs tab, Start Work, Finish Work transitions)

### Backend APIs Consumed (already implemented)
- `apps/web/app/api/jobs/[id]/status/route.ts` — `PATCH /api/jobs/:id/status` body `{ status: JobStatus, version?: number }`, role-gated to PROVIDER only, validates state machine transitions, broadcasts WS event; returns `200 + ApiSuccessResponse<JobDto>` or `400`/`403`/`404`
- `apps/web/app/api/jobs/route.ts` — `GET /api/jobs` existing endpoint; **do not modify** (returns PENDING only)

### New Backend API to Implement
- `apps/web/app/api/jobs/mine/route.ts` — NEW: `GET /api/jobs/mine`; authenticated; returns `ApiSuccessResponse<JobDto[]>` of ACCEPTED + IN_PROGRESS jobs for current user

### Mobile Files to Modify / Create
- `apps/mobile/app/(app)/(tabs)/_layout.tsx` — add `active-jobs` tab between Feed and Settings
- `apps/mobile/app/(app)/(tabs)/active-jobs.tsx` — NEW: Active Jobs list screen
- `apps/mobile/app/(app)/jobs/[id].tsx` — MODIFY: add conditional rendering for ACCEPTED/IN_PROGRESS job states (Start Work / Finish Work buttons)
- `apps/mobile/lib/api.ts` — MODIFY: add `getMyJobs(token)` and `updateJobStatus(token, id, status)` helpers

### Shared Contracts
- `packages/types/src/index.ts` — `JobDto`, `JobStatus` (ACCEPTED, IN_PROGRESS, COMPLETED), `UpdateJobStatusRequest { status: JobStatus; version?: number }`, `ApiSuccessResponse<T>`, `ApiErrorResponse`

### Prior Phase Context
- `.planning/phases/08-mobile-client-job-discovery-acceptance/08-CONTEXT.md` — D-04 (Active Jobs tab structure), established patterns (Paper components, token pattern, API_BASE, error contract)
- `.planning/phases/08-mobile-client-job-discovery-acceptance/08-03-SUMMARY.md` — detail screen implementation (`apps/mobile/app/(app)/jobs/[id].tsx`) to understand what to extend

### Architecture
- `.planning/codebase/ARCHITECTURE.md` — API design patterns, error response contract (`ApiErrorResponse { errors: Record<string, string> }`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/mobile/app/(app)/(tabs)/feed.tsx` — reference implementation for the Active Jobs tab: FlatList, RefreshControl, pull-to-refresh, loading/empty/error states, token loading from SecureStore, Paper Card pattern
- `apps/mobile/app/(app)/jobs/[id].tsx` — detail screen to extend: already loads job via `getJob(token, id)`, handles loading/error states, shows Snackbar; extend with conditional CTA based on `job.status`
- `apps/mobile/lib/api.ts` — `parseResponse<T>` helper and existing API functions; add `getMyJobs` and `updateJobStatus` alongside
- `apps/mobile/app/(app)/(tabs)/_layout.tsx` — Tabs layout; add the `active-jobs` screen here with a MaterialCommunityIcons icon
- `react-native-paper` (already wired in `_layout.tsx`): `Card`, `Button`, `Snackbar`, `ActivityIndicator`, `Text`, `Appbar` — consistent with Phase 8 auth screens

### Established Patterns
- **Token loading:** `SecureStore.getItemAsync(TOKEN_KEY)` in a `useEffect`, same in every mobile screen — replicate in `active-jobs.tsx`
- **Bearer auth:** `Authorization: Bearer ${token}` on every fetch; same for new `getMyJobs` call
- **Error response contract:** `{ errors: Record<string, string> }` from `ApiErrorResponse` — surface as Snackbar or inline error text
- **Action-then-navigate-back:** Phase 8 `acceptJob` → navigate back to feed; Phase 9 `updateJobStatus` → navigate back to Active Jobs list (same pattern)
- **Conditional render by status:** detail screen already checks `job.status`-agnostic rendering; extend with an `if/else` on `ACCEPTED` vs `IN_PROGRESS` to pick the right CTA

### Integration Points
- New: `apps/web/app/api/jobs/mine/route.ts` — backend route (Next.js API Route Handler) for `GET /api/jobs/mine`
- Modified: `apps/mobile/app/(app)/(tabs)/_layout.tsx` — add Active Jobs tab
- New: `apps/mobile/app/(app)/(tabs)/active-jobs.tsx` — Active Jobs list screen
- Modified: `apps/mobile/app/(app)/jobs/[id].tsx` — conditional CTA based on job status
- Modified: `apps/mobile/lib/api.ts` — `getMyJobs` and `updateJobStatus` helpers

</code_context>

<specifics>
## Specific Ideas

- The `GET /api/jobs/mine` route should use `and(eq(jobs.providerId, String(user.id)), inArray(jobs.status, [JobStatus.ACCEPTED, JobStatus.IN_PROGRESS]))` in the Drizzle query — mirroring the pattern in `apps/web/app/api/jobs/route.ts`.
- The Active Jobs tab icon suggestion: `MaterialCommunityIcons name="briefcase-clock"` (or similar work-in-progress icon), consistent with Phase 8's `format-list-bulleted` and `cog` icon choices.
- The job detail screen (`apps/mobile/app/(app)/jobs/[id].tsx`) renders one of three CTAs based on `job.status`:
  - PENDING → "Accept job" (Phase 8, unchanged)
  - ACCEPTED → "Start Work" (new, Phase 9)
  - IN_PROGRESS → "Finish Work" (new, Phase 9)
  All three call different API helpers but share the same navigate-back-on-success / Snackbar-on-error structure.

</specifics>

<deferred>
## Deferred Ideas

- **WebSocket subscription on Active Jobs tab** — Since the provider is the sole actor on their own ACCEPTED/IN_PROGRESS jobs, tab-focus refresh + pull-to-refresh is sufficient. A WS hook would be over-engineering for Phase 9.
- **Completed job history view** — The provider has no history screen in Phase 9. If needed, that's a Phase 10+ feature.
- **Optimistic UI update after status transition** — For simplicity, Phase 9 navigates back and lets the list refetch. Optimistic updates (updating local state before the API call confirms) are a Phase 10 polish item.

</deferred>

---

*Phase: 09-mobile-client-active-job-execution*
*Context gathered: 2026-05-07*
