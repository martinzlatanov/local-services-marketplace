# Phase 12: UI Revamp — Stripe/Linear Design Language - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning
**Source:** Sketch session — 8 approved HTML prototypes in `.planning/sketches/`

<domain>
## Phase Boundary

Replace the current teal-gradient, amber-CTA aesthetic across all user-facing screens with a clinical monochrome design language. This is a pure visual rebuild — no new features, no API changes, no schema changes. All existing functionality is preserved; only markup, styles, and React Native Paper theme configuration change.

**In scope:**
- `apps/web/app/globals.css` — design token updates
- All web pages: landing, login, register, client dashboard, provider dashboard (browse page)
- Mobile screens: feed, active jobs, settings
- React Native Paper theme configuration

**Out of scope:**
- Backend API, database schema, WebSocket logic
- Authentication flows (logic unchanged, only presentation)
- New features of any kind

</domain>

<decisions>
## Implementation Decisions

### D-01 — Design token: primary CTA color
`surface-900` (`#0f172a`) replaces amber (`#f59e0b`) as the primary button background. All `.btn-primary`, `bg-accent-500`, `bg-brand-600` button classes on CTAs are replaced with `bg-surface-900 text-white`. Amber (`accent-500`) is retired from all button roles.

### D-02 — Design token: brand teal reduced to accent/indicator only
`brand-500` (`#14b8a6`) is kept in `globals.css` but used only for: focus rings, pulsing live indicator dots, featured row left-border accents, teal checkmarks. Never as a button background.

### D-03 — Typography
Inter 800/700/600/500 weights. Tight letter-spacing on headings: `-1px` to `-2.5px`. Eyebrow labels: `11px`, `font-weight:700`, `letter-spacing:.1em`, `text-transform:uppercase`. No changes to font imports (Inter is already loaded).

### D-04 — Navigation (web)
56px sticky nav, `rgba(255,255,255,0.92)` + `backdrop-filter:blur(12px)`, 1px `surface-200` border-bottom. Logo: `LocalPro` with 8px teal dot. Primary nav button: `surface-900` background. Ghost nav button: `surface-600` text, no border.

### D-05 — Card style
`surface-0` background, 1px `surface-200` border, `border-radius: var(--radius-card)` (12px). Hover: lift shadow via `shadow-card-hover`. No heavy drop-shadows at rest.

### D-06 — Landing page
Approved variant: **Variant B (Structured Editorial)** — `01-landing-page-variant-B.html`.
- Announcement bar (teal dot + message, `surface-100` bg)
- Split hero: strict vertical divider, left = headline + sub + CTAs, right = metrics panel (10 city areas / 8 categories / <1h response) + live activity list with pulsing green dot
- Feature strip: `01 /`, `02 /`, `03 /` numbered steps (no background color)
- Categories as a `<table>` with icon + name + count + "Browse →" action columns
- Dark `surface-900` "How it works" section replaced by the numbered feature strip above
- Footer: `surface-900` bg, logo-dot, minimal links

### D-07 — Login page
Reference: `03-auth-login.html`.
- Two-panel layout: `surface-900` left panel (logo, "Welcome back.", feature rows with icon tiles, stat row) + `surface-50` right form panel
- No teal gradient (`from-brand-700 to-brand-900` removed)
- Submit button: `surface-900` background, `#fff` text
- Focus ring: `brand-500` teal (3px rgba ring)
- Link color: `surface-900`, `font-weight:700`

### D-08 — Register page
Reference: `06-auth-register.html`.
- Same `surface-900` left panel shell as login with different copy ("Join the community.")
- Right panel: role picker — 2-column grid of cards, `surface-900` active border + 1px box-shadow, filled radio-check dot (`surface-900` circle with `#fff` inner dot)
- Password strength bar: 3px track, `brand-500` fill, hint text below
- No amber anywhere

### D-09 — Client dashboard
Reference: `04-client-dashboard.html`.
- Sticky nav + eyebrow/title/sub page header pattern
- 4-cell stats strip: bordered table cells (posted / active / completed / pending)
- Left panel: post-job form with `01 /` numbered header, `surface-200` border, tab strip inside
- Right panel: jobs as data table with tab bar (All / Active / Completed / Reviews), search input, row-level status badges, date column
- Status badges: existing semantic token colors from `globals.css` preserved exactly

### D-10 — Provider dashboard
Reference: `05-provider-dashboard.html`.
- Same stat strip as client dashboard
- Left panel: available jobs feed — featured rows get teal left-border accent (3px `brand-500`), "Accept →" inline CTA
- Right panel: active jobs with 4-step dot/line progress track (`PENDING → ACCEPTED → IN_PROGRESS → COMPLETED`), `surface-900` for completed dots, `surface-200` for pending

### D-11 — Browse page (provider)
Reference: `07-browse-page.html`.
- Left sidebar: stacked Location + Category filter lists with job counts, `surface-900` active pill state
- Main: eyebrow header + search input + "Newest first" sort control
- Jobs as data table: icon cell / description (category label + truncated desc + meta row) / location / timeframe / "Accept →" CTA
- New jobs: teal left-border (`3px brand-500`) + "New" pulse badge
- Pagination strip in table footer

