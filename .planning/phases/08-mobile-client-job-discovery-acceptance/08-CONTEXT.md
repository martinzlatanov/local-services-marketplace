# Phase 8: Mobile Client — Job Discovery & Acceptance - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Mobile (Expo / React Native) screens for the **Provider** role: a logged-in provider sets their service area (one-time forced onboarding), sees a live feed of `PENDING` jobs filtered to that area, opens a job detail screen, and accepts the job. Acceptance success removes the job from the feed; a 409 conflict ("already taken") shows a snackbar and refreshes the feed.

**Requirements covered:** DISC-01, DISC-02, DISC-03 (per `.planning/REQUIREMENTS.md`). Roadmap success criteria #2 and #3 (single-tap Accept + 409 handling) are also part of this phase even though `ACCEPT-*` requirements were implemented backend-side in Phase 5.

**Out of scope (this phase):**
- Active-jobs / lifecycle UI (`LIFECYCLE-01`, `LIFECYCLE-02`) — Phase 9
- Persisting the provider's service area on the backend `users` table — kept device-local for Phase 8
- Map view of jobs — explicitly out of scope per PROJECT.md (city/area manual selection only)
- GPS-based discovery — out of scope per PROJECT.md

</domain>

<decisions>
## Implementation Decisions

### Service Area Storage & Input
- **D-01:** Persist the provider's selected city/area in **Expo SecureStore on device only** (no `users.service_area` column, no new endpoint). Mobile sends `?cityArea=<area>` to the existing `GET /api/jobs` on every fetch. Trade-off: switching devices loses the setting; provider re-picks. Keeps Phase 8 scoped to mobile-only changes.
  - SecureStore key: `service_area` (alongside the existing `auth_token` key in `apps/mobile/contexts/AuthContext.tsx`).
- **D-02:** Service area input is a **fixed dropdown** sourced from a new exported constant `CITY_AREAS` in `packages/types`. Both `apps/mobile` (this phase) and `apps/web` (post-job form, Phase 7 polish) consume this list. Eliminates the empty-feed-due-to-typo failure mode.
  - The constant should be a `readonly string[]` exported from `packages/types/src/index.ts`. Suggested initial values: ~5–10 representative city/area names sufficient for capstone demo.

### Onboarding Flow & Routing
- **D-03:** **Forced one-time onboarding screen.** After login, if SecureStore has no `service_area`, the app navigates to an onboarding route that blocks access to the feed until a city is picked. The same picker is reachable later from a Settings screen for editing.
- **D-04:** **Add a new `(app)` route group** that mirrors the existing `(auth)` group, with **bottom tabs** (`expo-router` Tabs) inside. Tabs in this phase: `Feed` and `Settings`. The `(app)` group's `_layout.tsx` is also where the onboarding gate runs (`useEffect` checks SecureStore; redirects to onboarding if unset, otherwise renders Tabs). Phase 9 will add an `Active Jobs` tab without restructuring auth boundaries.
  - Existing `NavigationGuard` in `apps/mobile/app/_layout.tsx` already routes unauthenticated users to `(auth)`; extend its logic to also route authenticated providers without a service area to onboarding.

### Feed Refresh Strategy
- **D-05:** **Pull-to-refresh + WebSocket subscription** to the existing Phase 6 server. Mobile opens a WebSocket the same way the web dashboard does (token in query string), reusing the `WsEvent` / `JOB_UPDATED` types from `packages/types`. `RefreshControl` on the FlatList provides the manual fallback.
  - Mobile WS URL is derived from the existing `API_BASE = 'http://localhost:3000'` constant in `AuthContext.tsx` — replace `http://` with `ws://`. (Future polish: lift `API_BASE` into an `expo-constants` env config; out of scope for Phase 8.)
- **D-06:** **On `JOB_UPDATED`, drop any job whose new `status !== PENDING`** from the local list, and update-in-place if it's still PENDING. Single rule, prevents stale "tap to accept on already-taken job" race.

