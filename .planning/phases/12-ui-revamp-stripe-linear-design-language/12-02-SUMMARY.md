---
phase: 12
plan: "12-02"
subsystem: web-frontend
tags: [landing-page, ui-revamp, stripe-linear, monochrome]
dependency_graph:
  requires: [12-01]
  provides: [landing-page-variant-b]
  affects: [apps/web/app/page.tsx]
tech_stack:
  added: []
  patterns: [split-hero-grid, editorial-table-layout, sticky-nav, pulse-dot-indicator]
key_files:
  modified:
    - apps/web/app/page.tsx
decisions:
  - Removed CITY_AREAS import as City Coverage section was eliminated per plan
  - Preserved all lucide-react icon imports used in categories table
  - Kept data-testid="status" span for existing test compatibility
metrics:
  duration: "~5 minutes"
  completed: "2026-05-14"
  tasks_completed: 1
  tasks_total: 1
---

# Phase 12 Plan 02: Landing Page Variant B Summary

**One-liner:** Rebuilt landing page from teal-gradient hero to Stripe/Linear monochrome split-grid layout with sticky nav, metrics panel, live activity list, numbered feature strip, and categories data table.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 12-02-T1 | Replace full page.tsx with Variant B layout | 6ad7249 | apps/web/app/page.tsx |

## What Was Built

The landing page (`apps/web/app/page.tsx`) was fully rebuilt from the old dark teal-gradient design to the approved Variant B (Structured Editorial) layout:

1. **Sticky Nav** — Logo dot + LocalPro wordmark, Log in / Get started CTAs using `nav-sticky` utility class from 12-01 globals.
2. **Announcement bar** — `pulse-dot` live indicator with "Now live" text.
3. **Split hero grid** — `grid-cols-[1fr_1px_1fr]` with headline+CTAs on left, metrics panel + live activity list on right. Primary CTA uses `bg-surface-900`.
4. **Metrics panel** — 3-column stat grid: 10 city areas / 8 categories / <1h response.
5. **Live activity list** — 3 static rows showing category, area, and time-ago.
6. **Numbered feature strip** — 3-column bordered grid with `01 /`, `02 /`, `03 /` prefixes.
7. **Categories data table** — `<table>` with icon + category name rows and "Browse →" links.
8. **Surface-900 footer** — Monochrome footer replacing old `bg-brand-950` footer.

Removed: gradient hero section, gradient orb divs, City Coverage section, `CITY_AREAS` import, all `bg-gradient-to-br`, `from-brand-950`, `bg-accent-500` classes.

## Deviations from Plan

None — plan executed exactly as written.

## Acceptance Criteria Verification

| Check | Result |
|-------|--------|
| No `bg-gradient-to-br` | PASS |
| No `from-brand-950` | PASS |
| No `bg-accent-500` | PASS |
| Contains `bg-surface-900` | PASS (3 occurrences) |
| Contains `pulse-dot` | PASS (2 occurrences) |
| Contains `nav-sticky` | PASS |
| Contains `Live activity` | PASS |
| Contains `<table` | PASS |
| Contains `Browse →` | PASS |
| Contains `data-testid="status"` | PASS |
| Contains `eyebrow` | PASS (3 occurrences) |

## Known Stubs

None. All data shown (metrics, live activity rows) is intentional static content representing the design — not wired to live data, as these are marketing copy elements.

## Self-Check: PASSED

- File exists: apps/web/app/page.tsx — FOUND
- Commit 6ad7249 — FOUND
