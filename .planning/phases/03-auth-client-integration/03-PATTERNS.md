# Phase 3: Auth Client Integration - Pattern Map

**Mapped:** 2026-05-05
**Files analyzed:** 12
**Analogs found:** 4 / 12 (3 exact self-analogs + 1 partial stub; 8 have no analog)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `apps/web/app/api/auth/login/route.ts` | route handler | request-response | itself (modify existing) | exact |
| `apps/web/app/api/auth/register/route.ts` | route handler | request-response | itself (modify existing) | exact |
| `apps/web/app/api/auth/me/route.ts` | route handler | request-response | itself (already exists) | exact |
| `apps/web/app/layout.tsx` | layout | request-response | itself (modify existing) | partial — 13 lines, no context yet |
| `apps/web/middleware.ts` | middleware | request-response | none | no analog |
| `apps/web/contexts/AuthContext.tsx` | context/provider | event-driven | none | no analog |
| `apps/web/app/login/page.tsx` | page/component | request-response | none | no analog |
| `apps/web/app/register/page.tsx` | page/component | request-response | none | no analog |
| `apps/web/app/dashboard/page.tsx` | page/component | request-response | none | no analog |
| `apps/mobile/app/(auth)/login.tsx` | screen/component | request-response | none | no analog |
| `apps/mobile/app/(auth)/register.tsx` | screen/component | request-response | none | no analog |
| `apps/mobile/contexts/AuthContext.tsx` | context/provider | event-driven | none | no analog |

---

## Pattern Assignments

### `apps/web/app/api/auth/login/route.ts` (route handler, request-response — MODIFY)

**Analog:** itself — `apps/web/app/api/auth/login/route.ts`

**Existing file** (lines 1–19):
```typescript
import { NextResponse } from 'next/server'
import { findUserByEmail, verifyPassword, signJwt } from '../../../../lib/auth'
import { AuthLoginRequest } from '@local/types'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid json' } }, { status: 400 })
  const payload = body as AuthLoginRequest
  if (!payload.email || !payload.password) return NextResponse.json({ errors: { email: 'required', password: 'required' } }, { status: 400 })
  const user = await findUserByEmail(payload.email)
  if (!user) return NextResponse.json({ errors: { email: 'not_found' } }, { status: 401 })
  const ok = await verifyPassword(payload.password, user.passwordHash)
  if (!ok) return NextResponse.json({ errors: { credentials: 'invalid' } }, { status: 401 })
  const token = signJwt({ sub: String(user.id), email: user.email })
  // Set httpOnly cookie via NextResponse
  const res = NextResponse.json({ user: { id: String(user.id), email: user.email, role: user.role, createdAt: user.createdAt } })
  res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax' })
  return res
}
```

**Required changes:**
- Add `token` to the JSON response body so mobile clients can store it: `NextResponse.json({ user: {...}, token })`
- No other changes needed — cookie is still set for web clients
- This route ISSUES tokens; it does NOT need dual-auth extraction (see Shared Patterns note below)

---

### `apps/web/app/api/auth/register/route.ts` (route handler, request-response — MODIFY)

**Analog:** itself — `apps/web/app/api/auth/register/route.ts`

**Existing file** (lines 1–22):
```typescript
import { NextResponse } from 'next/server'
import { createUser } from '../../../../lib/auth'
import { ApiErrorResponse, AuthRegisterRequest, AuthRegisterResponse } from '@local/types'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid json' } }, { status: 400 })
  const payload = body as AuthRegisterRequest
  if (!payload.email || !payload.password) {
    return NextResponse.json({ errors: { email: 'required', password: 'required' } }, { status: 400 })
  }
  try {
    const existing = await createUser({ email: payload.email, password: payload.password, role: payload.role })
    const response: AuthRegisterResponse = { user: existing }
    return NextResponse.json(response, { status: 201 })
  } catch (e: any) {
    // simplistic duplicate detection — Drizzle insert may throw PG error code 23505
    const msg = (e && e.code === '23505') ? { errors: { email: 'already_exists' } } : { errors: { server: 'error' } }
    const status = (e && e.code === '23505') ? 409 : 500
    return NextResponse.json(msg as unknown as ApiErrorResponse, { status })
  }
}
```

**Required changes:**
- After `createUser`, also call `signJwt` to issue a token, then: set httpOnly cookie AND include token in response body (mirrors the login route pattern)
- Import `signJwt` from `../../../../lib/auth`
- Response body becomes `{ user, token }` to support mobile auto-login after registration
- This route ISSUES tokens; it does NOT need dual-auth extraction (see Shared Patterns note below)

---

### `apps/web/app/api/auth/me/route.ts` (route handler, request-response — ALREADY EXISTS, verify)

**Analog:** itself — `apps/web/app/api/auth/me/route.ts`

**Existing file** (lines 1–10):
```typescript
import { NextResponse } from 'next/server'
import { verifyJwt } from '../../../../lib/auth'

export async function GET(req: Request) {
  const token = req.headers.get('cookie')?.split('token=')[1] || null
  if (!token) return NextResponse.json({ errors: { auth: 'missing' } }, { status: 401 })
  const payload = verifyJwt(token)
  if (!payload) return NextResponse.json({ errors: { auth: 'invalid' } }, { status: 401 })
  return NextResponse.json({ user: payload })
}
```

