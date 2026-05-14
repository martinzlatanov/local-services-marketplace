# Phase 12: UI Revamp — Stripe/Linear Design Language — Pattern Map

**Mapped:** 2026-05-14
**Files analyzed:** 11 (all modifications, no new files except theme extension in `_layout.tsx`)
**Sketches referenced:** 8 HTML files in `.planning/sketches/`

---

## Read-once policy

All current source files and all 8 sketches were read. Excerpts below are from those reads.
Do NOT re-read any source or sketch file unless you need a line range that is not already cited here.

---

## File Classification

| File | Role | Data Flow | Change Type |
|------|------|-----------|-------------|
| `apps/web/app/globals.css` | config/tokens | n/a | Token delta (retire amber from CTA, add shadow-auth update) |
| `apps/web/app/page.tsx` | component (page) | static render | Full visual rebuild — new layout structure |
| `apps/web/app/login/page.tsx` | component (page) | request-response | Left panel background + form button + focus ring + link color |
| `apps/web/app/register/page.tsx` | component (page) | request-response | Left panel background + role picker card style + password strength bar |
| `apps/web/app/browse/page.tsx` | component (page) | CRUD (fetch) | Full visual rebuild — sidebar + table layout |
| `apps/web/components/dashboard/ClientDashboard.tsx` | component | CRUD | Stat strip addition + panel system + tab style update |
| `apps/web/components/dashboard/JobCard.tsx` | component | display | New job-row pattern (icon cell + body + right CTA/badge) |
| `apps/mobile/app/(app)/(tabs)/feed.tsx` | component (screen) | CRUD + WebSocket | Card mode, filter chips, live bar, app-bar style |
| `apps/mobile/app/(app)/(tabs)/active-jobs.tsx` | component (screen) | CRUD | Card mode, progress track, conditional CTAs |
| `apps/mobile/app/(app)/(tabs)/settings.tsx` | component (screen) | event-driven | List rows → icon-tile rows; Dialog → bottom sheet |
| `apps/mobile/app/_layout.tsx` | config (provider) | n/a | Add custom Paper MD3 theme to `<PaperProvider>` |

---

## Shared Patterns

### SP-1 — Sticky Nav (web)
**Apply to:** `page.tsx`, dashboard pages rendered inside a layout
**Source sketch:** `03-auth-login.html` lines 19-29, `04-client-dashboard.html` lines 19-45

```html
<!-- target CSS -->
nav {
  border-bottom: 1px solid var(--surface-200);
  padding: 0 40px;
  height: 56px;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 20;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(12px);
}
.logo-dot { width: 7-8px; height: 7-8px; background: var(--brand); border-radius: 50%; }
/* primary nav button */
.btn-dark { background: var(--surface-900); color: #fff; font-weight: 600; border-radius: 6px; padding: 7px 14px; }
.btn-dark:hover { opacity: 0.88; }
/* ghost nav button */
.btn-ghost { color: var(--surface-600); background: none; border: none; }
```

**Tailwind translation:**
```tsx
<nav className="sticky top-0 z-20 h-14 flex items-center justify-between px-10 border-b border-surface-200 bg-white/[0.92] backdrop-blur-[12px]">
  <Link href="/" className="flex items-center gap-1.5 text-[15px] font-extrabold tracking-[-0.4px] text-surface-900">
    <span className="w-[7px] h-[7px] rounded-full bg-brand-500 mb-[1px]" aria-hidden="true" />
    LocalPro
  </Link>
  {/* ghost */}
  <Link href="/login" className="text-[13px] font-medium text-surface-600 px-3 py-1.5 rounded-md">Log in</Link>
  {/* dark CTA */}
  <Link href="/register" className="text-[13px] font-semibold text-white bg-surface-900 hover:opacity-[0.88] px-3.5 py-1.5 rounded-md transition-opacity">Post a job</Link>
</nav>
```

---

### SP-2 — Page Header (eyebrow + 800-weight title)
**Apply to:** `ClientDashboard.tsx`, `browse/page.tsx`, provider dashboard
**Source sketch:** `04-client-dashboard.html` lines 51-55

```html
.page-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--surface-400); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.eyebrow-line { width: 16px; height: 2px; background: var(--surface-300); }
.page-title { font-size: 28px; font-weight: 800; letter-spacing: -0.8px; color: var(--surface-900); }
.page-sub { font-size: 14px; color: var(--surface-500); margin-top: 4px; }
```

**Tailwind translation:**
```tsx
<div className="mb-8">
  <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase text-surface-400 mb-2">
    <span className="w-4 h-0.5 bg-surface-300" aria-hidden="true" />
    Dashboard
  </p>
  <h1 className="text-[28px] font-extrabold tracking-[-0.8px] text-surface-900">Welcome back</h1>
  <p className="text-sm text-surface-500 mt-1">Here's what's happening today.</p>
</div>
```

---

### SP-3 — 4-Cell Stat Strip
**Apply to:** `ClientDashboard.tsx`, provider dashboard
**Source sketch:** `04-client-dashboard.html` lines 72-82

