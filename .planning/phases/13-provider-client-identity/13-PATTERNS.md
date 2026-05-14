# Phase 13: Provider & Client Identity - Pattern Map

**Mapped:** 2026-05-14
**Files analyzed:** 10 new/modified files
**Analogs found:** 9 / 10

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `apps/web/drizzle/0002_add_user_identity.sql` | migration | batch | `apps/web/drizzle/0000_initial_user.sql` | role-match |
| `apps/web/lib/db/schema.ts` | model | CRUD | `apps/web/lib/db/schema.ts` (existing users table) | exact (modify) |
| `packages/types/src/index.ts` | model | transform | `packages/types/src/index.ts` (existing DTOs) | exact (modify) |
| `apps/web/app/api/users/[id]/route.ts` | controller | request-response | `apps/web/app/api/jobs/[id]/route.ts` | exact |
| `apps/web/components/dashboard/JobDetailCard.tsx` | component | request-response | `apps/web/components/dashboard/JobDetailCard.tsx` (existing) | exact (modify) |
| `apps/web/components/ui/AvatarInitials.tsx` | component | transform | `apps/web/components/ui/LiveIndicator.tsx` | partial |
| `apps/web/app/providers/[id]/page.tsx` | component | request-response | `apps/web/app/dashboard/provider/[id]/page.tsx` | exact |
| `apps/mobile/lib/api.ts` | service | request-response | `apps/mobile/lib/api.ts` (existing) | exact (modify) |
| `apps/mobile/app/(app)/jobs/[id].tsx` | component | request-response | `apps/mobile/app/(app)/jobs/[id].tsx` (existing) | exact (modify) |
| `apps/mobile/components/AvatarInitials.tsx` | component | transform | none | no analog |

---

## Pattern Assignments

### `apps/web/drizzle/0002_add_user_identity.sql` (migration, batch)

**Analog:** `apps/web/drizzle/0000_initial_user.sql`

**Note:** `0001_lean_juggernaut.sql` contains only `ALTER COLUMN` (type change). The new migration needs `ALTER TABLE … ADD COLUMN`. Use the header/naming convention from `0000` but the SQL operation is `ADD COLUMN`, not `CREATE TABLE` or `ALTER COLUMN`.

**Reference format** (`apps/web/drizzle/0000_initial_user.sql`, lines 1-11):
```sql
-- 0000_initial_user.sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);
```

**Target pattern for new migration:**
```sql
-- 0002_add_user_identity.sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
```

Both columns nullable, no default — existing rows unaffected (D-08).

---

### `apps/web/lib/db/schema.ts` (model, CRUD — modify existing)

**Analog:** `apps/web/lib/db/schema.ts` (lines 4-10, existing users table)

**Existing users table definition** (lines 4-10):
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 32 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
```

**Columns to add** — append inside the `pgTable` call body, matching existing column declaration style:
```typescript
  name: varchar("name", { length: 100 }),
  avatarUrl: text("avatar_url"),
```

No `.notNull()` and no `.default(...)` on either column — nullable by Drizzle convention when neither is specified.

---

### `packages/types/src/index.ts` (model, transform — modify existing)

**Analog:** `packages/types/src/index.ts` (lines 96-101, `AuthUserDto` interface)

**Existing DTO shape to mirror** (lines 96-101):
```typescript
export interface AuthUserDto {
  id: string
  email: string
  role: Role
  createdAt: string
}
```

**New interface to append** (D-10 — do NOT modify `AuthUserDto`):
```typescript
export interface PublicUserDto {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: Role
  createdAt: string
}
```

Add after the `AuthUserDto` block. The `Role` enum already exists on line 12 — no new imports needed.

---

### `apps/web/app/api/users/[id]/route.ts` (controller, request-response — new file)

**Analog:** `apps/web/app/api/jobs/[id]/route.ts`

**Imports pattern** (jobs/[id]/route.ts, lines 1-6):
```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { jobs } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { UpdateJobStatusRequest, JobDto, ApiSuccessResponse, ApiErrorResponse, JobStatus } from '@/lib/types'
import { eq } from 'drizzle-orm'
```

**Auth guard pattern** (jobs/[id]/route.ts, lines 8-10):
```typescript
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })
```

**DB lookup + not-found pattern** (jobs/[id]/route.ts, lines 18-21):
```typescript
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
  if (!job) {
    return NextResponse.json({ errors: { job: 'not_found' } }, { status: 404 })
  }
