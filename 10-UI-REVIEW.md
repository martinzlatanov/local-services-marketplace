# Phase 10 — Retroactive 6-Pillar Visual Audit

**Audited:** 2026-05-14
**Scope:** Entire project UI — Web (apps/web) + Mobile (apps/mobile)
**Baseline:** Project-wide code review against 6-pillar visual standards
**Auditor:** gsd-ui-auditor (manual equivalent)

---

## Pillar Scores

| #  | Pillar              | Score | Rating       |
|----|---------------------|-------|--------------|
| 1  | Copywriting         | 3/4   | Good         |
| 2  | Visuals / Layout    | 3/4   | Good         |
| 3  | Color               | 2/4   | Needs Work   |
| 4  | Typography          | 3/4   | Good         |
| 5  | Spacing             | 2/4   | Needs Work   |
| 6  | Experience Design   | 3/4   | Good         |

**Overall: 16/24**

---

## Top 5 Priority Fixes

1. **Spacing scale violations** — `p-5` (20px) is used pervasively across every card component but 20px is not in the defined 4/8/16/24/32/48/64px token scale. Replace with `p-4` (16px) or `p-6` (24px). Page-level padding uses `py-12` (48px) instead of `py-16` (64px, the defined `3xl` token).

2. **Color token inconsistency** — "Mark Complete" button uses hardcoded `bg-emerald-600` instead of the brand/accent token system. Error banners use `bg-red-50`/`text-red-800` without corresponding design tokens. Status colors in JobDetailCard are hardcoded inline (`bg-yellow-50`, `bg-blue-50`, etc.) rather than using the status token variables or a defined status palette.

3. **Responsive mobile layout gaps** — Mobile screens lack bottom navigation, safe-area handling, and pull-to-refresh affordances on several lists. The onboarding screen (`index.tsx`) renders nothing (returns `null`) — users see a blank white screen during auth rehydration with no loading indicator.

4. **Missing skeleton/placeholder loading states** — Every screen shows raw spinners during data loading. No content skeleton placeholders, which makes the UI feel slow and "boring" (the stated concern). Job cards, review cards, and dashboard sections should all have shimmer/skeleton states.

5. **Cross-platform visual language mismatch** — Web uses custom Tailwind utility classes with hand-rolled components; mobile uses React Native Paper (Material Design 3). The visual identities diverge significantly — different radii, shadows, typography scales, and interaction patterns. Users switching between platforms get a disjointed experience.

---

## Detailed Findings by Pillar

### Pillar 1: Copywriting — 3/4

**Strengths:**
- CTA labels are clear and action-oriented: "Sign in", "Create account", "Post Job", "Start Work", "Submit Review", "Leave a Review"
- Error messages are descriptive and contextual ("Couldn't load jobs. Pull down to retry." on mobile)
- Empty states provide next-step guidance ("Use the form above to post your first job!")
- Toast messages confirm actions ("Job accepted!", "Job posted successfully")
- Navbar labels are standard and discoverable ("Log in", "Dashboard", "Browse Jobs", "Log out")

**Issues:**
| Severity | Location | Finding |
|----------|----------|---------|
| Medium | `apps/web/app/login/page.tsx:103` | Heading reads "Welcome back" — UI-SPEC for Phase 3 specified "Sign in to your account". Subtext "Sign in to your account to continue" partially compensates but the `<h1>` should match the contract. |
| Medium | `apps/web/app/login/page.tsx:174` | "Don't have an account? Create one →" — Extra "one" vs. tighter alternative "Create account" |
| Low | `apps/web/app/dashboard/page.tsx:101` | Dashboard heading is simply "Dashboard" — no user context (e.g., "Hey, {name}") making the welcome feel generic |
| Low | `apps/web/app/browse/page.tsx:74` | "Browse Jobs" is provider-only — no explanation for clients who land here |
| Low | `apps/mobile/app/(auth)/login.tsx:48` | Mobile login heading is "Sign in" (correct per mobile UI-SPEC) but lacks the warmth of the web subtext |
| Low | Mobile error messages use "Something went wrong. Please try again." in two different wordings across login and register screens — should be identical |

**Verdict:** Functional and clear across all screens. One heading mismatch against the Phase 3 UI-SPEC contract, minor tightening opportunities.

---

### Pillar 2: Visuals / Layout — 3/4

