---
phase: 12
plan: "12-05"
subsystem: web-ui
tags: [ui, dashboard, provider, browse, design-system, monochrome]
dependency_graph:
  requires: ["12-01"]
  provides: ["provider-dashboard-ui", "browse-page-ui", "job-card-ui", "provider-job-feed-ui", "active-job-card-ui"]
  affects: ["apps/web/components/dashboard", "apps/web/app/browse"]
tech_stack:
  added: []
  patterns: ["underline-tab-bar", "stacked-filter-list", "data-table", "icon-tile", "progress-track-dots", "two-panel-layout"]
key_files:
  modified:
    - apps/web/components/dashboard/ProviderDashboard.tsx
    - apps/web/app/browse/page.tsx
    - apps/web/components/dashboard/JobCard.tsx
    - apps/web/components/dashboard/ProviderJobFeed.tsx
    - apps/web/components/dashboard/ActiveJobCard.tsx
decisions:
  - "browse/page.tsx table action cell retains JobCard component (display only) — no inline accept on browse page, accept logic lives in ProviderJobFeed on the dashboard"
  - "ActiveJobCard progress track starts at PENDING (4 steps) matching plan spec, preserving full reviews section verbatim"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-14"
  tasks_completed: 5
  files_modified: 5
---

# Phase 12 Plan 05: Provider Dashboard + Browse Page + Job Components Summary

Rebuilt 5 web UI files removing all teal/amber (`bg-brand-600`, `bg-brand-500`) classes and applying the Stripe/Linear monochrome design system — underline tabs, stacked sidebar filter lists, data table, icon tile job cards, and dot/line progress track.

## Tasks Completed

| Task | File | Commit |
|------|------|--------|
| T1 | ProviderDashboard.tsx | 3a91763 |
| T2 | browse/page.tsx | 3b0d0e3 |
| T3 | JobCard.tsx | eb3f3d3 |
| T4 | ProviderJobFeed.tsx | 2278db3 |
| T5 | ActiveJobCard.tsx | b01b581 |

## What Was Built

**ProviderDashboard.tsx** — Eyebrow header + stats strip (grid-cols-4: Available/Active/Completed/Reviews). Underline tab bar with `border-surface-900` active state. Two-panel layout (`lg:grid-cols-[2fr_3fr]`): left panel "01 / Filters" with stacked Location + Category lists (`bg-surface-900` active), right panel "02 / Available Jobs" feeding ProviderJobFeed.

**browse/page.tsx** — Sidebar (`<aside>`) with stacked Location + Category filter lists (`bg-surface-900` active). Main content as `<table>` with thead (Job/Area/Timeframe/Status) and tbody rows. Guard button updated to `bg-surface-900 hover:opacity-[0.88]`.

**JobCard.tsx** — Icon tile pattern: `w-9 h-9 rounded-lg bg-surface-100` with category emoji, body with `tracking-[0.06em] uppercase` category eyebrow + truncated description + MapPin meta, right column with status badge + date.

**ProviderJobFeed.tsx** — Jobs rendered as flex rows with JobCard + inline "Accept →" button (`bg-surface-900 hover:opacity-[0.88]`). First row gets `border-l-[3px] border-l-brand-500` featured accent.

**ActiveJobCard.tsx** — Old `bg-brand-500` width bar replaced with 4-step `progress-track` / `progress-dot` / `progress-line` CSS class track (PENDING → ACCEPTED → IN_PROGRESS → COMPLETED). CTAs use `bg-surface-900 hover:opacity-[0.88]`. Full reviews section preserved verbatim.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data flows from existing state and fetch functions preserved intact.

## Self-Check: PASSED

- apps/web/components/dashboard/ProviderDashboard.tsx: FOUND
- apps/web/app/browse/page.tsx: FOUND
- apps/web/components/dashboard/JobCard.tsx: FOUND
- apps/web/components/dashboard/ProviderJobFeed.tsx: FOUND
- apps/web/components/dashboard/ActiveJobCard.tsx: FOUND
- Commit 3a91763: FOUND
- Commit 3b0d0e3: FOUND
- Commit eb3f3d3: FOUND
- Commit 2278db3: FOUND
- Commit b01b581: FOUND