```

**DTO projection + success response pattern** (jobs/[id]/route.ts, lines 23-37):
```typescript
  const jobDto: JobDto = {
    id: String(job.id),
    status: job.status as JobStatus,
    version: job.version,
    // ... field mapping
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }
  return NextResponse.json({ data: jobDto } as ApiSuccessResponse<JobDto>)
```

**Target pattern for `/api/users/[id]/route.ts`:**
```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { PublicUserDto, ApiSuccessResponse, Role } from '@local/types'
import { eq } from 'drizzle-orm'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  const { id } = await params
  const userId = parseInt(id, 10)
  if (isNaN(userId)) {
    return NextResponse.json({ errors: { id: 'invalid' } }, { status: 400 })
  }

  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!row) {
    return NextResponse.json({ errors: { user: 'not_found' } }, { status: 404 })
  }

  const dto: PublicUserDto = {
    id: String(row.id),
    email: row.email,
    name: row.name ?? null,
    avatarUrl: row.avatarUrl ?? null,
    role: row.role as Role,
    createdAt: row.createdAt.toISOString(),
  }

  return NextResponse.json({ data: dto } as ApiSuccessResponse<PublicUserDto>)
}
```

Note: `passwordHash` must NOT be included in `dto`. Only the fields in `PublicUserDto` are returned.

---

### `apps/web/components/dashboard/JobDetailCard.tsx` (component, request-response — modify existing)

**Analog:** `apps/web/components/dashboard/JobDetailCard.tsx` (lines 43-61 — existing secondary data fetch pattern)

**Existing secondary fetch pattern** (lines 43-61):
```typescript
  useEffect(() => {
    if (!user || job.status !== JobStatus.COMPLETED) return

    const checkReviewStatus = async () => {
      try {
        const jobId = typeof job.id === 'string' ? parseInt(job.id, 10) : job.id
        const res = await fetch(`/api/reviews?jobId=${jobId}`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          const userReview = (data.data || []).find((r: any) => String(r.reviewerId) === String(user.id))
          setHasReviewed(!!userReview)
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err)
      }
    }

    checkReviewStatus()
  }, [job.id, user, job.status])
```

**Provider identity insertion point** (lines 98-106, where provider is currently shown with a placeholder):
```typescript
      {/* Status-specific info */}
      {job.status === JobStatus.ACCEPTED && job.providerId && userRole === Role.CLIENT && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20 flex items-start gap-3">
          <User className="h-5 w-5 flex-shrink-0 mt-0.5 opacity-75" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Provider Assigned</p>
            <p className="text-xs opacity-75 mt-0.5">A service professional has accepted your job and will be in touch soon.</p>
          </div>
        </div>
      )}
```

**Pattern to apply:** Replace the placeholder with inline identity section (see UI-SPEC §2). Add a `useState<PublicUserDto | null>` and a `useState<boolean>` for identity loading. Add a `useEffect` that calls `GET /api/users/[providerId]` when `job.providerId` is non-null, following the same try/catch structure as the existing `checkReviewStatus` fetch. On error, silently omit the section (D-09, UI-SPEC interaction states). The section is also keyed to `job.providerId !== null`, not to job status alone (D-01).

**Skeleton loading pattern** (from ReviewDisplay.tsx, lines 252-259):
```typescript
    return (
      <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6">
        <div className="space-y-4">
          <div className="h-4 bg-surface-200 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-surface-200 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-surface-200 rounded animate-pulse w-2/3" />
        </div>
      </div>
    )
```

For the inline skeleton, use: avatar placeholder `w-8 h-8 rounded-full bg-surface-100 animate-pulse` + two div lines.

---

**Note on `JobCard.tsx`:** `JobCard.tsx` (lines 28-55) is a compact list card used in the provider feed — it has no expanded detail view and no `job.providerId` display logic. Per D-01, inline identity goes in `JobDetailCard.tsx` (the expanded detail component rendered when a client clicks a job), not `JobCard.tsx`. The target file is confirmed as `JobDetailCard.tsx`.

---

### `apps/web/components/ui/AvatarInitials.tsx` (component, transform — new file)

**Analog:** `apps/web/components/ui/LiveIndicator.tsx` (partial — same pattern: small presentational component, single named export, no state, props-driven)

**LiveIndicator pattern** (for reference — small presentational component structure):
```typescript
'use client'   // (may or may not be needed for AvatarInitials; it has no hooks)

