---
phase: 12-ui-revamp-stripe-linear-design-language
verified: 2026-05-14T00:00:00Z
status: human_needed
score: 8/8 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Landing page renders Variant B layout"
    expected: "Sticky nav with logo-dot, announcement bar with pulse-dot, split hero (left: headline + CTAs using bg-surface-900, right: metrics panel + live activity list), numbered feature strip with '01 /' labels, categories as a data table, surface-900 footer"
    why_human: "Visual layout correctness (vertical divider, split columns, table vs grid) and responsive breakpoint behavior cannot be verified by grep"
  - test: "Login page renders surface-900 split panel"
    expected: "Left panel is surface-900 dark background with logo-dot, 'Welcome back.' headline, icon-tile feature rows, stat row at bottom; right panel is surface-50 with surface-900 submit button; no teal gradient visible"
    why_human: "Visual appearance of the two-panel layout cannot be verified programmatically"
  - test: "Register page renders role picker cards and password strength bar"
    expected: "2-column card grid for CLIENT / PROVIDER roles with surface-900 active border + filled radio dot; password strength bar (3px track) animates on input; 'Join the community.' on left panel"
    why_human: "Interactive visual state (card active border, strength bar animation) requires browser testing"
  - test: "Client dashboard renders stats strip and numbered panels"
    expected: "4-cell bordered stats strip at top; left panel with '01 /' numbered header containing JobPostingForm; right panel with '02 /' and underline tab bar (Jobs/Reviews) using surface-900 active underline"
    why_human: "Two-panel grid layout and tab active state styling require visual inspection"
  - test: "Provider dashboard renders teal-accent featured rows and progress track"
    expected: "Find Jobs tab: first job row has 3px teal left-border accent; 'Accept →' CTA is surface-900; Active Jobs tab: cards show 4-step dot/line progress track (done=teal, active=surface-900, pending=surface-200)"
    why_human: "Conditional teal accent on first row and progress dot/line rendering require visual inspection"
  - test: "Browse page renders sidebar filter and jobs data table"
    expected: "Left sidebar with Location + Category filter lists (surface-900 active pill); main area shows jobs as a data table with header row and row-level data; no card grid"
    why_human: "Table vs card layout and sidebar filter active state require visual inspection"
  - test: "Mobile feed renders filter chips and outlined cards"
    expected: "Horizontal scrollable chip row below app bar; chips use surface-900 active state (#0f172a background); cards are border-based (no Material elevation shadow); first card has 3px teal left-border"
    why_human: "React Native rendering — visual appearance, chip row scrollability, and card border styling require Expo device/simulator testing"
  - test: "Mobile active-jobs renders ProgressTrack component"
    expected: "Each card shows 4 dots connected by lines; done dots are teal (#14b8a6); active dot is surface-900 (#0f172a); pending dots are border-only; conditional 'Start job →' / 'Mark complete →' / 'Details' buttons appear based on status"
    why_human: "React Native rendering of custom ProgressTrack component and conditional button state require device testing"
  - test: "Mobile settings renders bottom sheet instead of Dialog"
    expected: "Tapping service area row opens a slide-up Modal (not a Paper Dialog); area rows use surface-900 background for selected item; teal (#14b8a6) checkmark on selected row; 'Update area' button saves and closes"
    why_human: "Modal bottom sheet slide animation and interactive row selection require device testing"
---

# Phase 12: UI Revamp — Stripe/Linear Design Language Verification Report

