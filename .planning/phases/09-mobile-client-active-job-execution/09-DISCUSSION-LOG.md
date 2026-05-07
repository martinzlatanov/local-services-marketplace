# Phase 9: Mobile Client — Active Job Execution - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 09-mobile-client-active-job-execution
**Areas discussed:** Active Jobs API, Status transition UX, COMPLETED job visibility

---

## Active Jobs API

| Option | Description | Selected |
|--------|-------------|----------|
| New GET /api/jobs/mine endpoint | A dedicated route returning ACCEPTED + IN_PROGRESS jobs where providerId = current user. Clean separation, no risk of breaking the existing feed endpoint. | ✓ |
| Extend GET /api/jobs with query params | Add ?providerId=me&status=ACCEPTED,IN_PROGRESS to the existing endpoint. Reuses existing route but adds complexity. | |

**User's choice:** New GET /api/jobs/mine endpoint

| Option | Description | Selected |
|--------|-------------|----------|
| ACCEPTED + IN_PROGRESS only | Active jobs only — "things I still need to work on". COMPLETED jobs managed by client on web. | ✓ |
| ACCEPTED + IN_PROGRESS + COMPLETED | Full history of provider-owned jobs. More data, requires distinguishing completed from active. | |

**User's choice:** ACCEPTED + IN_PROGRESS only

**Notes:** None

---

## Status Transition UX

| Option | Description | Selected |
|--------|-------------|----------|
| Detail screen with dynamic primary CTA | Tapping active job opens /app/jobs/[id]. ACCEPTED shows "Start Work"; IN_PROGRESS shows "Finish Work". Mirrors Phase 8 Accept flow. | ✓ |
| Inline action buttons on list card | Each card in Active Jobs list has a status button directly on it. Faster but less info visible, more complex layout. | |

**User's choice:** Detail screen with dynamic primary CTA

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate back to Active Jobs list | On success, go back to the Active Jobs tab. Consistent with Phase 8's Accept-then-back-to-feed pattern. | ✓ |
| Stay on detail screen, update the button | After Start Work: button changes to "Finish Work". After Finish Work: button disappears or shows "Completed". | |

**User's choice:** Navigate back to Active Jobs list

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse /app/jobs/[id] with conditional rendering | Same route renders differently based on job status. Avoids duplicating the detail layout. | ✓ |
| New /app/active-jobs/[id] route | Separate screen dedicated to active job management. Cleaner separation but duplicates detail layout. | |

**User's choice:** Reuse /app/jobs/[id] with conditional rendering

**Notes:** None

---

## COMPLETED Job Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Job disappears immediately on success | Navigate back to Active Jobs list. Job is no longer returned by GET /api/jobs/mine. Matches accept-then-disappear from Phase 8. | ✓ |
| Job stays with Completed badge | Requires GET /api/jobs/mine to also return COMPLETED jobs or local state retention. More complex. | |

**User's choice:** Job disappears immediately on success

| Option | Description | Selected |
|--------|-------------|----------|
| Refresh on tab focus + pull-to-refresh | List refetches automatically when provider switches to Active Jobs tab. Picks up completed job disappearing. | ✓ |
| Pull-to-refresh only | Simpler. Provider must explicitly swipe down to see updated list. | |

**User's choice:** Refresh on tab focus + pull-to-refresh

**Notes:** None

---

## Claude's Discretion

- Specific Paper component choices for the Active Jobs tab (list item layout, status badge/chip, tab bar icon)
- Loading / empty / error state copy for Active Jobs (e.g., "You have no active jobs")
- Error handling when status transition fails (network error → snackbar, following Phase 8 patterns)
- `updateJobStatus` API helper location in `apps/mobile/lib/api.ts`

## Deferred Ideas

- **WebSocket subscription on Active Jobs tab** — tab-focus refresh + pull-to-refresh is sufficient since provider is sole actor on their active jobs; WS hook deferred as over-engineering for Phase 9
- **Completed job history view** — no history screen in Phase 9; Phase 10+ feature if needed
- **Optimistic UI update after status transition** — navigate-back-and-refetch preferred for simplicity; optimistic updates are a Phase 10 polish item