### Acceptance UX
- **D-07:** **Detail screen with single primary `Accept` button.** Tapping a card pushes to `/(app)/jobs/[id]`; the detail screen renders the full `JobDto` (category, description, timeframe, cityArea) and a primary `Accept` button at the bottom. **No confirm dialog** — single tap accepts. Honors DISC-03 (view full details before accepting).
- **D-08:** **409 → `react-native-paper` Snackbar "Job already taken" → auto-navigate back to feed → trigger refetch.** Lightweight, recoverable. Matches roadmap success criterion #3.
- **D-09:** **Acceptance request body sends `version` from the loaded JobDto** (`AcceptJobRequest { version }` is already in `packages/types`). The version comes from the same fetch that populated the detail screen — no extra round-trip before submit. The 409 path covers stale-version losses.

### Claude's Discretion
- Specific Paper component choices (Card variant, list spacing, typography sizes) — match the existing Paper aesthetic established by the Phase 3 auth screens.
- Loading / empty / error states UI on the Feed (e.g., spinner during initial fetch, "No jobs in your area" empty copy, "Couldn't load jobs" error with retry).
- WebSocket reconnect cadence on mobile (the web side uses 3s; mobile can mirror or use a sensible default).
- Settings screen layout and the "Edit area" interaction.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specification
- `.planning/PROJECT.md` — core value (atomic acceptance, no stale state), constraints (TypeScript strict, shared types via `packages/types`)
- `.planning/REQUIREMENTS.md` — DISC-01, DISC-02, DISC-03 (Phase 8) and ACCEPT-04 ("second concurrent acceptance returns 409") which the mobile UI must surface correctly
- `.planning/ROADMAP.md` Phase 8 — success criteria (filtered feed, single-tap Accept, 409 handling with feed refresh)

### Architecture & Stack
- `.planning/codebase/STACK.md` — Expo SDK 55, React Native 0.85, react-native-paper, expo-router, expo-secure-store
- `.planning/codebase/ARCHITECTURE.md` — API design patterns, error response contract (`ApiErrorResponse { errors: Record<string, string> }`)

### Backend APIs Consumed (already implemented)
- `apps/web/app/api/jobs/route.ts` — `GET /api/jobs?cityArea=<area>` returns `ApiSuccessResponse<JobDto[]>` of PENDING jobs only (already filters by status and cityArea); 401 if unauthenticated
- `apps/web/app/api/jobs/[id]/route.ts` — `GET /api/jobs/:id` for detail view (single JobDto)
- `apps/web/app/api/jobs/[id]/accept/route.ts` — `POST /api/jobs/:id/accept` body `{ version }`, returns `200 + ApiSuccessResponse<JobDto>` or `409` on version conflict
- `apps/web/lib/auth.ts` — `getAuthenticatedUser` accepts both cookie and `Authorization: Bearer` token (Phase 3 D-02)

### Prior Phase Context
- `.planning/phases/03-auth-client-integration/03-CONTEXT.md` — D-02 (dual auth: Bearer header for mobile), token storage pattern
- `.planning/phases/03-auth-client-integration/03-04-SUMMARY.md` — Expo Router `(auth)` group + NavigationGuard
- `.planning/phases/03-auth-client-integration/03-05-SUMMARY.md` — SecureStore token management
- `.planning/phases/04-backend-job-core-posting-state-machine/04-01-SUMMARY.md` — Jobs schema, `version` column, category enum
- `.planning/phases/05-backend-job-acceptance-and-concurrency/` (both summaries) — `POST /api/jobs/:id/accept` semantics; 200/409 contract; version-based optimistic concurrency
- `.planning/phases/06-real-time-infrastructure/06-01-SUMMARY.md` — WebSocket server, JWT-on-handshake auth (token in query string), `WsEvent`/`JOB_UPDATED` types
- `.planning/phases/06-real-time-infrastructure/06-02-SUMMARY.md` — broadcast on every status change; client subscription pattern (see web reference implementation in `apps/web/app/dashboard/page.tsx`)

### Shared Contracts (read-only reference; new constant added this phase)
- `packages/types/src/index.ts` — `JobDto`, `JobStatus`, `AcceptJobRequest`, `ApiSuccessResponse<T>`, `ApiErrorResponse`, `WsEvent`, `WsEventType`. **Phase 8 adds:** `CITY_AREAS` (readonly string[]).

