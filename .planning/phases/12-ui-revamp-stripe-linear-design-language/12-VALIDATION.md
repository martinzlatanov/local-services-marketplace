---
phase: 12
phase_slug: ui-revamp-stripe-linear-design-language
date: 2026-05-14
---

# Phase 12 Validation Strategy

## Validation Architecture

### Scope
Phase 12 is a pure visual rebuild — no API routes, no database schema changes, no business logic changes. Every validation check targets CSS class names, JSX structure, and React Native StyleSheet values. TypeScript compilation is the primary regression gate.

### Dimension 1 — Token correctness (web)
- `grep -r "bg-accent-500\|bg-brand-600\|bg-brand-700" apps/web --include="*.tsx"` → any match in a button context is a failure
- `grep -r "bg-gradient-to-br from-brand" apps/web --include="*.tsx"` → zero matches
- `grep "bg-surface-900" apps/web/app/login/page.tsx` → at least 1 (submit button)
- `grep "bg-surface-900" apps/web/app/register/page.tsx` → at least 1 (submit button)
- `grep "bg-surface-900" apps/web/app/page.tsx` → at least 1 (hero CTA)

### Dimension 2 — Mobile theme (React Native)
- `grep "primary: '#0f172a'" apps/mobile/app/_layout.tsx` → 1 match
- `grep "secondary: '#14b8a6'" apps/mobile/app/_layout.tsx` → 1 match
- `grep "mode=\"elevated\"" apps/mobile/app/(app)/(tabs)/feed.tsx` → 0 matches
- `grep "mode=\"outlined\"" apps/mobile/app/(app)/(tabs)/feed.tsx` → at least 1

### Dimension 3 — Component logic preservation
- `grep "handleSubmit" apps/web/app/login/page.tsx` → 1 match (form logic unchanged)
- `grep "handleSubmit" apps/web/app/register/page.tsx` → 1 match
- `grep "handleAccept" apps/web/components/dashboard/ProviderDashboard.tsx` → at least 1
- `grep "handleStatusAdvance" apps/web/components/dashboard/ProviderDashboard.tsx` → at least 1
- `grep "fetchReceivedReviews" apps/web/components/dashboard/ClientDashboard.tsx` → at least 1
- `grep "saveServiceArea" apps/mobile/app/(app)/(tabs)/settings.tsx` → at least 1
- `grep "handleAccept" apps/mobile/app/(app)/jobs/\[id\].tsx` → at least 1

### Dimension 4 — No Dialog in settings
- `grep "<Dialog" apps/mobile/app/(app)/(tabs)/settings.tsx` → 0 matches
- `grep "RadioButton" apps/mobile/app/(app)/(tabs)/settings.tsx` → 0 matches
- `grep "<Modal" apps/mobile/app/(app)/(tabs)/settings.tsx` → at least 1

### Dimension 5 — TypeScript compilation
- `npx tsc --noEmit` from repo root → exits 0 (no type errors)

### Dimension 6 — Progress track (web)
- `grep "progress-track" apps/web/components/dashboard/ActiveJobCard.tsx` → at least 1
- `grep "progress-dot" apps/web/components/dashboard/ActiveJobCard.tsx` → at least 1

### Dimension 7 — Progress track (mobile)
- `grep "ProgressTrack\|dotDone" apps/mobile/app/(app)/(tabs)/active-jobs.tsx` → at least 2 matches

### Dimension 8 — No regression in navigation
- `grep "router.push\|router.replace\|router.back" apps/web/app/login/page.tsx` → at least 1 (routing preserved)
- `grep "router.push\|router.back" apps/mobile/app/(app)/jobs/\[id\].tsx` → at least 1

## Reference Dataset
All validation checks are grep-based on the modified source files listed in the PLAN.md files. No additional test fixtures required.

## Non-Goals
- Visual screenshot comparison (not automated)
- Cross-browser rendering tests
- Mobile E2E with Expo