**Phase Goal:** Replace the teal-gradient, amber-CTA aesthetic across all web and mobile screens with a clinical Stripe/Linear monochrome design system — surface-900 (#0f172a) as primary CTA color, no amber in button roles, consistent eyebrow/progress-track/nav-sticky utilities — without changing any backend logic, API routes, database schema, or frameworks.
**Verified:** 2026-05-14
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `globals.css` has new utility classes and tokens untouched | VERIFIED | `nav-sticky` (1), `eyebrow` (3), `pulse-dot` (1), `progress-dot` (3) present; `--color-surface-900: #0f172a`, `--color-accent-500: #f59e0b`, `--color-brand-500: #14b8a6` all preserved |
| 2 | Landing page has no teal gradient; primary CTA uses `bg-surface-900` | VERIFIED | `bg-gradient-to-br from-brand` grep → 0 matches; `bg-surface-900` → 3 matches; `nav-sticky` → 1; `pulse-dot` → 2; `<table` → 1; `Browse →` → 1; `data-testid="status"` preserved |
| 3 | Auth pages use `bg-surface-900` submit button; no teal gradient; form logic preserved | VERIFIED | No `bg-gradient-to-br`/`from-brand-700`/`bg-brand-600` in either file; `bg-surface-900` in login (2) and register (3); `handleSubmit` in login (2); `router.push` preserved; `strengthPercent` in register (5); `Join the community` → 1; `border-surface-900` in register (1) |
| 4 | Client dashboard has stat strip, numbered panels, review logic preserved | VERIFIED | `01 /` → 1; `eyebrow` → 1; `grid-cols-4` → 1; `border-surface-900` → 1; `fetchReceivedReviews` → 3; `filteredJobs` → 2; no amber classes |
| 5 | Provider dashboard + browse + job components use `bg-surface-900` CTAs; no amber; accept/advance handlers preserved | VERIFIED | No `bg-brand-600` in any of 5 files; `handleAccept` → 2+; `handleStatusAdvance` → 3+; `fetchPendingJobs` → 1; `progress-track` in ActiveJobCard → 1; `border-l-brand-500` in ProviderJobFeed → 1; `<table` in browse → 1; `<aside` in browse → 1 |
| 6 | Browse page has sidebar filter and jobs table; `bg-surface-900` active state | VERIFIED | No `bg-brand-600`; `bg-surface-900` → 3; `<table` → 1; `<aside` → 1; `eyebrow` → 1; `fetchJobs` → 3; `Role.PROVIDER` → 1 |
| 7 | Mobile layout has Paper theme with `primary: '#0f172a'`; feed has no `mode="elevated"`, has filter chips and WebSocket | VERIFIED | `MD3LightTheme` → 3; `primary: '#0f172a'` → 1; `secondary: '#14b8a6'` → 1; `theme={appTheme}` → 1; `NavigationGuard` → 3 preserved; `mode="elevated"` → 0; `activeFilter` → 6; `displayedJobs` → 4; `useJobsWebSocket` → 2 |
| 8 | Mobile active-jobs has ProgressTrack; settings has Modal replacing Dialog; save logic preserved | VERIFIED | `ProgressTrack` → 2; `dotDone` → 2; `mode="outlined"` in active-jobs → 1; `<Dialog` in settings → 0; `<Modal` → 1; `RadioButton`/`Portal` → 0; `handleUpdateArea` → 2; `saveServiceArea` → 2; `logout` → 4 |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/app/globals.css` | New utility classes added, tokens preserved | VERIFIED | `nav-sticky`, `eyebrow`, `pulse-dot`, `progress-dot`, `progress-line` all present |
| `apps/web/app/page.tsx` | Variant B landing — no gradient, surface-900 CTA | VERIFIED | 3x `bg-surface-900`, `nav-sticky`, `pulse-dot`, `<table`, `Browse →`, testid preserved |
| `apps/web/app/login/page.tsx` | surface-900 split panel, handleSubmit preserved | VERIFIED | 2x `bg-surface-900`, `handleSubmit`, `router.push` |
| `apps/web/app/register/page.tsx` | Role picker cards, strength bar, surface-900 CTA | VERIFIED | 3x `bg-surface-900`, `strengthPercent`, `Join the community`, `border-surface-900` |
| `apps/web/components/dashboard/ClientDashboard.tsx` | Stat strip, numbered panels, review logic | VERIFIED | `01 /`, `grid-cols-4`, `fetchReceivedReviews`, `filteredJobs` |
| `apps/web/components/dashboard/ProviderDashboard.tsx` | Underline tabs, two-panel layout, handlers | VERIFIED | `handleAccept`, `handleStatusAdvance`, `fetchPendingJobs`, `border-surface-900` |
| `apps/web/components/dashboard/ProviderJobFeed.tsx` | surface-900 Accept button, teal featured row | VERIFIED | `bg-surface-900`, `border-l-brand-500`, `handleAccept`, `acceptingId` |
| `apps/web/components/dashboard/ActiveJobCard.tsx` | 4-step progress track, surface-900 CTAs | VERIFIED | `progress-track`, `progress-dot`, `bg-surface-900`, `handleAdvance` |
| `apps/web/components/dashboard/JobCard.tsx` | Icon tile, category eyebrow, maps preserved | VERIFIED | `w-9 h-9 rounded-lg`, `statusColors`, `categoryIcons` |
| `apps/web/app/browse/page.tsx` | Sidebar, data table, surface-900 active state | VERIFIED | `<aside`, `<table`, `bg-surface-900`, `eyebrow`, `fetchJobs`, `Role.PROVIDER` |
| `apps/mobile/app/_layout.tsx` | Paper theme with surface-900 primary | VERIFIED | `primary: '#0f172a'`, `secondary: '#14b8a6'`, `MD3LightTheme`, `theme={appTheme}` |
| `apps/mobile/app/(app)/(tabs)/feed.tsx` | Outlined cards, filter chips, WebSocket preserved | VERIFIED | `mode="outlined"`, `chipActive`, `activeFilter`, `displayedJobs`, `useJobsWebSocket` |
| `apps/mobile/app/(app)/jobs/[id].tsx` | 2-col meta grid, pinned CTA, handlers preserved | VERIFIED | `metaGrid` (2), `pinnedCta` (4), `handleAccept`, `handleStartWork`, `handleFinishWork`, `Snackbar` |
| `apps/mobile/app/(app)/(tabs)/active-jobs.tsx` | ProgressTrack component, outlined cards | VERIFIED | `ProgressTrack` (2), `dotDone` (2), `mode="outlined"`, `Start job`, `fetchJobs` |
| `apps/mobile/app/(app)/(tabs)/settings.tsx` | Modal bottom sheet replacing Dialog | VERIFIED | `<Modal` (1), `handleUpdateArea`, `saveServiceArea`, `logout`, no `<Dialog`/`RadioButton` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `login/page.tsx` form | `useAuth().login()` | `handleSubmit → await login(email, password)` | WIRED | Line 40: `await login(email, password)` followed by `router.push('/dashboard')` |
| `ClientDashboard.tsx` | review data | `fetchReceivedReviews → setReceivedReviews` | WIRED | Fetches from `/api/reviews`, sets state, renders in `ReviewDisplay` |
| `ProviderDashboard.tsx` | pending jobs | `fetchPendingJobs → fetch('/api/jobs')` | WIRED | Line 38: `const res = await fetch(url, { credentials: 'include' })` |
| `settings.tsx` Modal | `saveServiceArea` | `handleUpdateArea → await saveServiceArea(tempArea)` | WIRED | Line 26: `await saveServiceArea(tempArea)` |
| `ActiveJobCard.tsx` progress | CSS classes | `.progress-track`, `.progress-dot.done`, `.progress-dot.active` | WIRED | Classes used in JSX, defined in globals.css |
| `active-jobs.tsx` | `ProgressTrack` component | `renderItem → <ProgressTrack status={item.status} />` | WIRED | Component defined outside, called in card renderItem |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `ClientDashboard.tsx` | `receivedReviews` | `fetch('/api/reviews?userId=...')` | Yes — API query | FLOWING |
| `ProviderDashboard.tsx` | `pendingJobs` | `fetch('/api/jobs?status=PENDING&cityArea=...')` | Yes — API query | FLOWING |
| `feed.tsx` | `displayedJobs` | `fetchJobs → getJobs(token)` | Yes — derived from fetched jobs | FLOWING |
| `active-jobs.tsx` | `jobs` | `fetchJobs → getMyJobs(token)` | Yes — API call | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED — visual redesign phase; the phase produces no independently runnable CLI entry points. TypeScript compilation was verified instead.

**TypeScript compilation note:** `npx tsc --noEmit` reports 208 errors, but investigation confirms all errors are pre-existing environment/monorepo path resolution issues (missing `react-native` and `lucide-react` types at the tsconfig lookup path). The pre-Phase-12 commit at `bfdd14d` already imported `lucide-react` and `next/navigation` in the same files — these errors are not introduced by Phase 12. The phase adds no new imports that would create new type errors.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| UI-01 | 12-01 | Design tokens — `surface-900` primary CTA, amber retired from button roles | SATISFIED | globals.css has `--color-surface-900: #0f172a`, `--color-accent-500` preserved but unused in buttons; new utility classes added |
| UI-02 | 12-02 | Landing page rebuilt to Variant B | SATISFIED | No gradients; `bg-surface-900`, `nav-sticky`, `pulse-dot`, `<table`, `Browse →` all present |
| UI-03 | 12-03 | Login + register pages rebuilt | SATISFIED | Both use `bg-surface-900` CTA; no teal gradients; `strengthPercent` + role picker cards in register |
| UI-04 | 12-04 | Client dashboard rebuilt | SATISFIED | `01 /`, `grid-cols-4`, `fetchReceivedReviews`, `filteredJobs` all present |
| UI-05 | 12-05 | Provider dashboard rebuilt with feed and progress track | SATISFIED | `handleAccept`, `handleStatusAdvance`, `progress-track`, `border-l-brand-500` present |
| UI-06 | 12-05 | Browse page rebuilt with sidebar and data table | SATISFIED | `<aside`, `<table`, `bg-surface-900`, `eyebrow`, `fetchJobs` present |
| UI-07 | 12-06 | Mobile feed rebuilt with filter chips and outlined cards | SATISFIED | `mode="outlined"`, `activeFilter`, `displayedJobs`, `useJobsWebSocket` present; mobile job detail has `metaGrid`, `pinnedCta`, handlers |
| UI-08 | 12-07 | Mobile active-jobs with progress track; settings with bottom sheet | SATISFIED | `ProgressTrack`, `dotDone` present; `<Dialog` removed, `<Modal` added; `saveServiceArea` preserved |

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `apps/mobile/app/(app)/(tabs)/settings.tsx` | Uses `areaModalVisible`/`tempArea` state names instead of plan's `dialogVisible`/`selectedArea` | INFO | Functionally equivalent — `saveServiceArea(tempArea)` is called correctly. This is an internal naming deviation from the plan spec, not a behavioral regression. |

No blocker anti-patterns found. No amber button classes (`bg-accent-500`, `bg-brand-600`, `bg-brand-700`) remain in any modified file. No `bg-gradient-to-br from-brand` in any web TSX file.

### Human Verification Required

#### 1. Landing Page — Variant B Visual Layout

**Test:** Open `http://localhost:3000/` in a browser
**Expected:** Sticky nav (56px, logo-dot, "Log in" ghost button, "Get started" surface-900 button), announcement bar with pulse-dot, split hero with vertical divider (left: headline + CTA buttons, right: metrics panel + live activity list), numbered feature strip ("01 /", "02 /", "03 /"), categories as a `<table>` with "Browse →" links, surface-900 footer
**Why human:** Visual layout correctness, responsive breakpoint behavior, and whether the vertical divider / split columns render correctly cannot be verified by grep

#### 2. Login Page — Surface-900 Split Panel

**Test:** Open `/login` in a browser (desktop breakpoint, ≥1024px)
**Expected:** Left half: dark surface-900 background with logo-dot, "Welcome back." large heading, 3 icon-tile feature rows, stat row; Right half: light surface-50 background, email/password form, surface-900 submit button
**Why human:** Visual two-panel layout appearance requires browser rendering

#### 3. Register Page — Role Picker Cards and Password Strength Bar

**Test:** Open `/register` in a browser; click each role card; type in password field
**Expected:** 2-column role card grid; clicking a card activates surface-900 border + filled radio dot; password strength bar animates as characters are typed; "Join the community." on left panel
**Why human:** Interactive state (card selection visual feedback, strength bar animation) requires live browser testing

#### 4. Client Dashboard — Stats Strip and Tab Bar

**Test:** Log in as a CLIENT, open dashboard
**Expected:** 4-cell stats strip at top; left panel "01 /" with job posting form; right panel "02 /" with "Jobs"/"Reviews" underline tab bar (surface-900 active underline, not a pill)
**Why human:** Tab active state styling and two-panel grid rendering require visual inspection

#### 5. Provider Dashboard — Teal Featured Row and Progress Track

**Test:** Log in as a PROVIDER, open dashboard; check "Find Jobs" and "Active Jobs" tabs
**Expected:** Find Jobs: first job row has 3px teal left-border accent; Accept button is surface-900; Active Jobs: cards show 4-dot/line progress track with teal done-dots
**Why human:** Conditional teal border on first row and progress track dot/line visual rendering require inspection

#### 6. Browse Page — Sidebar and Data Table

**Test:** Log in as PROVIDER, navigate to `/browse`
**Expected:** Left sidebar with Location/Category filter lists (surface-900 active state); main area shows jobs as a `<table>` (not a card grid)
**Why human:** Table vs grid layout and sidebar active-pill state require visual confirmation

#### 7. Mobile Feed — Filter Chips and Outlined Cards (Expo)

**Test:** Run Expo app, navigate to feed tab
**Expected:** Horizontal chip row below app bar scrolls; active chip has surface-900 (#0f172a) background; cards have border (not Material elevation shadow); first card has 3px teal left-border
**Why human:** React Native rendering — chip row scrollability, card border appearance, and teal accent require Expo device/simulator testing

#### 8. Mobile Active Jobs — ProgressTrack Rendering (Expo)

**Test:** Run Expo app, navigate to active jobs tab; ensure at least one active job exists
**Expected:** Each card shows 4 connected dots; done dots are teal; active dot is dark navy; line between done steps is teal; conditional CTA buttons appear based on job status
**Why human:** React Native custom component rendering requires device testing

#### 9. Mobile Settings — Bottom Sheet Modal (Expo)

**Test:** Run Expo app, navigate to settings; tap service area row
**Expected:** Modal slides up from bottom (not a centered Dialog); drag handle at top; area list scrolls; tapping an area highlights it with surface-900 background; "Update area" saves and dismisses
**Why human:** Modal slide-up animation and interactive row selection require device testing

---

## Observations

**settings.tsx naming deviation:** The implementation uses `areaModalVisible` (instead of `dialogVisible`) and `tempArea` (instead of `selectedArea`) as internal state variable names. The plan's "Preserve ALL existing logic" comment listed `dialogVisible` and `selectedArea`. The functional behavior is preserved — `saveServiceArea(tempArea)` is called when the user confirms — but the internal identifiers differ. This is not a behavioral issue; it is noted for developer awareness.

---

_Verified: 2026-05-14_
_Verifier: Claude (gsd-verifier)_