**Strengths:**
- Auth pages use a strong split-panel layout (desktop) with brand gradient panel + form card — visually distinctive and professional
- Home page hero section is compelling: gradient background, floating gradient orbs, clear value prop, dual CTA buttons
- Card-based design is consistent: `rounded-[var(--radius-card)]`, `border border-surface-200`, `shadow-[var(--shadow-card)]`
- Dashboard uses effective tabbed navigation with pill-style active states
- Job cards have clear visual hierarchy: category icon → title → description → metadata → status badge
- Review cards separate star ratings, category breakdowns, and text cleanly
- Toast notification is well-positioned (bottom-right, auto-dismiss, color-coded)
- LiveIndicator provides real-time WebSocket status feedback

**Issues:**
| Severity | Location | Finding |
|----------|----------|---------|
| High | `components/dashboard/JobCard.tsx:32` | Uses `p-5` (20px) — visually inconsistent with `p-4` (16px) used in JobPostingForm, ReviewDisplay, etc. |
| High | `components/dashboard/JobDetailCard.tsx:69` | Status colors are hardcoded inline per status (`bg-yellow-50`, `bg-blue-50`, `bg-purple-50`, `bg-green-50`) — diverges from the centralized status token system in globals.css |
| Medium | `components/dashboard/ActiveJobCard.tsx:62` | Also uses `p-5`. Additionally, the status timeline (green progress bars) is a custom visual element not covered by any design token or component library |
| Medium | `components/ReviewApprovalCard.tsx:142` | Uses `rounded-lg` (8px) instead of `rounded-[var(--radius-card)]` (12px) — breaks card radius consistency |
| Medium | `app/page.tsx:76` | Category grid items use `hover:scale-105` transform — no equivalent on other interactive cards, creating visual inconsistency |
| Medium | `app/dashboard/page.tsx:100-118` | Client dashboard top-level tabs ("My Jobs" / "Reviews") and sub-tabs ("All" / "Active" / "Completed") are visually identical pill styles but serve different navigation depths — hard to distinguish |
| Low | `components/ui/Toast.tsx:29` | Toast shadow `shadow-lg` is hardcoded instead of using `var(--shadow-card)` tokens |
| Low | Mobile `feed.tsx:124-134` | Error banner padding (`paddingHorizontal: 16, paddingVertical: 12`) is ad-hoc — not aligned to any spacing token |

**Verdict:** Strong layout foundation with clear visual hierarchy. Inconsistencies in card padding, radius values, and status color approaches prevent a polished feel.

---

### Pillar 3: Color — 2/4

**Strengths:**
- `globals.css` defines a comprehensive token system: `--color-brand-*` (teal), `--color-accent-*` (amber), `--color-surface-*` (slate), `--color-status-*` (contextual states)
- Brand color (teal `#0d9488`) is used consistently for primary actions: login CTA, register CTA, "Post Job", "Start Work", "Leave a Review"
- Accent color (amber `#f59e0b`) is correctly restricted to primary CTAs on the home page ("Post a Job" / "Get started") and navbar ("Get started")
- Surface color system is well-applied: `bg-surface-0` for cards, `bg-surface-50` for page backgrounds, `bg-surface-100` for input fields
- Star ratings use `fill-brand-500` consistently
- Destructive colors are consistent: `text-red-600` for error text, `border-red-400` for error borders, `bg-red-50` for error banners

**Issues:**
| Severity | Location | Finding |
|----------|----------|---------|
| High | `components/dashboard/ActiveJobCard.tsx:113` | "Mark Complete" button uses `bg-emerald-600` instead of `bg-brand-600` — creates a third primary action color outside the defined brand/accent system |
| High | `components/dashboard/JobDetailCard.tsx:15-30` | Status colors are hardcoded per status (`bg-yellow-50`, `border-yellow-200`, `text-yellow-900`, etc.) — should use the `status-*` design tokens from globals.css or be added to the token system |
| High | `components/dashboard/JobCard.tsx:10-14` | Status colors use a parallel set of CSS classes (`bg-status-pending-bg`, `bg-status-accepted-bg`, etc.) — but these map to different values than the hardcoded JobDetailCard status colors, creating visual inconsistency between card and detail views for the same status |
| Medium | `components/ReviewApprovalCard.tsx:239-243` | Error state uses `bg-status-error-50` / `text-status-error-700` — these classes are defined in the globals.css token system but are inconsistent with the `bg-red-50`/`text-red-800` used in login/register error banners |
| Medium | `apps/mobile/app/(auth)/register.tsx:140-148` | Role selector uses hardcoded `#d1d5db` (border) and `#4f46e5` (selected) and `#e0e7ff` (selected bg) and `#4338ca` (selected text) — these bypass the React Native Paper theme entirely |
| Medium | `components/ReviewForm.tsx:385-389` | Disabled submit button uses `bg-surface-200`/`text-surface-500` — reasonable but undocumented in the token system |
| Low | `components/Navbar.tsx:43` | "Get started" uses `bg-accent-500`/`hover:bg-accent-600` — correct usage ✓ but hover state transitions are missing on some other buttons |