```html
.stats-row { display: grid; grid-template-columns: repeat(4,1fr); border: 1px solid var(--s200); border-radius: 10px; overflow: hidden; margin-bottom: 32px; }
.stat-cell { background: var(--s0); padding: 20px 24px; border-right: 1px solid var(--s200); }
.stat-cell:last-child { border-right: none; }
.stat-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--s400); margin-bottom: 8px; }
.stat-val { font-size: 26px; font-weight: 800; letter-spacing: -1px; color: var(--s900); }
```

**Tailwind translation:**
```tsx
<div className="grid grid-cols-4 border border-surface-200 rounded-[10px] overflow-hidden mb-8">
  {[
    { label: 'Posted', value: counts.total },
    { label: 'Active', value: counts.active },
    { label: 'Completed', value: counts.completed },
    { label: 'Pending', value: counts.pending },
  ].map((stat, i, arr) => (
    <div key={stat.label} className={`bg-surface-0 px-6 py-5 ${i < arr.length - 1 ? 'border-r border-surface-200' : ''}`}>
      <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-surface-400 mb-2">{stat.label}</p>
      <p className="text-[26px] font-extrabold tracking-[-1px] text-surface-900">{stat.value}</p>
    </div>
  ))}
</div>
```

---

### SP-4 — Panel System (numbered header + 1px border)
**Apply to:** `ClientDashboard.tsx` left panel (post-job form)
**Source sketch:** `04-client-dashboard.html` lines 85-120

```html
.panel { background: var(--s0); border: 1px solid var(--s200); border-radius: 10px; overflow: hidden; }
.panel-header { padding: 16px 20px; border-bottom: 1px solid var(--s200); display: flex; align-items: center; justify-content: space-between; }
.panel-title { font-size: 14px; font-weight: 700; color: var(--s800); }
.panel-tag-num { font-size: 11px; font-weight: 700; color: var(--s400); font-family: var(--mono); }
.panel-body { padding: 20px; }
```

**Tailwind translation:**
```tsx
<div className="bg-surface-0 border border-surface-200 rounded-[10px] overflow-hidden">
  <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
    <span className="text-sm font-bold text-surface-800">Post a Job</span>
    <span className="text-[11px] font-bold text-surface-400 font-mono">01 /</span>
  </div>
  <div className="p-5">
    {/* form content */}
  </div>
</div>
```

---

### SP-5 — Job Row (icon + body + right/CTA)
**Apply to:** `JobCard.tsx`, `ClientDashboard.tsx` (jobs list), `browse/page.tsx` (job table)
**Source sketch:** `05-provider-dashboard.html` lines 79-100

```html
.job-row { display: grid; grid-template-columns: 36px 1fr auto; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--s100); }
.job-row.featured { background: var(--brand-light); border-left: 3px solid var(--brand); padding-left: 17px; }
.job-icon { width: 36px; height: 36px; border-radius: 8px; background: var(--s100); border: 1px solid var(--s200); display: flex; align-items: center; justify-content: center; font-size: 16px; }
.job-cat { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--s400); margin-bottom: 3px; }
.job-desc { font-size: 14px; font-weight: 600; color: var(--s800); }
.job-meta-row { display: flex; gap: 10px; }
.job-meta-tag { font-size: 11px; color: var(--s400); }
.btn-accept { font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 7px; background: var(--s900); color: #fff; }
```

**Tailwind translation:**
```tsx
<div className={`grid grid-cols-[36px_1fr_auto] gap-3.5 px-5 py-4 border-b border-surface-100 last:border-0 hover:bg-surface-50 transition-colors ${featured ? 'bg-brand-50 border-l-[3px] border-l-brand-500 pl-[17px]' : ''}`}>
  <div className="w-9 h-9 rounded-lg bg-surface-100 border border-surface-200 flex items-center justify-center text-base flex-shrink-0">
    {categoryIcon}
  </div>
  <div className="min-w-0">
    <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-surface-400 mb-0.5">{job.category}</p>
    <p className="text-sm font-semibold text-surface-800 truncate">{job.description}</p>
    <div className="flex gap-2.5 mt-1">
      <span className="text-[11px] text-surface-400">{job.cityArea}</span>
      <span className="text-[11px] text-surface-400">{job.timeframe}</span>
    </div>
  </div>
  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
    <StatusBadge status={job.status} />
    {showAccept && (
      <button className="text-[12px] font-bold px-3 py-1.5 rounded-[7px] bg-surface-900 text-white hover:opacity-[0.88] transition-opacity">
        Accept →
      </button>
    )}
  </div>
</div>
```

---

### SP-6 — Auth Split-Panel Shell
**Apply to:** `login/page.tsx`, `register/page.tsx`
**Source sketch:** `03-auth-login.html` lines 32-64

Current code to PRESERVE (do not touch):
- `useAuth`, `useRouter`, form state (`email`, `password`, `fieldErrors`, `topError`, `submitting`)
- `handleSubmit` function and all error-handling logic
- `aria-invalid`, `aria-describedby`, `role="alert"` accessibility attributes
- `Loader2` spinner in submit button

