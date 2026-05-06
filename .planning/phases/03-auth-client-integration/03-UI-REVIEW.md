# Phase 3 — UI Review

**Audited:** 2026-05-06
**Baseline:** 03-UI-SPEC.md (approved)
**Screenshots:** Captured to .planning/ui-reviews/03-20260506-115532/

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | All UI-SPEC copy requirements matched exactly |
| 2. Visuals | 3/4 | Mobile auth screens missing isLoading indicator |
| 3. Color | 2/4 | Accent color misapplied to links, logout button, and role selectors |
| 4. Typography | 4/4 | All font sizes and weights match UI-SPEC scale |
| 5. Spacing | 2/4 | Arbitrary spacing values (12px) and incorrect page padding |
| 6. Registry Safety | 4/4 | No shadcn initialization, no third-party registries |

**Overall: 19/24**

---

## Top 3 Priority Fixes

1. **Mobile missing isLoading indicator** — Users see blank auth forms during auth rehydration instead of loading spinner. Fix: Add isLoading check to login/register/index screens, render RN Paper `<ActivityIndicator color={theme.colors.primary} />` when isLoading is true.
2. **Accent color misuse** — Web links and logout button use indigo-600 (accent) reserved for primary CTAs. Fix: Change link text to `text-gray-600`, logout button to `bg-gray-100 text-gray-700`, mobile role selector selected state to `theme.colors.surfaceVariant`.
3. **Spacing scale violations** — Web uses undeclared 12px spacing (p-3, py-3) and 48px page padding instead of 64px. Fix: Replace p-3 with p-4, py-3 with py-2, py-12 with py-16; mobile role button paddingHorizontal to 16px.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)
All copy elements match UI-SPEC.md exactly:
- Web login heading "Sign in to your account" (apps/web/app/login/page.tsx:65)
- Web register heading "Create your account" (apps/web/app/register/page.tsx:80)
- All CTA labels, link text, and error messages match contract
- Mobile headings, CTAs, and error messages match contract
- No generic labels ("Submit", "Click Here") found in audit scope

### Pillar 2: Visuals (3/4)
- **PASS:** Web auth screens render centered form card with correct visual hierarchy (heading → form → CTA → links)
- **PASS:** Web loading state renders full-page indigo-600 spinner per UI-SPEC States section
- **FAIL:** Mobile login/register/index screens do not check `isLoading` state, no ActivityIndicator rendered during auth rehydration (violates UI-SPEC States requirement)
- **PASS:** All buttons have labels, no icon-only buttons present

### Pillar 3: Color (2/4)
- **FAIL:** Web login/register links use `text-indigo-600` (accent) for non-CTA elements (apps/web/app/login/page.tsx:112, apps/web/app/register/page.tsx:143) — violates "accent only for submit buttons" rule
- **FAIL:** Web dashboard logout button uses `bg-indigo-600` (accent) for secondary action (apps/web/app/dashboard/page.tsx:31)
- **FAIL:** Mobile role selector uses hardcoded indigo-600 for selected state, not restricted to submit buttons
- **FAIL:** Mobile styles use hardcoded color values (#d1d5db, #4f46e5) instead of React Native Paper theme tokens
- **PASS:** Destructive colors (red-600, red-400) only used for error states
- **PASS:** Loading spinner uses indigo-600 as permitted by UI-SPEC States section

### Pillar 4: Typography (4/4)
- **PASS:** Exactly 2 font weights (400, 600) used across all platforms
- **PASS:** All text roles match UI-SPEC size/weight:
  - Heading: 24px text-2xl font-semibold / headlineSmall
  - Label: 14px text-sm font-semibold / labelLarge
  - Body: 16px text-base font-normal / bodyLarge
- **PASS:** No undeclared font sizes or weights found in audit scope

### Pillar 5: Spacing (2/4)
- **FAIL:** Web uses `p-3` (12px) and `py-3` (12px) for error banners and buttons, not in UI-SPEC spacing scale (4,8,16,24,32,48,64px)
- **FAIL:** Web page padding uses `py-12` (48px, 2xl) instead of `py-16` (64px, 3xl) for page-level spacing
- **FAIL:** Mobile role button `paddingHorizontal:12` (12px) not in spacing scale
- **PASS:** Card padding `p-6` (24px, lg), form gap `gap-4` (16px, md), input padding `p-2` (8px, sm) match scale

### Pillar 6: Registry Safety (4/4)
- shadcn not initialized per UI-SPEC (shadcn_initialized: false)
- No third-party shadcn registries declared in UI-SPEC Registry Safety section
- All UI components are hand-rolled (web) or React Native Paper (mobile)
- No registry safety flags raised

---

## Files Audited
Web:
- apps/web/app/login/page.tsx
- apps/web/app/register/page.tsx
- apps/web/app/dashboard/page.tsx
- apps/web/contexts/AuthContext.tsx
- apps/web/app/layout.tsx
- apps/web/app/globals.css
- apps/web/tailwind.config.ts

Mobile:
- apps/mobile/app/(auth)/login.tsx
- apps/mobile/app/(auth)/register.tsx
- apps/mobile/app/index.tsx
- apps/mobile/app/_layout.tsx
- apps/mobile/contexts/AuthContext.tsx