**Known weakness:** Cookie parsing via `split('token=')[1]` breaks if multiple cookies are present (e.g., `session=abc; token=xyz` does not trim the trailing `; other=abc` portion). The planner should replace this with the NextRequest `cookies` API: `(req as NextRequest).cookies.get('token')?.value`.

**Required changes for dual-auth support:**
- Import `NextRequest` from `next/server`
- Extract token from cookie first, then fall back to `Authorization` header:
  ```typescript
  const cookieToken = (req as NextRequest).cookies.get('token')?.value ?? null
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '') ?? null
  const token = cookieToken ?? headerToken
  ```

---

### `apps/web/app/layout.tsx` (layout — MODIFY to add AuthProvider)

**Analog:** itself — `apps/web/app/layout.tsx`

**Existing file** (lines 1–13):
```typescript
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Local Services Marketplace',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

**Required changes:**
- Import `AuthProvider` from `../contexts/AuthContext`
- Wrap `{children}` with `<AuthProvider>{children}</AuthProvider>`
- Layout itself stays a Server Component — AuthProvider will be marked `'use client'`

---

## No Analog Found

Files with no close match in the codebase. Planner should use RESEARCH.md patterns and the canonical references in CONTEXT.md instead.

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `apps/web/middleware.ts` | middleware | request-response | No Next.js middleware exists anywhere in the codebase |
| `apps/web/contexts/AuthContext.tsx` | context/provider | event-driven | No React context/provider pattern exists in the codebase |
| `apps/web/app/login/page.tsx` | page/component | request-response | No client-side form pages exist; `app/page.tsx` is a 12-line static placeholder |
| `apps/web/app/register/page.tsx` | page/component | request-response | Same as above |
| `apps/web/app/dashboard/page.tsx` | page/component | request-response | Same as above |
| `apps/mobile/app/(auth)/login.tsx` | screen/component | request-response | No Expo Router screens exist; see mobile bootstrap note below |
| `apps/mobile/app/(auth)/register.tsx` | screen/component | request-response | Same as above |
| `apps/mobile/contexts/AuthContext.tsx` | context/provider | event-driven | No React Native context pattern exists in the codebase |

---

## Shared Patterns

### Field-map Error Response
**Source:** All three `apps/web/app/api/auth/*.ts` routes
**Apply to:** All route handler modifications, any client-side error parsing
```typescript
// Server response shape — matches ApiErrorResponse from @local/types
{ errors: { fieldName: 'error_code' } }

// Client consumption: iterate errors object to display per-field messages
const data: ApiErrorResponse = await res.json()
Object.entries(data.errors).forEach(([field, msg]) => { /* show inline */ })
```

### Monorepo Type Imports
**Source:** `apps/web/app/api/auth/login/route.ts` line 3, `packages/types/src/index.ts`
**Apply to:** All new files that work with auth data
```typescript
import { AuthLoginRequest, AuthRegisterRequest, AuthUserDto, ApiErrorResponse } from '@local/types'
```

### Dual-Auth Token Extraction (NEW PATTERN — no existing analog)
**Apply to:** `me/route.ts` and any future protected route handlers only.

**Important scope clarification:** CONTEXT.md D-02 says "modify Phase 2 routes" to support dual-auth. This applies ONLY to routes that CONSUME tokens (i.e., protected routes like `/me`). Routes that ISSUE tokens (`/login`, `/register`) do not read an incoming token — they create one. Do not add dual-auth extraction to login or register.

```typescript
import { NextRequest } from 'next/server'

// Inside a protected handler:
const cookieToken = (req as NextRequest).cookies.get('token')?.value ?? null
const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '') ?? null
const token = cookieToken ?? headerToken
```

### `'use client'` Directive
**Apply to:** `AuthContext.tsx` (web), all page components with state/hooks, mobile screens
- No existing `'use client'` examples in this codebase yet
- Must be the first line of any file using `useState`, `useEffect`, `useContext`, or browser APIs
- Server Components (like `layout.tsx`) must NOT have it

---

## Mobile Bootstrap — Planner Blocker

**This is a hard prerequisite, not a pattern question.**

The files listed as `apps/mobile/app/(auth)/login.tsx` and `apps/mobile/app/(auth)/register.tsx` require Expo Router's file-based routing convention. However:

- `apps/mobile/package.json` has **no `expo-router`** dependency
- `apps/mobile/package.json` has **no `expo-secure-store`** dependency
- There is **no `apps/mobile/app/` directory** — the entry point is `App.tsx` + `index.ts`
- The current mobile app is plain Expo, not Expo Router

The planner must include a bootstrap step before mobile screen plans:
1. Install `expo-router` and `expo-secure-store` (and peer deps: `expo-linking`, `expo-constants`)
2. Create `apps/mobile/app/` directory with `_layout.tsx` root layout
3. Update `apps/mobile/package.json` `"main"` field to `"expo-router/entry"` (Expo Router convention)
4. Move or replace `App.tsx` with Expo Router layout

Without this, the mobile screen file paths in CONTEXT.md are invalid targets.

---

## Metadata

**Analog search scope:** `apps/web/app/`, `apps/web/lib/`, `apps/mobile/`, `packages/types/src/`
**Files scanned:** 10
**Pattern extraction date:** 2026-05-05