**Left panel — replace `from-brand-700 to-brand-900` gradient with `bg-surface-900`:**
```html
.left-panel { padding: 80px 64px; background: var(--s900); display: flex; flex-direction: column; justify-content: space-between; min-height: calc(100vh - 56px); }
.panel-logo-dot { width: 9px; height: 9px; background: var(--brand); border-radius: 50%; }
/* feature rows with icon tiles */
.feature-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--s800); border: 1px solid var(--s700); }
.feature-title { font-size: 14px; font-weight: 600; color: #fff; }
.feature-desc { font-size: 13px; color: var(--s400); }
/* stat row at bottom */
.panel-stat-row { display: flex; gap: 32px; padding-top: 32px; border-top: 1px solid var(--s800); }
.p-stat-num { font-size: 24px; font-weight: 800; color: #fff; }
.p-stat-num span { color: var(--brand); }
```

**Right panel form changes (login/register shared):**
- Submit button: `bg-surface-900 text-white hover:opacity-[0.88]` (replaces `bg-brand-600`)
- Input focus ring: `focus:ring-brand-500 focus:ring-[3px]` — no change needed, already teal
- Link color: `text-surface-900 font-bold` (replaces `text-brand-600`)
- Eyebrow above form heading: add `<p>` with tracking-[0.1em] uppercase text-surface-400

**Tailwind left panel:**
```tsx
<div className="hidden lg:flex lg:w-1/2 bg-surface-900 text-white flex-col justify-between px-16 py-20 min-h-[calc(100vh-56px)]">
  <div className="flex items-center gap-2 text-[18px] font-extrabold tracking-[-0.4px]">
    <span className="w-[9px] h-[9px] rounded-full bg-brand-500" aria-hidden="true" />
    LocalPro
  </div>
  <div>
    <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase text-surface-500 mb-4">
      <span className="w-5 h-0.5 bg-brand-500" />
      Account access
    </p>
    <h2 className="text-[clamp(32px,3.5vw,48px)] font-extrabold tracking-[-1.5px] text-white leading-[1.1] mb-4">Welcome back.</h2>
    <p className="text-base text-surface-400 leading-relaxed max-w-[360px] mb-10">Access your account to post jobs, find work, or manage your services.</p>
    <div className="flex flex-col gap-4">
      {features.map(f => (
        <div key={f.title} className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center flex-shrink-0 text-sm">{f.icon}</div>
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">{f.title}</p>
            <p className="text-[13px] text-surface-400">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
  <div className="flex gap-8 pt-8 border-t border-surface-800">
    <div>
      <p className="text-2xl font-extrabold tracking-[-1px] text-white font-mono"><span className="text-brand-500">10</span></p>
      <p className="text-xs text-surface-500 mt-0.5">City areas</p>
    </div>
    <div>
      <p className="text-2xl font-extrabold tracking-[-1px] text-white font-mono"><span className="text-brand-500">&lt;1h</span></p>
      <p className="text-xs text-surface-500 mt-0.5">Response time</p>
    </div>
  </div>
</div>
```

---

### SP-7 — Status Badge (PRESERVE existing tokens)
**Apply to:** `JobCard.tsx`, `ClientDashboard.tsx`, mobile screens
**Source:** `apps/web/components/dashboard/JobCard.tsx` lines 10-15

These token class names are correct and must not change:
```typescript
const statusColors = {
  [JobStatus.PENDING]:     'bg-status-pending-bg text-status-pending-text',
  [JobStatus.ACCEPTED]:    'bg-status-accepted-bg text-status-accepted-text',
  [JobStatus.IN_PROGRESS]: 'bg-status-progress-bg text-status-progress-text',
  [JobStatus.COMPLETED]:   'bg-status-completed-bg text-status-completed-text',
}
```
Add `border` class with matching token: `border-status-pending-border` etc. — the sketch shows `border: 1px solid` on badges.

---

### SP-8 — Tab Strip
**Apply to:** `ClientDashboard.tsx` (inner job tabs)
**Source:** `ClientDashboard.tsx` lines 99-113 (current, keep structure — only change active state color)

Current active state uses `bg-surface-0 shadow-sm` (already correct for inner pill strip). No change needed for the tab pill background. The outer top-level "My Jobs / Reviews" tab should adopt the same pattern. No amber introduced.

---

### SP-9 — Mobile App Bar (replaces `Appbar.Header`)
**Apply to:** `feed.tsx`, `active-jobs.tsx`, `settings.tsx`
**Source sketch:** `02-mobile-feed-variant-A.html` lines 62-79, `08-mobile-active-jobs-settings.html` lines 33-39

```css
/* app-bar */
background: surface-0 (#ffffff)
border-bottom: 1px solid surface-200
padding: 4px 20px 14px
/* title */
font-size: 22px; font-weight: 800; letter-spacing: -0.6px; color: surface-900
/* subtitle */
font-size: 13px; color: surface-400; margin-top: 2px
/* action icon button */
width: 36px; height: 36px; border-radius: 10px; background: surface-100; border: 1px solid surface-200
```

**RN StyleSheet translation:**
```typescript
appBar: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
appBarTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.6, color: '#0f172a' },
appBarSub: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
appBarAction: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
```