**Verdict:** Token system is well-conceived but under-enforced. Multiple components bypass it with hardcoded values, and status colors have two parallel implementations. This is the most impactful fix — it makes the UI look "boring" and inconsistent when tokens aren't respected.

---

### Pillar 4: Typography — 3/4

**Strengths:**
- Inter font loaded via `next/font/google` in root layout — ensures consistent web typography
- Mobile uses React Native Paper's MD3 type scale (`headlineSmall`, `bodyLarge`, `labelLarge`, `titleMedium`) — platform-appropriate
- Heading hierarchy is logical: `text-7xl` (hero) → `text-4xl` (section) → `text-3xl` (page) → `text-2xl` (card) → `text-xl` (subsection)
- Exactly 2 font weights dominate: `font-semibold` (600) for labels/headings, `font-normal` for body — aligning with the Phase 3 spec
- Line heights are consistent: `leading-tight` for headings, `leading-relaxed` for body
- Mobile and web each follow their platform conventions correctly

**Issues:**
| Severity | Location | Finding |
|----------|----------|---------|
| Medium | `components/dashboard/ClientDashboard.tsx:98` | "My Jobs" heading uses `text-xl font-semibold` — should arguably be `text-2xl` to match the visual weight of "Post a New Job" (`text-lg`) + its sibling sections |
| Medium | `components/Navbar.tsx:26` | Logo uses `text-xl` but Hero section uses `text-5xl`–`text-7xl` — the jump from navbar to hero is extreme; no intermediate scale bridges the gap |
| Low | `components/dashboard/JobDetailCard.tsx:72` | Job title uses `text-lg font-semibold` but status label next to it uses `text-xs font-semibold uppercase` — the uppercase + tiny size for "Status" is hard to read |
| Low | `apps/web/app/globals.css` | `--font-sans` includes `ui-sans-serif` which is not a real font family and will silently fail; should be removed or replaced with a real fallback |
| Low | `components/ReviewForm.tsx:31` | Rating labels "Poor" / "Fair" / "Good" / "Very Good" / "Excellent" are all `text-sm` in the UI but the mobile register screen uses `text-sm font-semibold` for "Role" label — inconsistent emphasis for form labels |

**Verdict:** Typography system is solid. The Inter + RN Paper MD3 pairing is appropriate. Minor hierarchy gaps in dashboard views.

---

### Pillar 5: Spacing — 2/4

**Strengths:**
- Tailwind utility classes are used consistently throughout the web app (no raw CSS-in-JS or inline styles on web)
- The spacing token scale is defined: xs(4) / sm(8) / md(16) / lg(24) / xl(32) / 2xl(48) / 3xl(64)
- Many components correctly use scale values: `p-4` (16), `p-6` (24), `gap-4` (16), `py-16` (64)
- Mobile uses `StyleSheet.create()` with centralized spacing values
- Card internals use consistent `p-4` / `gap-2` patterns

**Issues:**
| Severity | Location | Finding |
|----------|----------|---------|
| High | `components/dashboard/JobCard.tsx:32` | `p-5` (20px) — not in token scale. Should be `p-4` (16px) or `p-6` (24px) |
| High | `components/dashboard/JobDetailCard.tsx:69` | `p-5` (20px) — same violation |
| High | `components/dashboard/ActiveJobCard.tsx:62` | `p-5` (20px) — same violation |
| High | `apps/web/app/login/page.tsx:94` | `py-12` (48px / 2xl) for page-level section padding — UI-SPEC defines 64px (3xl) for page-level. Should be `py-16` |
| High | `apps/web/app/register/page.tsx:111` | Same `py-12` issue as login |
| Medium | `components/ReviewApprovalCard.tsx:142` | `p-6` is correct but `rounded-lg` breaks the card radius convention |
| Medium | `components/ui/Toast.tsx:29` | `px-4 py-3` — 16px x 12px is not in the scale. Should be `px-4 py-2` (16x8) or `px-4 py-4` (16x16) |
| Medium | `apps/mobile/app/(auth)/register.tsx:143` | `paddingHorizontal: 12` — 12px not in the defined scale (closest are 8 or 16). Should be 16px per `md` token |
| Medium | `apps/mobile/app/(app)/(tabs)/settings.tsx:86-89` | `paddingHorizontal: 16` for logout button — acceptable but undocumented |
| Low | `components/dashboard/JobPostingForm.tsx:65` | `p-6` for form card — should align with `p-6` used in other cards (consistent ✓ actually, but differs from `p-8` in auth cards) |

