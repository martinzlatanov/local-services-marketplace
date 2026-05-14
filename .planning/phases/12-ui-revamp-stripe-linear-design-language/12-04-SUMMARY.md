---
phase: 12
plan: "12-04"
subsystem: web-ui
tags: [dashboard, layout, stats-strip, numbered-panels]
dependency_graph:
  requires: ["12-01"]
  provides: ["ClientDashboard numbered-panel layout"]
  affects: ["apps/web/components/dashboard/ClientDashboard.tsx"]
tech_stack:
  added: []
  patterns: ["stats-strip grid", "numbered panel eyebrow", "underline tab bar"]
key_files:
  created: []
  modified:
    - apps/web/components/dashboard/ClientDashboard.tsx
decisions:
  - "Pill-tab container (bg-surface-100 p-1 rounded) removed in favour of underline border-b-2 active tab pattern"
  - "Stats displayed as 4-cell bordered grid with font-mono large numbers"
  - "Amber warning classes replaced with surface-500/surface-50 neutral palette per must_haves constraint"
metrics:
  duration: "< 5 min"
  completed: "2026-05-14"
---

# Phase 12 Plan 04: Client Dashboard Summary

**One-liner:** Rebuilt ClientDashboard return JSX from pill-tab layout to eyebrow header + 4-cell stats strip + numbered two-panel grid with underline tab bar.

## What Was Done

Task 12-04-T1: Rewrote only the `return (...)` JSX in `ClientDashboard.tsx`. All state, hooks, data-fetching logic (fetchReceivedReviews, useEffect, filteredJobs, counts) and child component calls were preserved unchanged.

### Changes summary

- Removed `<div className="mt-6">` root wrapper + pill-tab container (`bg-surface-100 p-1 rounded-[var(--radius-btn)]`)
- Added eyebrow/h1 page header with subtext
- Added 4-cell stats strip (Posted / Active / Completed / Pending) with font-mono numbers
- Replaced flat two-column layout with bordered two-panel grid (`lg:grid-cols-[2fr_3fr]`), each panel labeled `01 /` and `02 /`
- Replaced pill tabs with underline tab bar (`border-b-2 border-surface-900` active state)
- Job sub-tabs retained but switched active class to `bg-surface-900 text-white`
- Removed amber classes (`text-amber-700 bg-amber-50 border-amber-200`) from empty-state notice; replaced with neutral surface palette

## Acceptance Criteria Verification

| Criterion | Result |
|-----------|--------|
| Contains `01 /` | PASS |
| Contains `02 /` | PASS |
| Contains `eyebrow` class | PASS |
| Contains `grid-cols-4` (stats strip) | PASS |
| Does NOT contain `bg-surface-100 p-1 rounded` (old pill tabs) | PASS |
| Contains `border-surface-900` (active tab underline) | PASS |
| Contains `fetchReceivedReviews` (logic preserved) | PASS |
| Contains `filteredJobs` (filter logic preserved) | PASS |
| No amber classes | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed amber classes from empty-state notice**
- **Found during:** Task 12-04-T1
- **Issue:** Original file used `text-amber-700 bg-amber-50 border-amber-200` on the empty-jobs notice; plan `<must_haves>` explicitly forbids amber classes
- **Fix:** Replaced with `text-surface-500 bg-surface-50 border-surface-200`; also updated message text from "Job history resets on refresh — full history view coming soon." to "No jobs yet — post one using the form on the left." per plan JSX
- **Files modified:** `apps/web/components/dashboard/ClientDashboard.tsx`
- **Commit:** `050f149`

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced.

## Self-Check: PASSED

- `apps/web/components/dashboard/ClientDashboard.tsx` modified and committed at `050f149`
- All acceptance criteria verified via grep
- Pre-existing TypeScript errors in `apps/mobile` are unrelated to this plan