`Appbar.Header` is still the implementation vehicle — apply custom styles via `style` prop. Or replace with a plain `View` if Paper's Appbar doesn't accept sufficient style overrides. Keep safe area insets via `SafeAreaView` or existing layout.

---

### SP-10 — Mobile Outlined Card (replaces `mode="elevated"`)
**Apply to:** `feed.tsx`, `active-jobs.tsx`
**Source sketch:** `02-mobile-feed-variant-A.html` lines 116-144, `08-mobile-active-jobs-settings.html` lines 46-49

```typescript
// Paper Card change
<Card mode="outlined" style={styles.card} ...>

// StyleSheet
card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, elevation: 0, overflow: 'hidden' },
// featured variant (feed only)
cardFeatured: { borderColor: '#14b8a6' },
// teal accent strip at top of featured card (3px)
cardAccent: { height: 3, backgroundColor: '#14b8a6' },
```

---

### SP-11 — Mobile Filter Chips (feed only)
**Apply to:** `feed.tsx`
**Source sketch:** `02-mobile-feed-variant-A.html` lines 82-95

```typescript
chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' },
chipActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
chipText: { fontSize: 13, fontWeight: '500', color: '#475569' },
chipTextActive: { color: '#ffffff' },
```

Implementation: replace category text with a horizontal `ScrollView` of `TouchableOpacity` chips above the `FlatList`. State: `const [activeChip, setActiveChip] = useState<string>('All')`.

---

### SP-12 — Mobile 4-Step Progress Track
**Apply to:** `active-jobs.tsx`
**Source sketch:** `08-mobile-active-jobs-settings.html` lines 62-73

```css
.track-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #e2e8f0; background: #fff; }
.track-dot.done { border-color: #14b8a6; background: #14b8a6; }
.track-dot.active { border-color: #0f172a; background: #0f172a; box-shadow: 0 0 0 3px rgba(15,23,42,.12); }
.track-line { flex: 1; height: 2px; background: #e2e8f0; }
.track-line.done { background: #14b8a6; }
.track-lbl { font-size: 9px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #cbd5e1; }
.track-dot.done + .track-lbl, .track-dot.active + .track-lbl { color: #475569; }
```

**RN StyleSheet translation:**
```typescript
progressTrack: { flexDirection: 'row', alignItems: 'center' },
trackStep: { flexDirection: 'column', alignItems: 'center', gap: 4 },
trackDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#ffffff' },
trackDotDone: { borderColor: '#14b8a6', backgroundColor: '#14b8a6' },
trackDotActive: { borderColor: '#0f172a', backgroundColor: '#0f172a' },
trackLine: { flex: 1, height: 2, backgroundColor: '#e2e8f0', marginBottom: 16 },
trackLineDone: { backgroundColor: '#14b8a6' },
trackLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.04, textTransform: 'uppercase', color: '#cbd5e1', textAlign: 'center', width: 54 },
trackLabelActive: { color: '#475569' },
```

Status-to-step mapping:
```typescript
const STEPS = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'] as const
function stepState(step: string, jobStatus: JobStatus): 'done' | 'active' | 'pending' {
  const stepIdx = STEPS.indexOf(step as any)
  const statusIdx = STEPS.indexOf(jobStatus as any)
  if (stepIdx < statusIdx) return 'done'
  if (stepIdx === statusIdx) return 'active'
  return 'pending'
}
```

---

### SP-13 — Mobile Settings Row (icon tile + chevron)
**Apply to:** `settings.tsx`
**Source sketch:** `08-mobile-active-jobs-settings.html` lines 87-108

```css
.settings-group { background: var(--s0); border-top: 1px solid var(--s200); border-bottom: 1px solid var(--s200); }
.settings-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--s100); }
.settings-row-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--s100); }
.settings-row-label { font-size: 15px; font-weight: 600; color: var(--s800); }
.danger-btn { font-size: 15px; font-weight: 600; color: #dc2626; }
```

**RN translation:**
```typescript
settingsGroup: { backgroundColor: '#ffffff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e2e8f0', marginBottom: 8 },
settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
settingsRowIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
settingsRowLabel: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
dangerText: { fontSize: 15, fontWeight: '600', color: '#dc2626' },
```

Replace `List.Item` / `List.Section` / `List.Subheader` with plain `View`/`TouchableOpacity` rows. Keep `Portal` removed — no Dialog needed once bottom sheet is implemented.

---

### SP-14 — Mobile Bottom Sheet (replaces Paper Dialog)
**Apply to:** `settings.tsx`
**Source sketch:** `08-mobile-active-jobs-settings.html` lines 110-132
**Decision D-14:** Custom `Modal`/`View` overlay, no third-party library