### Standards
- `Agents.md` — TypeScript strict mode; cross-platform contracts only via `packages/types`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/mobile/contexts/AuthContext.tsx` — already exposes `useAuth()` with token-aware fetch pattern; `API_BASE` constant is the single place to read base URL. Extend with a `useServiceArea()` hook (or expand AuthContext) that wraps SecureStore reads/writes for the area.
- `apps/mobile/app/_layout.tsx` — `NavigationGuard` already gates `(auth)` vs the rest. Extend it (or compose a second guard inside `(app)/_layout.tsx`) to redirect authenticated providers without a service area to onboarding.
- `apps/web/app/dashboard/page.tsx` — reference implementation of the WebSocket subscription pattern (`JOB_UPDATED` handling, reconnect logic, ws URL with token in query). Mobile mirrors this pattern using the React Native `WebSocket` global.
- `react-native-paper` is already wired in `_layout.tsx` (`PaperProvider`); use Paper components (`Card`, `Button`, `Snackbar`, `ActivityIndicator`, `List`, `Appbar`) consistently with Phase 3 auth screens.

### Established Patterns
- **Error response contract:** `{ errors: { field: message } }` — surface `errors.role` ("only_clients_can_post_jobs"), `errors.auth`, etc., as user-facing messages.
- **Bearer auth from mobile:** `Authorization: Bearer ${token}` on every fetch (per Phase 3 D-02). Same goes for the WebSocket: pass token in query string `?token=${token}` (per Phase 6).
- **Vertical slice pattern:** mobile feature reuses existing `packages/types` and existing API routes — no backend modification this phase.

### Integration Points
- New: `apps/mobile/app/(app)/_layout.tsx` — bottom Tabs + service-area gate
- New: `apps/mobile/app/(app)/(tabs)/feed.tsx` — PENDING jobs list with pull-to-refresh + WS subscription
- New: `apps/mobile/app/(app)/(tabs)/settings.tsx` — edit service area
- New: `apps/mobile/app/(app)/jobs/[id].tsx` — detail screen + Accept button + 409 handling
- New: `apps/mobile/app/(app)/onboarding.tsx` — first-run city picker
- New: `apps/mobile/lib/api.ts` (or similar) — typed wrappers for `getJobs(cityArea)`, `getJob(id)`, `acceptJob(id, version)`
- New: `apps/mobile/hooks/useServiceArea.ts` — SecureStore-backed read/write hook
- New: `apps/mobile/hooks/useJobsWebSocket.ts` — WebSocket subscription hook (mirrors web pattern)
- Modified: `apps/mobile/app/_layout.tsx` — relocate the post-auth landing from `index.tsx` to the new `(app)` group; index becomes a redirect or lives inside `(app)`
- Modified: `packages/types/src/index.ts` — add `CITY_AREAS` constant

</code_context>

<specifics>
## Specific Ideas

- The fixed `CITY_AREAS` list lives in `packages/types` so the **web post-job form (Phase 7) can also adopt it** — addresses the "free-text city + dropdown city = empty feed" mismatch. Phase 7 polish, but the constant must be defined this phase regardless.
- Mobile WS URL pattern: `ws://localhost:3000?token=${token}` (mirror of web `ws://${window.location.host}?token=${token}` in `apps/web/app/dashboard/page.tsx:41`).
- 409 path: the API returns `{ errors: { ... } }` with HTTP 409 — mobile checks `res.status === 409` (don't depend on error-message text). Snackbar copy: "Job already taken".

</specifics>

<deferred>
## Deferred Ideas

- **Phase 7 polish:** update the web post-job form (when/if it ships its category+area UI) to consume the new `CITY_AREAS` constant from `packages/types` — currently the web side persists free-text `cityArea`, which can desynchronize with mobile's dropdown.
- **Persist provider service area on the `users` table** — out of scope for capstone, but the right move for cross-device persistence in a v2.
- **`API_BASE` configuration via `expo-constants`** — currently hardcoded to `http://localhost:3000`; productionizing belongs to Phase 10 (deployment).
- **Mobile WS reconnect tuning** — Phase 6's web client uses a fixed 3s delay; revisit only if the capstone demo surfaces flakiness.
- **Loading skeleton vs spinner choice** — visual polish, defer to Phase 10 polish pass.

</deferred>

---

*Phase: 08-mobile-client-job-discovery-acceptance*
*Context gathered: 2026-05-06*
