---
phase: 12
plan: "12-01"
subsystem: web-styles
tags: [design-tokens, css, globals, ui-revamp]
dependency_graph:
  requires: []
  provides: [nav-sticky, eyebrow, eyebrow-brand, pulse-dot, progress-track, shadow-auth-neutral]
  affects: [apps/web/app/globals.css]
tech_stack:
  added: []
  patterns: [sticky-nav-blur, eyebrow-label, pulse-animation, progress-dot-line-tracker]
key_files:
  created: []
  modified:
    - apps/web/app/globals.css
decisions:
  - "Updated --shadow-auth to neutral rgb(0 0 0 / 0.08) per D-01 (retire teal tint from shadows)"
  - "New utility classes appended after @layer utilities block — no existing rules touched"
  - "pulse-ring keyframe placed outside @layer to allow animation reference from .pulse-dot"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-05-14"
  tasks_completed: 1
  tasks_total: 1
---

# Phase 12 Plan 01: Design Tokens — globals.css Summary

**One-liner:** Neutral shadow-auth, sticky-nav blur, eyebrow label, pulse-dot, and 4-step progress-track utilities added to globals.css as Wave 1 foundation for all UI revamp plans.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 12-01-T1 | Retire amber from CTA role; add nav and eyebrow utilities | 603bfbc |

## What Was Built

Single targeted edit to `apps/web/app/globals.css`:

1. **`--shadow-auth` updated** — teal-tinted `rgb(13 116 110 / 0.10)` replaced with neutral `rgb(0 0 0 / 0.08)`.

2. **`.nav-sticky`** — 56px sticky nav with `rgba(255,255,255,0.92)` background, `backdrop-filter: blur(12px)`, and 1px `surface-200` border-bottom. Used by all revamped web pages.

3. **`.eyebrow` + `.eyebrow::before`** — 11px uppercase label with 20px `surface-300` line prefix. Used as page section headers across landing, dashboards, and browse.

4. **`.eyebrow-brand::before`** — teal (`brand-500`) line variant for auth left panels.

5. **`.pulse-dot` + `@keyframes pulse-ring`** — 8px green dot with scale/opacity pulse animation at 1.5s cycle. Live indicator for hero activity feed.

6. **`.progress-track`, `.progress-dot`, `.progress-dot.done`, `.progress-dot.active`** — 10px dot nodes with `surface-200` border at rest, `brand-500` for done, `surface-900` for active.

7. **`.progress-line`, `.progress-line.done`** — 2px flex connecting lines between dots; `brand-500` fill when done.

## Acceptance Criteria Verified

- `--shadow-auth: 0 8px 32px 0 rgb(0 0 0 / 0.08)` — PASS
- `.nav-sticky` present — PASS
- `backdrop-filter: blur(12px)` present — PASS
- `.eyebrow` present (3 occurrences: class, ::before, -brand variant) — PASS
- `letter-spacing: 0.1em` present — PASS
- `.pulse-dot` present — PASS
- `pulse-ring` keyframe present — PASS
- `.progress-dot` present (3 occurrences: base, .done, .active) — PASS
- `--color-accent-500: #f59e0b` preserved — PASS
- `--color-brand-500: #14b8a6` preserved — PASS
- `--color-surface-900: #0f172a` preserved — PASS

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan only adds CSS utilities; no data wiring required.

## Threat Flags

None — CSS-only change, no network endpoints, auth paths, or schema changes.

## Self-Check: PASSED

- File exists: `apps/web/app/globals.css` — FOUND
- Commit 603bfbc exists in git log — FOUND
- No unexpected file deletions