```css
.sheet-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.3); z-index: 10; display: flex; align-items: flex-end; }
.sheet { width: 100%; background: var(--s0); border-radius: 20px 20px 0 0; padding-bottom: 34px; max-height: 70%; display: flex; flex-direction: column; }
.sheet-handle { width: 36px; height: 4px; border-radius: 2px; background: var(--s200); margin: 12px auto 16px; }
.sheet-title { font-size: 18px; font-weight: 800; letter-spacing: -0.4px; padding: 0 20px 14px; border-bottom: 1px solid var(--s200); }
.sheet-item { display: flex; align-items: center; justify-content: space-between; padding: 13px 20px; border-bottom: 1px solid var(--s100); }
.sheet-item.selected { background: var(--s900); }
.sheet-item-label { font-size: 15px; font-weight: 500; color: var(--s800); }
.sheet-item.selected .sheet-item-label { color: #fff; font-weight: 700; }
/* teal check dot */
.sheet-item.selected .sheet-item-check { background: var(--brand); border-color: var(--brand); }
.sheet-item.selected .sheet-item-check::after { content: '✓'; font-size: 11px; color: #fff; }
```

**RN implementation pattern:**
```typescript
// In settings.tsx — replace Portal/Dialog with:
<Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={() => setSheetVisible(false)}>
  <Pressable style={styles.sheetBackdrop} onPress={() => setSheetVisible(false)}>
    <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
      <View style={styles.sheetHandle} />
      <Text style={styles.sheetTitle}>Choose your service area</Text>
      <ScrollView style={styles.sheetList}>
        {CITY_AREAS.map(area => (
          <TouchableOpacity
            key={area}
            style={[styles.sheetItem, selectedArea === area && styles.sheetItemSelected]}
            onPress={() => setSelectedArea(area)}
          >
            <Text style={[styles.sheetItemLabel, selectedArea === area && styles.sheetItemLabelSelected]}>{area}</Text>
            <View style={[styles.sheetCheck, selectedArea === area && styles.sheetCheckSelected]}>
              {selectedArea === area && <Text style={styles.sheetCheckmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={handleUpdateArea} disabled={isSaving} style={styles.sheetConfirmBtn}>
        <Text style={styles.sheetConfirmText}>{isSaving ? 'Saving…' : 'Confirm area'}</Text>
      </TouchableOpacity>
    </Pressable>
  </Pressable>
</Modal>

// StyleSheet additions:
sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
sheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, maxHeight: '70%' },
sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', alignSelf: 'center', marginTop: 12, marginBottom: 16 },
sheetTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4, color: '#0f172a', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
sheetList: { flex: 1 },
sheetItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
sheetItemSelected: { backgroundColor: '#0f172a' },
sheetItemLabel: { fontSize: 15, fontWeight: '500', color: '#1e293b' },
sheetItemLabelSelected: { color: '#ffffff', fontWeight: '700' },
sheetCheck: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
sheetCheckSelected: { backgroundColor: '#14b8a6', borderColor: '#14b8a6' },
sheetCheckmark: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
sheetConfirmBtn: { marginHorizontal: 20, marginTop: 12, paddingVertical: 13, backgroundColor: '#0f172a', borderRadius: 8, alignItems: 'center' },
sheetConfirmText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
```

---

### SP-15 — React Native Paper Theme (D-15)
**Apply to:** `apps/mobile/app/_layout.tsx` line 49
**Current code:** `<PaperProvider>` with NO theme prop — this is the only new-code addition in the file

```typescript
// Add at top of _layout.tsx:
import { MD3LightTheme, PaperProvider } from 'react-native-paper'

const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0f172a',       // surface-900 — replaces default MD3 primary
    secondary: '#14b8a6',     // brand-500 — teal accent
    background: '#f8fafc',    // surface-50
    surface: '#ffffff',       // surface-0
    surfaceVariant: '#f1f5f9', // surface-100
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    error: '#b91c1c',          // status-error-700
  },
}

// In RootLayout:
<PaperProvider theme={appTheme}>
```

Elevation: `Card mode="outlined"` removes elevation entirely (SP-10). No separate elevation token change needed — mode handles it.

---

## Per-File Pattern Assignments

### `apps/web/app/globals.css`

**Role:** config/tokens | **Data flow:** n/a

**Current code to PRESERVE (lines 1-91):** All existing tokens — surface-*, brand-*, accent-*, status-*, radius-*, shadow-* variables, body styles, focus-visible ring, keyframes.