interface Props {
  // typed prop interface
}

export default function ComponentName({ prop }: Props) {
  // pure render
}
```

**Target pattern for `AvatarInitials`:**
```typescript
interface AvatarInitialsProps {
  name: string | null
  email: string
  avatarUrl: string | null
  size: 'sm' | 'lg'   // sm = 32px (inline), lg = 80px (profile header)
}

export default function AvatarInitials({ name, email, avatarUrl, size }: AvatarInitialsProps) {
  // Derive initials per D-06:
  // if name → first letter of each word, max 2 chars, uppercased
  // if name null → first char of email, uppercased
  const initials = name
    ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : email[0].toUpperCase()

  const dimensions = size === 'sm'
    ? 'w-8 h-8 text-[12px]'
    : 'w-20 h-20 text-[28px]'

  if (avatarUrl) {
    return <img src={avatarUrl} className={`${dimensions} rounded-full object-cover`} alt="" aria-hidden="true" />
  }

  return (
    <div className={`${dimensions} rounded-full bg-surface-900 text-surface-0 flex items-center justify-center font-semibold select-none`}>
      {initials}
    </div>
  )
}
```

Colors: `bg-surface-900` (`#0f172a`) and `text-surface-0` (`#ffffff`) per UI-SPEC §Color.

---

### `apps/web/app/providers/[id]/page.tsx` (component, request-response — new file)

**Analog:** `apps/web/app/dashboard/provider/[id]/page.tsx`

**Planner note:** The existing file at `apps/web/app/dashboard/provider/[id]/page.tsx` is a partial implementation — it explicitly skips identity fetching (see comment line 38-40: "In a full implementation, you'd have a dedicated /api/providers endpoint"). Phase 13 creates the parallel route at `/providers/[id]` with the full implementation. CONTEXT does not specify whether the existing `/dashboard/provider/[id]/page.tsx` should be deleted — leave the decision to the planner.

**Imports pattern** (dashboard/provider/[id]/page.tsx, lines 1-9):
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ReviewDTO, Role } from '@/lib/types'
import ReviewDisplay from '@/components/ReviewDisplay'
import { Loader2, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
```

**Data fetching pattern** (dashboard/provider/[id]/page.tsx, lines 33-60):
```typescript
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const reviewsRes = await fetch(`/api/reviews?userId=${providerId}&approved=true`)
        if (!reviewsRes.ok) {
          throw new Error('Failed to fetch reviews')
        }
        const reviewsData = await reviewsRes.json()
        setReviews(reviewsData.data?.reviews || [])
        setAverageRatings(reviewsData.data?.averageRatings || {})
      } catch (err: any) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [providerId])
```

**For the new page**, extend this to also fetch `GET /api/users/[id]` and store as `PublicUserDto`. Both fetches run in the same `try` block. On any fetch failure, set the error state and show the error message per UI-SPEC: `"Couldn't load this profile. Refresh to try again."`.

**Profile header card pattern** (dashboard/provider/[id]/page.tsx, lines 81-91):
```typescript
        <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-10 w-10 text-brand-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-surface-900 mb-1">Service Provider</h1>
              <p className="text-surface-600">Provider ID: {providerId}</p>
            </div>
          </div>
        </div>
```

Replace the `User` icon placeholder with `<AvatarInitials size="lg" ... />`. Replace hardcoded text with `PublicUserDto` fields.

**Loading skeleton pattern** (ReviewDisplay.tsx, lines 252-259 — reuse for whole-page skeleton):
```typescript
      <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6">
        <div className="space-y-4">
          <div className="h-4 bg-surface-200 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-surface-200 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-surface-200 rounded animate-pulse w-2/3" />
        </div>
      </div>
