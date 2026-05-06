# Phase 8: Mobile Client — Job Discovery & Acceptance - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-06
**Phase:** 08-mobile-client-job-discovery-acceptance
**Areas discussed:** Service area storage & input, Onboarding flow, Feed refresh strategy, Acceptance UX

---

## Service area storage & input

### Q1: Where should the provider's selected service area be persisted?

| Option | Description | Selected |
|--------|-------------|----------|
| SecureStore on device only | No backend change; local persistence; mobile sends `?cityArea=` on each fetch. Trade-off: device-switch loses setting. | ✓ |
| Column on `users` table | DB-persisted; cross-device; new endpoint to update. Trade-off: drags Phase 8 into a backend migration. | |
| Both — cache locally, sync to DB | Most robust; most work. Probably overkill for capstone. | |

**User's choice:** SecureStore on device only
**Notes:** Keeps Phase 8 mobile-only.

### Q2: Free-text input or fixed dropdown for the area value?

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed dropdown of cities | Hard-coded list in `packages/types` (`CITY_AREAS`); same constant consumed by web and mobile. Eliminates typo-driven empty feed. | ✓ |
| Free-text input | Provider types area; exact-string match against jobs. Trade-off: typos / case differences silently produce empty feeds. | |
| Free-text with autocomplete from existing jobs | Suggest from PENDING jobs; more work, marginal value. | |

**User's choice:** Fixed dropdown of cities
**Notes:** Constant lives in `packages/types`; future Phase 7 polish should adopt it.

---

## Onboarding flow

### Q1: When and how should the provider set their service area?

| Option | Description | Selected |
|--------|-------------|----------|
| Forced one-time onboarding screen | Block access to feed until area is picked; editable later in Settings. | ✓ |
| Profile/settings only — unset = show all PENDING | Lazy: feed shows everything until provider filters. | |
| Inline filter bar at top of feed | City picker chip doubles as filter and storage trigger. | |

**User's choice:** Forced one-time onboarding screen
**Notes:** Single deterministic flow; clear capstone demo.

### Q2: Post-login mobile navigation structure?

| Option | Description | Selected |
|--------|-------------|----------|
| `(app)` route group with bottom tabs | Mirror `(auth)` pattern; Tabs for Feed and Settings now (Active Jobs in Phase 9). | ✓ |
| Single Stack, no tabs yet | Stack-push from index; tabs added in Phase 9. Simpler now, refactor later. | |
| `(app)` group with stack only, defer tabs to Phase 9 | Compromise: group now, tabs later. | |

**User's choice:** `(app)` route group with bottom tabs
**Notes:** Tabs are added now; Active Jobs slot reserved for Phase 9.

---

## Feed refresh strategy

### Q1: How should the PENDING-jobs feed stay fresh on the mobile Feed tab?

| Option | Description | Selected |
|--------|-------------|----------|
| Pull-to-refresh + WebSocket subscription | Subscribe to Phase 6 `JOB_UPDATED`; pull-to-refresh as fallback. Reuses existing infra. | ✓ |
| Pull-to-refresh + polling | Polling on a timer + manual pull. Simpler; not real-time. | |
| Pull-to-refresh only | No live updates; stale feed; lightest implementation. | |

**User's choice:** Pull-to-refresh + WebSocket subscription
**Notes:** Mobile mirrors the web dashboard's WS pattern.

### Q2: On `JOB_UPDATED`, how should the feed react?

| Option | Description | Selected |
|--------|-------------|----------|
| Remove job if status ≠ PENDING | Single rule; prevents stale "tap to accept" on already-taken jobs. | ✓ |
| Refetch entire filtered list on every event | Simplest; wasteful network. | |
| Apply event payload, then filter status === PENDING | Equivalent to option 1, slightly more code. | |

**User's choice:** Remove job if status ≠ PENDING

---

## Acceptance UX

### Q1: Where does the `Accept` action live?

| Option | Description | Selected |
|--------|-------------|----------|
| Detail screen with primary `Accept` button | Tap card → `/(app)/jobs/[id]`; single primary Accept at the bottom. Honors DISC-03. | ✓ |
| Detail screen + confirm dialog before submit | Same plus a Paper Dialog ("Accept this job?"). Extra tap; protects against fat-finger. | |
| Inline accept on each card | No detail step; faster but violates DISC-03. | |

**User's choice:** Detail screen with primary `Accept` button (no confirm dialog)
**Notes:** Single tap; matches DISC-03.

### Q2: When `POST /api/jobs/:id/accept` returns 409, what does the provider see?

| Option | Description | Selected |
|--------|-------------|----------|
| Snackbar/toast + auto-navigate back to feed + refetch | Paper Snackbar "Job already taken"; auto-back; refetch. Matches roadmap success criterion #3. | ✓ |
| Inline error banner on the detail screen + manual `Back to feed` button | Provider stays on detail; banner explains; tap Back. More taps. | |
| Modal dialog blocking until dismissed, then auto-back | Heavier UI; only justified for high-stakes errors. | |

**User's choice:** Snackbar + auto-navigate back to feed + refetch

### Q3: Acceptance request — what `version` value goes in the body?

| Option | Description | Selected |
|--------|-------------|----------|
| Use `JobDto.version` from the cached/fetched detail | Send the version loaded on the detail screen; rely on 409 path for staleness. | ✓ |
| Always send `version: 1` | Convenient; brittle if version ever drifts. | |
| Refetch the job right before accept | Narrows race window slightly; extra round-trip per acceptance. | |

**User's choice:** Use `JobDto.version` from the cached/fetched detail

---

## Claude's Discretion

- Specific Paper component styling (Card variant, list spacing, typography) — match Phase 3 auth screens
- Loading / empty / error states UI on the Feed
- WebSocket reconnect cadence on mobile (web uses 3s)
- Settings screen layout and "Edit area" interaction

## Deferred Ideas

- Phase 7 polish: web post-job form should adopt the new `CITY_AREAS` constant
- Persist `service_area` on the `users` table (v2)
- `API_BASE` configuration via `expo-constants` (Phase 10)
- Mobile WS reconnect tuning (only if demo surfaces flakiness)
- Loading skeleton vs spinner choice (Phase 10 polish)