**Changes required:**
1. Add `shadow-auth` update — no change needed (already exists at line 63 as `--shadow-auth: 0 8px 32px 0 rgb(13 116 110 / 0.10)`)
2. `accent-500` stays in the file (D-02 says it's retired from CTAs but not deleted — it remains available for any future use)
3. Add pulse keyframe if not present — it already exists as `fade-in` and `slide-up`. ADD:

```css
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
@layer utilities {
  .animate-pulse-dot { animation: pulse-dot 1.5s infinite; }
}
```

Note: Tailwind's `animate-pulse` exists but uses `opacity: 0 → 1` — the sketches use `1 → 0.4 → 1`. Add `animate-pulse-dot` as a custom utility.

**No other changes to globals.css are needed.** All token classes already exist.

---

### `apps/web/app/page.tsx`

**Role:** component (page) | **Data flow:** static render

**Current code to PRESERVE:**
- `JOB_CATEGORIES`, `CITY_AREAS` imports and `categoryIcons` map (lines 1-14)
- Category icon components are used — keep them

**What changes:** Entire JSX. Replace with:
- Announcement bar (SP-1 nav variant)
- Sticky nav (SP-1)
- Split hero: left = eyebrow + H1 + sub + CTA pair, right = metrics row + live activity list
- Feature strip: 3-column grid with `01 /` numbering
- Categories as `<table>` (sketch `01-landing-page-variant-B.html` lines 176-201)
- Footer: `bg-surface-900` (replaces `bg-brand-950`)

**Key class changes (current → target):**
- `bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800` → remove entirely (split hero, no gradient)
- `bg-accent-500` CTA → `bg-surface-900 text-white hover:opacity-[0.88]`
- `bg-brand-950` footer → `bg-surface-900`
- Hero centered layout → `grid grid-cols-[1fr_1px_1fr]` split
- Step circles `bg-brand-100 text-brand-700` → monochrome numbering (feature-num in sketch: `font-size: 11px; color: var(--s300); font-family: mono`)

**Announcement bar (new):**
```tsx
<div className="bg-surface-900 text-white text-[13px] font-medium py-2.5 px-12 flex items-center justify-center gap-3">
  <span>Now live across 10 city areas</span>
  <span>·</span>
  <Link href="#" className="text-brand-500 font-semibold">View coverage →</Link>
</div>
```

**Live indicator dot (specifics from CONTEXT.md):**
```tsx
<span className="w-[7px] h-[7px] rounded-full bg-brand-500 animate-pulse-dot flex-shrink-0" aria-hidden="true" />
```

---

### `apps/web/app/login/page.tsx`

**Role:** component (page) | **Data flow:** request-response

**Current code to PRESERVE (lines 1-58, 60-62):**
- ALL imports
- `isLoading` spinner return
- `handleSubmit` function entirely
- `email`, `password`, `fieldErrors`, `topError`, `submitting` state
- `emailError`, `passwordError` derivations
- All `aria-*` attributes on inputs
- Error banner JSX structure (role="alert", XCircle icon)
- Input JSX structure (id, type, value, onChange, autoComplete, aria-invalid, aria-describedby)

**Changes only (JSX visual layer):**
1. Left panel: `bg-gradient-to-br from-brand-700 to-brand-900` → `bg-surface-900`, restructure content to match SP-6
2. Submit button: `bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300` → `bg-surface-900 hover:opacity-[0.88] disabled:opacity-45`
3. Footer link: `text-brand-600 hover:text-brand-700` → `text-surface-900 font-bold`
4. Add eyebrow line above "Welcome back" heading in right panel
5. Remove `shadow-[var(--shadow-auth)]` from form card or keep minimal — sketch uses no card shadow on right panel (form is direct on surface-50 background)

---

### `apps/web/app/register/page.tsx`

**Role:** component (page) | **Data flow:** request-response

**Current code to PRESERVE:** Same rules as login — all state, all logic, all fetch, all aria attributes.

**Changes only:**
1. Left panel: same SP-6 shell, different copy ("Join the community."), different feature bullets
2. Role picker cards: replace current border-based selection (lines 135-153) with SP-register pattern:

```tsx
{/* Role card — new pattern from sketch 06-auth-register.html lines 65-88 */}
<label className={`relative p-4 border rounded-[10px] bg-surface-0 cursor-pointer transition-all ${
  role === Role.CLIENT
    ? 'border-surface-900 shadow-[0_0_0_1px_#0f172a]'
    : 'border-surface-200 hover:border-surface-300'
}`}>
  <input type="radio" name="role" value={Role.CLIENT} checked={role === Role.CLIENT} onChange={...} className="sr-only" />
  {/* radio check dot — top right */}
  <span className={`absolute top-2.5 right-2.5 w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center ${
    role === Role.CLIENT ? 'bg-surface-900 border-surface-900' : 'border-surface-200 bg-surface-0'
  }`}>
    {role === Role.CLIENT && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
  </span>
  <p className="text-2xl mb-1">{/* icon emoji */}</p>
  <p className="text-sm font-bold text-surface-800">Post jobs</p>
  <p className="text-[12px] text-surface-400 leading-[1.4]">I need help with tasks</p>
</label>
```

3. Password strength bar (NEW — add after password input):

```tsx
{/* Password strength bar — driven by password state */}
{password.length > 0 && (
  <div className="mt-2">
    <div className="h-[3px] bg-surface-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-brand-500 rounded-full transition-all duration-300"
        style={{ width: `${strengthPercent(password)}%` }}
      />
    </div>
    <p className="text-[11px] text-surface-400 mt-1">{strengthLabel(password)}</p>
  </div>
)}
```

Strength helpers (add as module-level functions):
```typescript
function strengthPercent(pw: string): number {
  let score = 0
  if (pw.length >= 8)  score += 25
  if (pw.length >= 12) score += 25
  if (/[A-Z]/.test(pw)) score += 25
  if (/[0-9!@#$%^&*]/.test(pw)) score += 25
  return score
}
function strengthLabel(pw: string): string {
  const p = strengthPercent(pw)
  if (p <= 25) return 'Weak — add more characters'
  if (p <= 50) return 'Fair — try a number or symbol'
  if (p <= 75) return 'Good — almost there'
  return 'Strong'
}
```

4. Submit button: same as login → `bg-surface-900 hover:opacity-[0.88]`
5. Footer link: `text-surface-900 font-bold`

---

### `apps/web/app/browse/page.tsx`

**Role:** component (page) | **Data flow:** CRUD (fetch + filter state)

**Current code to PRESERVE (lines 1-40):**
- All imports
- All state: `jobs`, `selectedArea`, `selectedCategory`, `isLoadingJobs`
- `fetchJobs` useCallback with URLSearchParams construction
- useEffect calling `fetchJobs`
- Auth guard: `user?.role !== Role.PROVIDER` redirect
- Loading/error UI patterns

**Changes only (visual layer):**
1. Layout: replace current `max-w-4xl mx-auto` single column with `grid grid-cols-[260px_1fr]` sidebar + main
2. Filter buttons → sidebar stacked list (SP approach from sketch `07-browse-page.html` lines 39-58):

```tsx
{/* Sidebar */}
<aside className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto border-r border-surface-200 bg-surface-0 px-6 py-8">
  {/* Location section */}
  <div className="mb-7">
    <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.09em] uppercase text-surface-400 mb-2.5">
      <span className="w-3.5 h-0.5 bg-surface-200" />
      Location
    </p>
    {['All', ...CITY_AREAS].map(area => (
      <button key={area} onClick={() => setSelectedArea(area)}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[7px] text-[13px] font-medium transition-colors mb-0.5 ${
          selectedArea === area
            ? 'bg-surface-900 text-white font-semibold'
            : 'text-surface-600 hover:bg-surface-50'
        }`}>
        {area}
      </button>
    ))}
  </div>
