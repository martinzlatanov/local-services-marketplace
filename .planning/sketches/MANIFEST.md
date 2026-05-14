# Sketch Manifest

## Session: UI Revamp — Foundation Phase
**Date:** 2026-05-14  
**Direction:** Stripe/Linear — Clinical mono  
**Scope:** Foundation-first (Phase 1 of 4)  
**Cross-platform:** Unified design language (Paper themed to match web tokens)

---

## Sketches

### 01 — Landing Page

| File | Variant | Key idea |
|------|---------|----------|
| `01-landing-page-variant-A.html` | Monochrome Precision | Split hero (text left, live job feed right), category grid with bordered table layout, dark "How it works" section on `surface-900`, teal CTA band |
| `01-landing-page-variant-B.html` | Structured Editorial | Announcement bar + strictly divided left/right hero with metrics panel, feature strip with numbered steps, categories as a proper data table |

**Shared design decisions:**
- Font: Inter 800/700/600/500 — tight letter-spacing on headings (`-1px` to `-2.5px`)
- Nav: 56–60px, sticky, `rgba(255,255,255,0.92)` + blur backdrop, 1px border-bottom
- Colors: `surface-*` slate scale + `brand-500` (#14b8a6) as accent, never amber
- Buttons: `surface-900` primary (black), outline secondary — no amber CTAs
- Cards: 1px `surface-200` border, `radius-card: 12px`, hover lifts shadow
- Live indicator: pulsing green dot + brand-light background
- Status badges: existing semantic tokens preserved

---

### 02 — Mobile Feed Screen

| File | Variant | Key idea |
|------|---------|----------|
| `02-mobile-feed-variant-A.html` | Card feed + detail | Filter chips below app bar, card accent strip on featured job, 2-column meta grid in detail view, pinned "Accept" CTA in `surface-900` |

**Unified design language applied to React Native Paper:**
- App bar replaces Paper's `Appbar.Header` — same tokens, no Material elevation
- Cards use `surface-0` background + 1px `surface-200` border (not Paper elevation shadows)
- Tab bar: 1px `surface-200` top border, active item `surface-900` (not MD3 primary)
- Typography: Inter-equivalent weights, tight letter-spacing on titles
- Filter chips: pill shape, `surface-900` active state
- Touch targets: all interactive elements ≥44px

---

## Design Token Delta (proposed changes to globals.css)

The sketches operate on the **existing token set** — no new colors added. The only shifts:

| Token | Current use | Proposed use in revamp |
|-------|-------------|------------------------|
| `accent-500` (#f59e0b amber) | Primary CTAs ("Post a Job") | Retired from CTA use; `surface-900` takes primary CTA role |
| `brand-500` (#14b8a6 teal) | Various | Reduced to accent/indicator only — not primary CTA |
| `surface-900` (#0f172a) | Text | Promoted to primary button background |
| `shadow-card` | Cards | Keep as-is; hover shadow kept |

---

---

## Phase 2 sketches

### 03 — Auth: Login page
| File | Description |
|------|-------------|
| `03-auth-login.html` | Split layout: `surface-900` left panel (brand identity, stats, feature rows) + `surface-50` right form panel. Form uses `surface-900` submit button, Inter label system, brand-teal focus ring. No amber anywhere. |

### 04 — Client Dashboard
| File | Description |
|------|-------------|
| `04-client-dashboard.html` | Sticky nav + page header with eyebrow/title/sub pattern. 4-cell stats strip (bordered table). Left: post-job form as numbered panel ("01 /"). Right: jobs as a data table with tab bar (All / Active / Completed / Reviews), search input, row-level status badges, date column. |

### 05 — Provider Dashboard
| File | Description |
|------|-------------|
| `05-provider-dashboard.html` | Same stat strip. Left: available jobs feed with featured accent rows (teal left border) + inline "Accept →" CTAs. Right: active jobs panel with a 4-step progress track (Pending → Accepted → In Progress → Done) using dot/line indicators. |

**Cross-screen patterns locked:**
- Nav: 56px, logo-dot, sticky blur
- Page header: eyebrow-line tag + large 800-weight title
- Panel system: numbered ("01 /", "02 /"), 1px border, tab strip inside panel
- Job rows: icon cell + body (cat label + truncated desc + meta row) + right (badge + date/action)
- Status badges: all four states use semantic token colors from existing globals.css

---

---

## Phase 3 sketches

### 06 — Auth: Register page
| File | Description |
|------|-------------|
| `06-auth-register.html` | Same left-panel shell as login, different copy ("Join the community"). Right panel replaces email/password opener with a **role picker** — two cards (Post jobs / Find work) with a radio-check indicator in `surface-900`. Password field includes a strength bar. |

### 07 — Browse page (provider)
| File | Description |
|------|-------------|
| `07-browse-page.html` | Left sidebar with stacked filter lists (Location + Category), counts per item, `surface-900` active state. Main area: eyebrow header + search + sort controls. Jobs rendered as a **table** (icon / desc / area / timeframe / CTA) — consistent with dashboard rows. New jobs get teal left-border accent + "New" pulse badge. Pagination strip in footer. |

### 08 — Mobile: Active Jobs + Settings
| File | Description |
|------|-------------|
| `08-mobile-active-jobs-settings.html` | **Active Jobs**: cards with progress track (dot/line, 4 steps), status badge, "Start job" / "Mark complete" / "Details" CTAs. **Settings**: grouped list rows with icon tiles, chevrons, danger "Log out". Area picker shown as a **bottom sheet** — handle, scrollable list, `surface-900` selected row with teal check mark. Replaces Paper's `Dialog` + `RadioButton.Group` with a native-feeling sheet pattern. |

**New patterns introduced:**
- Role picker cards (register) — radio semantics, `surface-900` active border + check dot
- Bottom sheet (mobile settings) — replaces Paper Dialog for area selection
- Password strength bar — 3px track with brand fill + hint label
- Sidebar filter list (browse) — left-rail navigation with row counts
- Table view with "Accept →" inline CTA (browse) — matches dashboard row pattern

---

## Design system complete — all screens sketched

**Total files:** 8 sketches across 3 phases
**Coverage:** Landing · Login · Register · Client Dashboard · Provider Dashboard · Browse · Mobile Feed · Mobile Detail · Mobile Active Jobs · Mobile Settings

Ready for implementation planning (`/gsd-plan-phase`) or `--wrap-up` to package findings.
