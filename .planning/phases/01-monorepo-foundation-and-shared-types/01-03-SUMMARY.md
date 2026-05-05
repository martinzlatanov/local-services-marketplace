---
phase: 01-monorepo-foundation-and-shared-types
plan: 03
subsystem: apps
tags: [next-js, expo, react-native, workspace, tsconfig, smoke-test, type-resolution]

dependency_graph:
  requires: ["01-01", "01-02"]
  provides:
    - "apps/web Next.js 16 App Router workspace extending tsconfig.base.json"
    - "apps/mobile Expo SDK 55 workspace extending tsconfig.base.json"
    - "End-to-end @local/types resolution proven in both bundlers (Turbopack + Metro)"
  affects:
    - "all subsequent phases using apps/web or apps/mobile"

tech_stack:
  added:
    - "next@16.2.4 (apps/web)"
    - "react@19.2.5 (exact pin — both apps, single hoisted copy)"
    - "react-dom@19.2.5 (apps/web)"
    - "expo@55.0.20 (apps/mobile)"
    - "react-native@0.85.2 (apps/mobile)"
    - "expo-status-bar@~3.0.0 (apps/mobile)"
  patterns:
    - "Manual scaffold (no create-next-app / create-expo-app) to keep tsconfig under control"
    - "transpilePackages: ['@local/types'] in next.config.ts for Turbopack resolution"
    - "Expo SDK 55 built-in monorepo support — no metro.config.js needed"
    - "Exact React version pin (19.2.5) in both apps to prevent Metro duplicate-React error"

key_files:
  created:
    - apps/web/package.json
    - apps/web/tsconfig.json
    - apps/web/next.config.ts
    - apps/web/app/layout.tsx
    - apps/web/app/page.tsx
    - apps/mobile/package.json
    - apps/mobile/tsconfig.json
    - apps/mobile/app.json
    - apps/mobile/App.tsx
    - apps/mobile/index.ts
  modified:
    - package-lock.json

decisions:
  - "Manual scaffold over create-next-app/create-expo-app: scaffold tools generate standalone tsconfigs that don't extend tsconfig.base.json, causing strict-mode drift"
  - "jsx: preserve override in apps/web/tsconfig.json: required by Turbopack; base uses react-jsx for Expo compatibility"
  - "transpilePackages in next.config.ts: required for Next.js/Turbopack to process raw TS source from @local/types"
  - "No metro.config.js: Expo SDK 55 has built-in workspace/monorepo support since SDK 52"
  - "Exact react@19.2.5 pin (no caret): prevents npm from resolving different patch versions across apps/web and apps/mobile, which would break Metro's duplicate-React detection"

metrics:
  duration: "12min"
  completed: "2026-05-05"
  tasks_completed: 3
  files_created: 10
---

# Phase 1 Plan 03: App Scaffolding Summary

**apps/web (Next.js 16 App Router) and apps/mobile (Expo SDK 55) scaffolded as workspace members with shared tsconfig.base.json inheritance and end-to-end @local/types resolution proven via JobStatus smoke imports in both bundlers**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-05-05
- **Tasks:** 3 of 3 (Task 3 was verification-only, no file changes)
- **Files created:** 10

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Scaffold apps/web (Next.js 16) wired to @local/types | f70bcac | apps/web/package.json, tsconfig.json, next.config.ts, app/layout.tsx, app/page.tsx |
| 2 | Scaffold apps/mobile (Expo SDK 55) wired to @local/types | 0a5bfbf | apps/mobile/package.json, tsconfig.json, app.json, App.tsx, index.ts |
| 3 | Verify monorepo-wide typecheck and audit for type duplication | (no commit — verification only) | — |

## What Was Built

**apps/web** — Next.js 16 App Router workspace:
- `package.json`: declares `@local/types: *`, `next@16.2.4`, `react@19.2.5` (exact), `react-dom@19.2.5`
- `tsconfig.json`: extends `../../tsconfig.base.json`, overrides `jsx: preserve` (Next.js/Turbopack requirement)
- `next.config.ts`: `transpilePackages: ['@local/types']` for raw TS source resolution
- `app/layout.tsx`: minimal App Router root layout
- `app/page.tsx`: smoke import — `import { JobStatus } from '@local/types'`, uses `JobStatus.PENDING`

**apps/mobile** — Expo SDK 55 workspace:
- `package.json`: declares `@local/types: *`, `expo@55.0.20`, `react@19.2.5` (exact), `react-native@0.85.2`
- `tsconfig.json`: extends `../../tsconfig.base.json`, `jsx: react-jsx`
- `app.json`: minimal Expo config with `newArchEnabled: true`
- `index.ts`: `registerRootComponent` entry point
- `App.tsx`: smoke import — `import { JobStatus } from '@local/types'`, uses `JobStatus.PENDING`

## Verification Results

All Task 3 checks passed:

- `npm run typecheck --workspace=packages/types`: exits 0
- `npm run typecheck --workspace=apps/web`: exits 0
- `npm run typecheck --workspace=apps/mobile`: exits 0
- Type duplication audit: 0 matches for D-08 type names under `apps/`
- `@local/types` import count: exactly 2 files (one per app)
- React version: single hoisted version `react@19.2.5` (all other entries are `deduped`)
- `apps/api` directory: absent (D-01 honored)
- `apps/mobile/metro.config.js`: absent (Expo SDK 55 built-in support honored)

## Deviations from Plan

None — plan executed exactly as written. All files match the verbatim specifications in the plan. No fixes were required.

## Known Stubs

- `apps/web/app/page.tsx`: renders `JobStatus.PENDING` hardcoded — intentional per plan. This is a smoke-test stub; real data wiring belongs to Phase 2+.
- `apps/mobile/App.tsx`: renders `JobStatus.PENDING` hardcoded — same intentional smoke-test stub.

These stubs do not prevent the plan's goal (type resolution proof). They are expected placeholders until Phase 2+ wires real data.

## Threat Flags

None — scaffold-only phase with no runtime input, no auth surface, no network endpoints, no data access. As documented in the plan's threat model (T-01-03-N/A), no ASVS L1 categories apply.

## Self-Check: PASSED

- [x] apps/web/package.json — EXISTS
- [x] apps/web/tsconfig.json — EXISTS
- [x] apps/web/next.config.ts — EXISTS
- [x] apps/web/app/layout.tsx — EXISTS
- [x] apps/web/app/page.tsx — EXISTS
- [x] apps/mobile/package.json — EXISTS
- [x] apps/mobile/tsconfig.json — EXISTS
- [x] apps/mobile/app.json — EXISTS
- [x] apps/mobile/App.tsx — EXISTS
- [x] apps/mobile/index.ts — EXISTS
- [x] Commit f70bcac — EXISTS (Task 1)
- [x] Commit 0a5bfbf — EXISTS (Task 2)
