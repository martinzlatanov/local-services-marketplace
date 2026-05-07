---
phase: 08-mobile-client-job-discovery-acceptance
status: complete
created: 2026-05-06
scope: mobile client (Expo) job discovery + acceptance
---

# Phase 8 Research — Mobile Client Job Discovery & Acceptance

## Summary
This phase is mobile-only UI/UX and client integration. Backend endpoints are already implemented in Phase 5 and Phase 6. The mobile app should:
- Capture a provider's service area (device-local) and gate access until set.
- Fetch and display PENDING jobs filtered by cityArea.
- Show a detail screen with a single Accept action (no confirm dialog).
- Handle 409 conflicts by notifying the user and refreshing the feed.
- Subscribe to WebSocket JOB_UPDATED events and drop non-PENDING jobs from the feed.

No new backend routes or schema changes are needed.

## Existing APIs and Contracts (Authoritative)
From @.planning/phases/08-mobile-client-job-discovery-acceptance/08-CONTEXT.md and prior summaries:
- GET /api/jobs?cityArea=<area> returns ApiSuccessResponse<JobDto[]> with only PENDING jobs.
- GET /api/jobs/:id returns ApiSuccessResponse<JobDto>.
- POST /api/jobs/:id/accept with body { version } returns 200 + JobDto or 409 on conflict.
- WebSocket server expects token in query string (?token=...) and emits JOB_UPDATED with JobDto payload.
- Errors use ApiErrorResponse { errors: Record<string, string> }.

## Key Mobile Patterns to Reuse
- Auth token persistence: apps/mobile/contexts/AuthContext.tsx uses Expo SecureStore and Bearer token header.
- Router structure: apps/mobile/app/_layout.tsx sets up PaperProvider + AuthProvider + Stack with headerHidden.
- Expo Router groups: (auth) group already exists; this phase adds (app) group with Tabs.

## Proposed File Touchpoints (No backend changes)
- packages/types/src/index.ts
  - Add CITY_AREAS: readonly string[] export (fixed list).
- apps/mobile/contexts/AuthContext.tsx
  - Keep API_BASE in one place; add service area key constant and helper(s) or a hook in a new file.
- apps/mobile/hooks/useServiceArea.ts (new)
  - Wrapper for SecureStore read/write of service area.
- apps/mobile/hooks/useJobsWebSocket.ts (new)
  - WebSocket subscription logic and JOB_UPDATED handling.
- apps/mobile/lib/api.ts (new)
  - getJobs(cityArea), getJob(id), acceptJob(id, version) using API_BASE and Bearer token.
- apps/mobile/app/(app)/_layout.tsx (new)
  - Tabs (Feed, Settings) and onboarding gate.
- apps/mobile/app/(app)/(tabs)/feed.tsx (new)
  - Jobs list with pull-to-refresh and live updates.
- apps/mobile/app/(app)/(tabs)/settings.tsx (new)
  - Edit service area and logout.
- apps/mobile/app/(app)/onboarding.tsx (new)
  - Force-pick service area before entering Tabs.
- apps/mobile/app/(app)/jobs/[id].tsx (new)
  - Job detail with Accept button and 409 handling.

## Technical Notes and Pitfalls
- SecureStore is async; avoid rendering tabs until service area is loaded. Use a loading state in onboarding gate.
- Use the same auth token for HTTP and WebSocket (Bearer header for HTTP; query param for WS).
- When receiving JOB_UPDATED, if job.status !== PENDING, remove from local list; if still PENDING, update in place.
- On accept success, remove job from feed and navigate back to Feed.
- On 409, show Snackbar and refetch feed. Do not depend on error text.
- Avoid React web-specific features (no "use client" in React Native files).
- Keep types in packages/types only; do not duplicate JobDto or enums in mobile.

## Open Decisions (none)
All product decisions are locked in CONTEXT.md. UI choices (Paper components, empty states) are discretionary.

## Validation Notes (non-blocking)
Since research_enabled is false, no VALIDATION.md is required for this run.

## References
- .planning/phases/08-mobile-client-job-discovery-acceptance/08-CONTEXT.md
- .planning/phases/03-auth-client-integration/03-05-SUMMARY.md
- .planning/phases/06-real-time-infrastructure/06-02-SUMMARY.md
- packages/types/src/index.ts
- apps/mobile/contexts/AuthContext.tsx