</aside>
```

3. Job cards → table rows using `JobCard` (or inline job-row pattern SP-5)
4. Active filter pill: `bg-brand-600 text-white` → `bg-surface-900 text-white` (lines 89-97 current code)
5. "Browse →" route button: `bg-brand-600` → `bg-surface-900`

Note: `JobCard` is imported here AND in `JobDashboard`. Changes to `JobCard.tsx` affect both. See `JobCard.tsx` section below.

---

### `apps/web/components/dashboard/ClientDashboard.tsx`

**Role:** component | **Data flow:** CRUD

**Current code to PRESERVE (lines 1-56):**
- All imports
- Props interface
- All state and useCallback/useEffect for reviews fetching
- `filteredJobs` and `counts` derivations
- `JobDashboard`, `JobPostingForm`, `ReviewDisplay` child component calls

**Changes only:**
1. Add stat strip above the tab area (SP-3) — compute counts from `jobs` prop
2. Add page header pattern (SP-2) above stat strip
3. Tab strip outer shell: already uses `bg-surface-100 p-1 rounded-[var(--radius-btn)] w-fit` — this is correct per sketch. Keep as-is.
4. Left panel (`lg:col-span-2`): wrap `JobPostingForm` in SP-4 panel shell
5. Right panel (`lg:col-span-3`): wrap jobs list in SP-4 panel shell with `02 /` tag

---

### `apps/web/components/dashboard/JobCard.tsx`

**Role:** component (shared) | **Data flow:** display

**Current code to PRESERVE:**
- All imports
- `statusColors` map (lines 10-15) — SP-7
- `categoryIcons` map (lines 17-26)
- Props interface

**Changes:** Full JSX rewrite to SP-5 job-row pattern. The card is used in:
- `browse/page.tsx` (provider browsing)
- `JobDashboard` (client + provider dashboard)

Keep it generic — `showAccept` prop controls whether "Accept →" CTA appears:
```typescript
interface JobCardProps {
  job: JobDto
  showAccept?: boolean
  onAccept?: () => void
  featured?: boolean
}
```

**Note:** This prop extension is a minimal addition — no new logic, just conditional CTA rendering already implied by the design.

---

### `apps/mobile/app/(app)/(tabs)/feed.tsx`

**Role:** component (screen) | **Data flow:** CRUD + WebSocket

**Current code to PRESERVE (lines 1-116):**
- ALL imports
- ALL state and effects (token load, fetchJobs, handleJobUpdated, useJobsWebSocket, refreshControl)
- `FlatList` with `refreshControl` and `keyExtractor`
- Loading and empty states
- WebSocket integration entirely

**Changes only:**
1. `renderItem` function — replace `Card mode="elevated"` with SP-10 outlined card + filter state:
```typescript
const renderItem = ({ item, index }: { item: JobDto; index: number }) => {
  const isFeatured = index === 0  // or based on recency threshold
  return (
    <View style={[styles.card, isFeatured && styles.cardFeatured]}>
      {isFeatured && <View style={styles.cardAccent} />}
      <View style={styles.cardInner}>
        {/* category label row + badge */}
        {/* description */}
        {/* 2-col meta grid: area + timeframe */}
        {/* Accept CTA (pinned) */}
      </View>
    </View>
  )
}
```

2. Replace `<Appbar.Header>` with a custom View using SP-9 app bar pattern
3. Add filter chips `ScrollView` between app bar and `FlatList` using SP-11
4. Add live bar indicator below chips (sketch line 97-109)

---

### `apps/mobile/app/(app)/(tabs)/active-jobs.tsx`

**Role:** component (screen) | **Data flow:** CRUD

**Current code to PRESERVE (lines 1-82):**
- All imports (except `Appbar` may shift to plain `View`)
- All state and token effects
- `fetchJobs` useCallback
- `FlatList`, `RefreshControl`, empty state, loading state

**Changes only:**
1. Replace `<Appbar.Header>` with SP-9 custom app bar
2. `renderItem`: replace `Card mode="elevated"` with SP-10 outlined card
3. Add SP-12 progress track inside each card (after description, before CTA strip)
4. Add SP-7 status badge in card header
5. Add conditional CTA strip (from sketch `08-mobile-active-jobs-settings.html` lines 76-78):
```typescript
// Conditional CTA based on status
{item.status === JobStatus.ACCEPTED && (
  <TouchableOpacity style={styles.btnSmDark}><Text style={styles.btnSmDarkText}>Start job</Text></TouchableOpacity>
)}
{item.status === JobStatus.IN_PROGRESS && (
  <TouchableOpacity style={styles.btnSmDark}><Text style={styles.btnSmDarkText}>Mark complete</Text></TouchableOpacity>
)}
<TouchableOpacity style={styles.btnSmOutline}><Text style={styles.btnSmOutlineText}>Details</Text></TouchableOpacity>
```

---

### `apps/mobile/app/(app)/(tabs)/settings.tsx`

**Role:** component (screen) | **Data flow:** event-driven

**Current code to PRESERVE:**
- `useAuth`, `useServiceArea` hooks usage
- `serviceArea`, `saveServiceArea`, `user` data
- `handleUpdateArea` logic (lines 20-29) — keep this function unchanged
- `isSaving` state

**Changes — replace almost all JSX:**
1. Remove: `Dialog`, `Portal`, `RadioButton.Group`, `List.Section`, `List.Item`, `List.Subheader`, `Button` from imports
2. Add: `Modal`, `ScrollView`, `TouchableOpacity`, `Pressable` from `react-native`
3. Remove Paper Dialog: replace with SP-14 bottom sheet
4. Replace `List.Item` rows with SP-13 settings rows
5. Replace `Button mode="text" textColor={theme.colors.error}` with a plain `TouchableOpacity` with danger text style
6. Keep `Appbar.Header` or switch to SP-9 custom view (SP-9 is simpler — plain View)

**Import delta (settings.tsx):**
```typescript
// REMOVE from imports:
import { Appbar, Button, Dialog, List, Portal, RadioButton, useTheme } from 'react-native-paper'
// ADD to react-native imports:
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
// ADD to react-native-paper (keep Text for consistency):
import { Text } from 'react-native-paper'
// REMOVE:
const theme = useTheme()  // no longer needed
```

---

### `apps/mobile/app/_layout.tsx`

**Role:** config (provider) | **Data flow:** n/a

**Current code to PRESERVE (lines 1-58):** Everything except line 49 `<PaperProvider>`.

**Only change:** Line 49 `<PaperProvider>` → `<PaperProvider theme={appTheme}>`.
Add `appTheme` constant and updated import per SP-15. This is a NEW code addition (no existing analog).

---

## No Analog Found

| File | Reason |
|------|--------|
| `apps/mobile/app/_layout.tsx` PaperProvider theme | No existing Paper theme customization anywhere in the codebase. Pattern comes from React Native Paper MD3 docs + D-15 values. |
| Password strength bar in `register/page.tsx` | No existing strength indicator in the codebase. Pattern from sketch `06-auth-register.html` + CONTEXT.md specifics. |
| Mobile bottom sheet in `settings.tsx` | No existing bottom sheet pattern in the codebase. Pattern from sketch `08-mobile-active-jobs-settings.html` lines 110-132 + D-14. |
| Mobile filter chips in `feed.tsx` | No existing chip row in mobile codebase. Pattern from sketch `02-mobile-feed-variant-A.html` lines 82-95. |
| 4-step progress track in `active-jobs.tsx` | No existing progress track in codebase. Pattern from sketch `08-mobile-active-jobs-settings.html` lines 62-73. |

---

## Token Quick-Reference (for implementors)

| Token variable | Tailwind class | Hex | Use |
|----------------|---------------|-----|-----|
| `--color-surface-900` | `bg-surface-900` / `text-surface-900` | `#0f172a` | Primary button bg, left panel bg, active states |
| `--color-surface-50` | `bg-surface-50` | `#f8fafc` | Page background, right form panel |
| `--color-surface-0` | `bg-surface-0` | `#ffffff` | Card bg, nav bg |
| `--color-surface-200` | `border-surface-200` | `#e2e8f0` | Card borders, dividers |
| `--color-brand-500` | `text-brand-500` / `border-brand-500` | `#14b8a6` | Teal dot, focus ring, featured left-border, live indicator, teal check |
| `--color-accent-500` | (retired from CTAs) | `#f59e0b` | Do NOT use on buttons |

**Button hover pattern:** `hover:opacity-[0.88]` on `bg-surface-900` buttons everywhere.

**Focus ring pattern (web inputs):** `focus:outline-none focus:ring-2 focus:ring-brand-500` — already in login/register, keep.