```

**Star rating display** (ReviewDisplay.tsx `StarRating` component, lines 28-48):
```typescript
function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeMap[size]} ${
            star <= Math.round(rating) ? 'fill-brand-500 text-brand-500' : 'text-surface-300'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
```

**Note per UI-SPEC §Color:** The profile page uses `fill-accent-500 stroke-accent-500` (amber `#f59e0b`) for star glyphs, not `fill-brand-500`. This differs from `ReviewDisplay.tsx`'s current usage of `fill-brand-500`. The new page must use `accent-500` per the UI design contract. The existing `ReviewDisplay.tsx` is not changed.

**Average rating formula** (from CONTEXT §Specifics + reviews/route.ts lines 396-434):
```
mean( clientCommunication, clientQuality, clientPunctuality )
across all reviews where reviewType === 'client'
```
The reviews endpoint already returns pre-computed `averageRatings` in the `?userId=X&approved=true` response — use `(averageRatings.communication + averageRatings.quality + averageRatings.punctuality) / 3`. Show `"No rating yet"` when all three are 0 or when there are no qualifying reviews.

---

### `apps/mobile/lib/api.ts` (service, request-response — modify existing)

**Analog:** `apps/mobile/lib/api.ts` (lines 19-24, `getJob` function)

**Existing function signature pattern** (lines 19-24):
```typescript
export async function getJob(token: string, id: string): Promise<JobDto> {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return parseResponse<JobDto>(res)
}
```

**`parseResponse` utility** (lines 4-10 — shared by all functions):
```typescript
async function parseResponse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => null)) as ApiSuccessResponse<T> | ApiErrorResponse | null
  if (!res.ok) {
    throw { status: res.status, ...(data as ApiErrorResponse | null) }
  }
  return (data as ApiSuccessResponse<T>).data
}
```

**New function to add** (D-11):
```typescript
export async function getUser(token: string, userId: string): Promise<PublicUserDto> {
  const res = await fetch(`${API_BASE}/api/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return parseResponse<PublicUserDto>(res)
}
```

Add `PublicUserDto` to the import from `@local/types` (line 2). Append `getUser` after `updateJobStatus`.

---

### `apps/mobile/app/(app)/jobs/[id].tsx` (component, request-response — modify existing)

**Analog:** `apps/mobile/app/(app)/jobs/[id].tsx` (full file — modify in place)

**Existing state + secondary data pattern** (lines 14-19):
```typescript
  const [token, setToken] = useState<string | null>(null)
  const [job, setJob] = useState<JobDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)
```

**Pattern to extend:** Add `const [clientUser, setClientUser] = useState<PublicUserDto | null>(null)` and `const [isClientLoading, setIsClientLoading] = useState(false)`. Add a new `useEffect` dependent on `[job, token]` that calls `getUser(token, job.clientId)` after job loads, following the same try/catch/finally structure as `loadJob` (lines 38-58). On error, silently omit the section (D-02 says "always shown when job data is loaded" but UI-SPEC says error = silently omit).

**Existing meta-row pattern** (lines 139-156 — label/value row structure to follow):
```typescript
            <View style={detailStyles.metaGrid}>
              <View style={detailStyles.metaCell}>
                <Text style={detailStyles.metaLabel}>Area</Text>
                <Text style={detailStyles.metaValue}>{job.cityArea}</Text>
              </View>
              <View style={detailStyles.metaCell}>
                <Text style={detailStyles.metaLabel}>Timeframe</Text>
                <Text style={detailStyles.metaValue}>{job.timeframe}</Text>
              </View>
            </View>
```

**Existing eyebrow label style** (line 222):
```typescript
  metaLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 },