**Verdict:** The spacing is the weakest pillar. The `p-5` (20px) anti-pattern appears in every card component, and page-level padding deviates from the defined scale. Enforcing the token scale strictly would dramatically improve visual rhythm.

---

### Pillar 6: Experience Design — 3/4

**Strengths:**
- Responsive design: auth pages adapt from split-panel (desktop) to single-column (mobile) with `hidden lg:flex` patterns
- Touch targets: mobile buttons use `minHeight: 44` per the UI-SPEC ✓
- Loading states exist on all interactive elements: spinners, disabled buttons, loading text
- Error handling is thorough: field-level errors, top-level fallback errors, network errors, 409 conflict handling
- Toast notifications auto-dismiss with 4s timeout ✓
- Real-time updates via WebSocket with reconnect logic ✓
- Accessible: `aria-label`, `aria-live`, `aria-invalid`, `aria-describedby`, `sr-only` screen reader text, `focus-visible` outlines
- Mobile uses platform-native components (React Native Paper) with proper theming
- Empty states guide users ("No jobs posted yet. Use the form above to post your first job!")

**Issues:**
| Severity | Location | Finding |
|----------|----------|---------|
| High | `apps/mobile/app/index.tsx:21` | Root route returns `null` during auth rehydration — users see a **blank white screen** with zero feedback. No loading spinner, no splash. This is the single worst UX moment in the app. |
| High | All data-loading screens | No skeleton/placeholder loading states anywhere. Every list (jobs, reviews) shows a raw `<ActivityIndicator>` or spinner until content arrives. Adding shimmer skeletons would dramatically reduce perceived load time. |
| High | `apps/mobile/app/(app)/(tabs)/` | No bottom tab navigation on mobile — users navigating between Feed, Active Jobs, and Settings must use a hamburger or back-navigate. Core mobile UX pattern missing. |
| Medium | `components/ReviewForm.tsx:325-356` | Drag-and-drop photo upload works but has no visual drag state beyond border color change; upload progress indicator is absent after file selection |
| Medium | `components/Navbar.tsx:80-87` | Mobile hamburger menu opens as a dropdown below the navbar but has no backdrop/overlay — clicking elsewhere doesn't close it; no slide-in animation |
| Medium | `components/ui/LiveIndicator.tsx` | WebSocket disconnect shows "Disconnected" text but there's no banner or toast to help the user understand what happened or that reconnection is automatic |
| Low | `apps/web/app/page.tsx:176` | Footer copyright says "© 2025" — should be dynamic or updated to 2026 |
| Low | `components/dashboard/ProviderDashboard.tsx:205-207` | Empty state for "No active jobs yet." and "No completed jobs yet." appear on separate tabs but use identical styling — could share a component |

**Verdict:** Experience foundation is solid — responsive, accessible, error-handled. The critical gap is the blank-screen-on-launch and missing skeleton loaders. Adding mobile bottom navigation would bring the mobile UX to modern standards.

---

## Files Audited

### Web (apps/web)
| File | Type |
|------|------|
| `app/layout.tsx` | Root layout, font loading |
| `app/page.tsx` | Home page / hero / categories |
| `app/login/page.tsx` | Login form |
| `app/register/page.tsx` | Register form + role selector |
| `app/browse/page.tsx` | Job browse page (provider) |
| `app/dashboard/page.tsx` | Dashboard shell + WebSocket |
| `app/dashboard/provider/[id]/page.tsx` | Provider profile + reviews |
| `app/globals.css` | Design tokens, theme, animations |
| `components/layout/Navbar.tsx` | Responsive navigation bar |
| `components/dashboard/ClientDashboard.tsx` | Client role dashboard |
| `components/dashboard/ProviderDashboard.tsx` | Provider role dashboard |
| `components/dashboard/JobPostingForm.tsx` | Job creation form |
| `components/dashboard/JobDashboard.tsx` | Job list wrapper |
| `components/dashboard/JobCard.tsx` | Provider job card |
| `components/dashboard/JobDetailCard.tsx` | Client job detail view |
| `components/dashboard/ActiveJobCard.tsx` | Active job with status timeline |
| `components/ui/Toast.tsx` | Toast notification |
| `components/ui/LiveIndicator.tsx` | WebSocket status indicator |
| `components/ReviewDisplay.tsx` | Review list + rating display |
| `components/ReviewForm.tsx` | Review submission form |
| `components/ReviewApprovalCard.tsx` | Admin review approval card |
| `contexts/AuthContext.tsx` | Auth context provider |

