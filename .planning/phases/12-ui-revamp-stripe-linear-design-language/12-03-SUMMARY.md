---
phase: 12
plan: "12-03"
subsystem: web-auth
tags: [ui, auth, login, register, split-panel, design-system]
dependency_graph:
  requires: [12-01, 12-02]
  provides: [auth-pages-revamped]
  affects: [apps/web/app/login/page.tsx, apps/web/app/register/page.tsx]
tech_stack:
  added: []
  patterns: [split-panel-layout, surface-900-left-panel, role-picker-cards, password-strength-bar]
key_files:
  created: []
  modified:
    - apps/web/app/login/page.tsx
    - apps/web/app/register/page.tsx
decisions:
  - "Removed Wrench import from login page — replaced by logo-dot span; Loader2 and XCircle retained"
  - "Removed Wrench and User imports from register page — role cards use emoji icons instead of lucide icons"
  - "focus:border-brand-500 and focus:ring-brand-500/10 retained on inputs — permitted focus-state classes, not the prohibited active-card brand styling"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-14"
  tasks_completed: 2
  files_modified: 2
---

# Phase 12 Plan 03: Auth Pages — Login + Register Summary

**One-liner:** Both auth pages rebuilt to surface-900 split-panel design with role picker cards and password strength bar, all form logic preserved verbatim.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 12-03-T1 | Rebuild login/page.tsx — surface-900 split panel | dca954a | apps/web/app/login/page.tsx |
| 12-03-T2 | Rebuild register/page.tsx — role picker cards + strength bar | 54539f1 | apps/web/app/register/page.tsx |

## What Was Built

**Login page (T1):**
- Left panel: `bg-surface-900` fixed dark panel with logo-dot, "Welcome back." heading, icon-tile feature rows (🎯 ⚡ ✨), and stat row (10 city areas / 8 categories / <1h response)
- Right panel: bare `bg-surface-50` layout (no card wrapper), `eyebrow` step label, `bg-surface-900 hover:opacity-[0.88]` submit button, `focus:ring-brand-500/10` focus rings on inputs
- Removed: `bg-gradient-to-br from-brand-700 to-brand-900`, `bg-brand-600`, `Wrench` import

**Register page (T2):**
- Left panel: identical shell to login with "Join the community." heading and "Create account" eyebrow
- Role picker: 2-column card grid with `border-surface-900 shadow-[0_0_0_1px_#0f172a]` active state, filled radio dot indicator (no border-brand-500)
- Password strength bar: derived from existing `password` state via `strengthPercent`/`strengthLabel`/`strengthColor` — no new useState
- Submit button: `bg-surface-900 hover:opacity-[0.88]` replacing `bg-brand-600 hover:bg-brand-700`
- Removed: `bg-gradient-to-br from-brand-700 to-brand-900`, `bg-brand-600`, `border-brand-500 ring-brand-500`, `Wrench` and `User` imports

## Acceptance Criteria Verification

**Login:**
- `bg-gradient-to-br`: absent
- `from-brand-700`: absent
- `bg-brand-600`: absent
- `bg-surface-900`: 2 matches (left panel + submit button)
- `focus:ring-brand-500/10`: 2 matches
- `Welcome back.`: present
- `handleSubmit`: present
- `router.push('/dashboard')`: present

**Register:**
- `bg-gradient-to-br`: absent
- `from-brand-700`: absent
- `bg-brand-600`: absent
- `border-brand-500` (active card): absent
- `ring-2 ring-brand-500` (active card ring): absent
- `border-surface-900`: 2 matches
- `bg-surface-900`: 3 matches
- `strengthPercent`: 5 matches
- `Join the community`: present
- `handleSubmit`: present
- `router.push('/dashboard')`: present

## Deviations from Plan

None — plan executed exactly as written. The `focus:border-brand-500` and `focus:ring-brand-500/10` classes on inputs are explicitly specified in the plan's JSX for both pages and are not forbidden by acceptance criteria.

## Known Stubs

None — both pages are fully wired to their existing auth contexts and API routes.

## Self-Check: PASSED

- `dca954a` confirmed in git log
- `54539f1` confirmed in git log
- `apps/web/app/login/page.tsx` contains `bg-surface-900`, `Welcome back.`, `handleSubmit`
- `apps/web/app/register/page.tsx` contains `bg-surface-900`, `border-surface-900`, `strengthPercent`, `Join the community`, `handleSubmit`