```

Use this same `metaLabel` style for the "CLIENT" eyebrow (UI-SPEC §3). The client section goes after the description block, separated by a `Divider` from React Native Paper.

**Mobile skeleton loading pattern** (lines 124-127 — existing loading state to match):
```typescript
      {isLoading ? (
        <View style={detailStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
```

For the identity section skeleton specifically, use opacity-animated `View` placeholders (UI-SPEC §3) rather than `ActivityIndicator`. Use `Animated.Value` from React Native — matching the approach already used for other loading states in the broader mobile codebase.

---

### `apps/mobile/components/AvatarInitials.tsx` (component, transform — new file)

**No analog found.** No custom presentational component exists in the mobile codebase.

**Pattern source:** Follow the web `AvatarInitials.tsx` logic (above) adapted for React Native Paper. Use `Avatar.Text` from `react-native-paper` for the initials circle and `Avatar.Image` when `avatarUrl` is set.

```typescript
import { Avatar } from 'react-native-paper'

interface AvatarInitialsProps {
  name: string | null
  email: string
  avatarUrl: string | null
  size: number  // 40 for inline, 80 for header (numeric dp value for RN Paper)
}

export default function AvatarInitials({ name, email, avatarUrl, size }: AvatarInitialsProps) {
  const initials = name
    ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : email[0].toUpperCase()

  if (avatarUrl) {
    return <Avatar.Image size={size} source={{ uri: avatarUrl }} />
  }

  return <Avatar.Text size={size} label={initials} />
}
```

Apply theme customization via `style` prop on `Avatar.Text` to match `surface-900` background if default Paper theme color differs.

---

## Shared Patterns

### Authentication guard
**Source:** `apps/web/lib/auth.ts` (lines 31-56)
**Apply to:** `apps/web/app/api/users/[id]/route.ts`
```typescript
export async function getAuthenticatedUser(req: Request): Promise<AuthUserDto | null> {
  let token: string | undefined
  const authHeader = req.headers.get("Authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7)
  }
  if (!token) {
    const cookieHeader = req.headers.get("cookie")
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map(c => c.trim())
      const tokenCookie = cookies.find(c => c.startsWith("token="))
      if (tokenCookie) token = tokenCookie.substring(6)
    }
  }
  if (!token) { return null }
  const payload = verifyJwt(token)
  if (!payload || !payload.sub) { return null }
  // ... db lookup
}
```
Usage: `const user = await getAuthenticatedUser(req); if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })`

### API success/error response shape
**Source:** `packages/types/src/index.ts` (lines 58-65)
**Apply to:** `apps/web/app/api/users/[id]/route.ts`
```typescript
export interface ApiSuccessResponse<T> {
  data: T
}
export interface ApiErrorResponse {
  errors: Record<string, string>
}
```
All success responses: `NextResponse.json({ data: dto } as ApiSuccessResponse<PublicUserDto>)`
All error responses: `NextResponse.json({ errors: { field: 'code' } }, { status: NNN })`

### Mobile API call signature
**Source:** `apps/mobile/lib/api.ts` (lines 4-24)
**Apply to:** `apps/mobile/lib/api.ts` (new `getUser` function)
- Signature: `(token: string, ...args): Promise<T>`
- Always passes `Authorization: Bearer ${token}` header
- Always delegates to `parseResponse<T>(res)` — never inline `.json()` calls

### Web skeleton loading
**Source:** `apps/web/components/ReviewDisplay.tsx` (lines 252-259)
**Apply to:** `apps/web/app/providers/[id]/page.tsx`, `apps/web/components/dashboard/JobDetailCard.tsx`
```typescript
<div className="h-4 bg-surface-200 rounded animate-pulse w-1/3" />
<div className="h-3 bg-surface-200 rounded animate-pulse w-1/2" />
```
For avatar placeholders: `<div className="w-8 h-8 rounded-full bg-surface-100 animate-pulse" />`

### Drizzle lazy-import pattern
**Source:** `apps/web/lib/auth.ts` (lines 50-53)
**Apply to:** `apps/web/app/api/users/[id]/route.ts`
Note: The API route files use static top-level imports (see `jobs/[id]/route.ts` lines 1-6), not lazy imports. Only `auth.ts` uses lazy imports. API routes should follow the static import pattern from `jobs/[id]/route.ts`.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `apps/mobile/components/AvatarInitials.tsx` | component | transform | No custom presentational components exist in the mobile app; all UI is composed from React Native Paper primitives directly in screen files |

---

## Metadata

**Analog search scope:** `apps/web/app/api/`, `apps/web/app/`, `apps/web/components/`, `apps/web/lib/`, `apps/mobile/app/`, `apps/mobile/lib/`, `apps/web/drizzle/`, `packages/types/src/`
**Files scanned:** 19
**Pattern extraction date:** 2026-05-14

### Planner flag — existing `/dashboard/provider/[id]/page.tsx`
The file `apps/web/app/dashboard/provider/[id]/page.tsx` is a partial implementation of the same feature (provider profile with reviews) that Phase 13 completes at `/providers/[id]/page.tsx`. CONTEXT does not state whether the old file should be deleted. The planner should decide: replace in place (move to `/providers/[id]/`) or keep both routes. If kept, the old route's hardcoded "Service Provider" heading will show stale data. Recommended: replace in place and update any inbound links.