### Mobile (apps/mobile)
| File | Type |
|------|------|
| `app/_layout.tsx` | Root layout |
| `app/(app)/(tabs)/_layout.tsx` | Tab navigator layout |
| `app/(auth)/login.tsx` | Login screen |
| `app/(auth)/register.tsx` | Register screen + role selector |
| `app/index.tsx` | Root route (auth gate) |
| `app/(app)/(tabs)/feed.tsx` | Job feed screen |
| `app/(app)/(tabs)/active-jobs.tsx` | Active jobs screen |
| `app/(app)/jobs/[id].tsx` | Job detail + accept/complete |
| `app/(app)/(tabs)/settings.tsx` | Settings + service area picker |
| `contexts/AuthContext.tsx` | Auth context with SecureStore |

### Design System
| File | Type |
|------|------|
| `apps/web/globals.css` | CSS custom properties: brand (teal), accent (amber), surface (slate), status, radii, shadows |
| `apps/web/tailwind.config.ts` | Tailwind config (content paths only — no theme extensions) |
| `.planning/phases/03-auth-client-integration/03-UI-SPEC.md` | Phase 3 UI design contract |

---

## Score Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► UI AUDIT — Phase 10: End-to-End Polish & Deployment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Pillar                  Score   Assessment
 ───────────────────────────────────────────────
 1. Copywriting           3/4    Good — minor heading mismatch
 2. Visuals / Layout      3/4    Good — padding/radius inconsistencies
 3. Color                 2/4    Needs work — token bypass, status duplication
 4. Typography            3/4    Good — platform-appropriate scales
 5. Spacing               2/4    Needs work — p-5 anti-pattern, py-12 vs py-16
 6. Experience Design     3/4    Good — blank launch screen, no skeletons
                                
 OVERALL                 16/24  ═══════════════░░░░░░  67%
```

---

## Recommended Fix Priority

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| **P0** | Fix blank launch screen — add splash/loading state to `index.tsx` | 15 min | ⭐⭐⭐⭐⭐ |
| **P0** | Replace all `p-5` with `p-4` or `p-6` to enforce spacing scale | 30 min | ⭐⭐⭐⭐⭐ |
| **P1** | Add skeleton shimmer components for job lists and review lists | 2-3 hrs | ⭐⭐⭐⭐ |
| **P1** | Centralize status colors into globals.css tokens, remove hardcoded values | 1 hr | ⭐⭐⭐⭐ |
| **P1** | Fix `py-12` → `py-16` on auth page backgrounds | 5 min | ⭐⭐⭐ |
| **P2** | Add mobile bottom tab navigation (Feed / Active / Settings) | 3-4 hrs | ⭐⭐⭐⭐ |
| **P2** | Unify "Get Started" button styling to defined accent token | 15 min | ⭐⭐⭐ |
| **P2** | Add backdrop overlay to mobile hamburger menu | 20 min | ⭐⭐ |
| **P3** | Add photo upload progress indicator | 30 min | ⭐⭐ |
| **P3** | Dynamic footer year | 5 min | ⭐ |

---

## Phase Context

This audit covers the complete implemented UI surface across all phases (01–10):
- **Phase 01** (Monorepo/Types): Shared type definitions — no UI
- **Phase 02** (Backend Auth API): No frontend UI changes
- **Phase 03** (Auth Client Integration): Web login/register + Mobile login/register ← *Previously audited: 19/24*
- **Phase 04** (Job Core + State Machine): No new UI
- **Phase 05** (Job Acceptance + Concurrency): No new UI
- **Phase 06** (Real-Time Infrastructure): WebSocket indicator added
- **Phase 07** (Web Client — Job Posting): Dashboard, job posting, browse page
- **Phase 08** (Mobile Client — Discovery): Feed, active jobs, job detail, accept flow
- **Phase 09** (Mobile — Active Execution): Status lifecycle, navigation tabs
- **Phase 10** (E2E Polish): Reviews system, admin review panel, provider profiles, Toast, live indicator

---

*Generated by retroactive 6-pillar visual audit — 2026-05-14*