### D-12 — Mobile feed (React Native / Paper)
Reference: `02-mobile-feed-variant-A.html`.
- Replace Paper `Card` `mode="elevated"` with `mode="outlined"` + unified token card styles
- Filter chips row below app bar: pill shape, `surface-900` active state (not MD3 primary)
- Featured job card: 3px teal left-border accent strip
- Job detail: 2-column meta grid, pinned "Accept" CTA in `surface-900`
- App bar: same tokens, no Material elevation

### D-13 — Mobile active jobs (React Native / Paper)
Reference: `08-mobile-active-jobs-settings.html` (left phone frame).
- Cards with 4-step progress track (dot/line: Pending → Accepted → In Progress → Done)
- Status badge per card
- Conditional CTAs: "Start job" / "Mark complete" / "Details"

### D-14 — Mobile settings (React Native / Paper)
Reference: `08-mobile-active-jobs-settings.html` (right phone frame).
- Grouped list rows with icon tiles and chevrons (replaces plain `List.Item`)
- "Log out" as danger row (red text), not a `Button`
- Area picker: **bottom sheet** replaces Paper `Dialog` + `RadioButton.Group`
  - Drag handle, scrollable list, `surface-900` selected row, teal checkmark
  - Still uses React Native Paper as framework — bottom sheet is a custom `Modal`/`View` overlay, not a third-party library

### D-15 — React Native Paper theme
PaperProvider `theme` config changes:
- `colors.primary` → `surface-900` equivalent (`#0f172a`)
- `colors.secondary` → `brand-500` (`#14b8a6`)
- Card elevation → 0 (border instead)
- No amber in any Paper color role

### Claude's Discretion
- Exact Tailwind class names (use existing `surface-*`, `brand-*` token classes from globals.css)
- Whether to extract shared components vs inline styles (prefer minimal extraction)
- Breakpoint behavior for the split-panel pages (tablet/mobile fallback for web)
- Animation timing for progress track dots (subtle only)
- Bottom sheet animation (slide-up, 300ms)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design sketches (source of truth for visual spec)
- `.planning/sketches/01-landing-page-variant-B.html` — Landing page (selected variant)
- `.planning/sketches/02-mobile-feed-variant-A.html` — Mobile feed + job detail
- `.planning/sketches/03-auth-login.html` — Login page
- `.planning/sketches/04-client-dashboard.html` — Client dashboard
- `.planning/sketches/05-provider-dashboard.html` — Provider dashboard
- `.planning/sketches/06-auth-register.html` — Register page
- `.planning/sketches/07-browse-page.html` — Browse page (provider)
- `.planning/sketches/08-mobile-active-jobs-settings.html` — Mobile active jobs + settings
- `.planning/sketches/MANIFEST.md` — Design decisions log + token delta + cross-screen patterns

### Current source files (must read before modifying)
- `apps/web/app/globals.css` — Existing design tokens (surface-*, brand-*, accent-*, radius, shadow)
- `apps/web/app/page.tsx` — Current landing page
- `apps/web/app/login/page.tsx` — Current login page
- `apps/web/app/register/page.tsx` — Current register page
- `apps/web/app/browse/page.tsx` — Current browse page
- `apps/web/components/dashboard/ClientDashboard.tsx` — Current client dashboard
- `apps/web/components/dashboard/JobCard.tsx` — Current job card
- `apps/mobile/app/(app)/(tabs)/feed.tsx` — Current mobile feed
- `apps/mobile/app/(app)/(tabs)/active-jobs.tsx` — Current active jobs
- `apps/mobile/app/(app)/(tabs)/settings.tsx` — Current settings
- `apps/mobile/app/_layout.tsx` or equivalent — Paper PaperProvider theme location

### Shared types (read-only, no changes needed)
- `packages/types/src/index.ts` — JobStatus enum, CITY_AREAS, JOB_CATEGORIES

</canonical_refs>

<specifics>
## Specific Ideas

- The teal live-indicator dot on the landing page hero is `width:8px; height:8px; background:#14b8a6; border-radius:50%` with a `@keyframes pulse` animation — replicate in Tailwind with `animate-pulse`
- Status badge colors are already tokenized in `globals.css` (pending/accepted/in-progress/completed semantic tokens) — do not change these
- The `surface-900` primary button hover is `opacity: 0.88` — use Tailwind `hover:opacity-[0.88]`
- Mobile bottom sheet: `position: absolute; bottom: 0; left: 0; right: 0; background: surface-0; border-radius: 16px 16px 0 0; padding: 20px 0`
- Password strength bar fill width should be driven by a `useState` hook watching the password field's `length` and character class rules
- Featured row teal left-border: `border-left: 3px solid var(--brand-500)` (web) / `borderLeftWidth: 3, borderLeftColor: '#14b8a6'` (mobile)

</specifics>

<deferred>
## Deferred Ideas

- Dark mode — not in scope for this phase
- Animation library (Framer Motion / Reanimated) — use CSS transitions and RN `Animated` only
- Storybook component library — out of scope
- Design token export to mobile (Style Dictionary) — out of scope; mobile uses hardcoded hex values matching the web tokens

</deferred>

---

*Phase: 12-ui-revamp-stripe-linear-design-language*
*Context gathered: 2026-05-14 from sketch session (8 HTML prototypes)*
