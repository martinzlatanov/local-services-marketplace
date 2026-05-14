---
phase: 13-provider-client-identity
reviewed: 2026-05-14T00:00:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - apps/mobile/app/(app)/jobs/[id].tsx
  - apps/mobile/components/AvatarInitials.tsx
  - apps/mobile/lib/api.ts
  - apps/web/app/api/users/[id]/__tests__/route.test.ts
  - apps/web/app/api/users/[id]/route.ts
  - apps/web/app/providers/[id]/page.tsx
  - apps/web/app/providers/__tests__/ProviderProfile.test.tsx
  - apps/web/components/dashboard/JobDetailCard.tsx
  - apps/web/components/dashboard/__tests__/JobDetailCard.identity.test.tsx
  - apps/web/components/dashboard/__tests__/JobDetailCard.test.tsx
  - apps/web/components/ui/AvatarInitials.tsx
  - apps/web/drizzle/0002_add_user_identity.sql
  - apps/web/lib/db/schema.ts
  - apps/web/lib/types.ts
  - packages/types/src/index.ts
findings:
  critical: 2
  warning: 5
  info: 3
  total: 10
status: issues_found
---

# Phase 13: Code Review Report

**Reviewed:** 2026-05-14T00:00:00Z
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

Phase 13 adds identity display (provider/client names and avatars) across web and mobile surfaces, a new `GET /api/users/[id]` API endpoint, a `PublicUserDto` shared type, a database migration adding `name` and `avatar_url` columns, and a provider public profile page. The implementation is broadly correct in structure but contains two critical issues: a missing role guard on the provider profile page that renders client identity under a "Provider" heading, and a missing input guard in both `AvatarInitials` components that causes a crash on empty email strings. Five warnings cover stale fetch side effects, an unguarded `as Role` type cast, dead branch logic, use of `<a>` instead of `<Link>` for internal navigation, and a test that does not assert on `name`/`avatarUrl` response fields. Three info items cover code quality and test coverage gaps.

---

## Critical Issues

### CR-01: Provider profile page renders any user (including clients) without role validation

**File:** `apps/web/app/providers/[id]/page.tsx:26-37`

**Issue:** The page fetches `GET /api/users/${providerId}` and renders the result under a "Provider" heading with no check that `providerUser.role === Role.PROVIDER`. A client browsing to `/providers/<client-user-id>` will see that client's name and email presented as a provider profile. The companion `route.ts` returns all user roles equally — this is correct per design decision D-05 — but the page itself must enforce that it only renders provider-role users. There is no validation at the page layer.

**Fix:**
```tsx
// After setProviderUser(userData.data) resolves, add a role guard:
if (userData.data.role !== Role.PROVIDER) {
  setError("Provider not found.")
  return
}
setProviderUser(userData.data)
```

---

### CR-02: AvatarInitials crashes when email is an empty string

**File:** `apps/mobile/components/AvatarInitials.tsx:12-13` and `apps/web/components/ui/AvatarInitials.tsx:10-11`

**Issue:** The fallback branch `email[0].toUpperCase()` executes when `name` is null or a whitespace-only string. If `email` is an empty string (or a whitespace-only string like `"  "`), `email[0]` is `undefined`, and calling `.toUpperCase()` throws a TypeError at runtime. The `PublicUserDto` type declares `email: string` without a non-empty constraint, and database inserts are the only enforcement point. Any row with a blank email (or an edge case where the API returns an unexpected shape) will crash the component. Additionally, a whitespace-only `name` (e.g. `"   "`) is truthy, so the first branch runs but `name.trim().split(/\s+/).map(w => w[0])` produces `[""]` — an empty initials string — resulting in a blank avatar label without any error.

**Fix (applies to both components identically):**
```ts
// Replace the initials computation:
const trimmedName = name?.trim() ?? ''
const trimmedEmail = email?.trim() ?? ''
const initials = trimmedName
  ? trimmedName.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  : (trimmedEmail[0]?.toUpperCase() ?? '?')
```

---

## Warnings

### WR-01: Fetch in useEffect has no AbortController — stale response race condition

**File:** `apps/web/components/dashboard/JobDetailCard.tsx:66-85`, `apps/web/app/providers/[id]/page.tsx:21-42`, `apps/mobile/app/(app)/jobs/[id].tsx:64-80`

**Issue:** All three `useEffect` hooks that fetch user identity start an async fetch but do not return a cleanup function with `AbortController.abort()`. If the component unmounts or a dependency (`job.providerId`, `providerId`, `job`) changes while the fetch is in flight, the `setState` call fires on the resolved response and updates unmounted/stale component state. In React Strict Mode (enabled in Next.js by default in development) this double-invokes effects, reliably triggering the race. In production it manifests intermittently and is hard to debug.

**Fix (pattern — apply in all three locations):**
```ts
useEffect(() => {
  if (!job.providerId) return
  const controller = new AbortController()
  const fetchProvider = async () => {
    setIsProviderLoading(true)
    try {
      const res = await fetch(`/api/users/${job.providerId}`, {
        credentials: 'include',
        signal: controller.signal,
      })
      if (res.ok) {
        const data = await res.json()
        setProviderUser(data.data)
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        // silently omit section on error
      }
    } finally {
      setIsProviderLoading(false)
    }
  }
  void fetchProvider()
  return () => controller.abort()
}, [job.providerId])
```

---

### WR-02: `role` column cast bypasses type safety with no validation

**File:** `apps/web/app/api/users/[id]/route.ts:28`

**Issue:** `role: row.role as Role` casts the raw `varchar(32)` database value to the `Role` enum with no validation. The schema has no PostgreSQL `ENUM` type enforcing the column values (it uses `varchar`), so any malformed row in the database returns a value that the TypeScript type system treats as valid but is not. If a row has `role = 'SUPERADMIN'` or any corrupted value, the DTO silently propagates an invalid role to callers.

**Fix:**
```ts
const validRoles = Object.values(Role) as string[]
if (!validRoles.includes(row.role)) {
  return NextResponse.json({ errors: { user: 'invalid_data' } }, { status: 500 })
}
const dto: PublicUserDto = {
  // ...
  role: row.role as Role,
}
```

---

### WR-03: Dead branch in type narrowing — `job.id` is always `string`

**File:** `apps/web/components/dashboard/JobDetailCard.tsx:51`

**Issue:** `const jobId = typeof job.id === 'string' ? parseInt(job.id, 10) : job.id` — `JobDto.id` is typed as `string` (not `string | number`). The `else` branch (`job.id` used as-is) is unreachable and will never execute. This signals that the author was uncertain about the type contract and added a defensive branch that TypeScript cannot remove without a type guard. The correct fix is to remove the conditional entirely, not to add a runtime assertion.

**Fix:**
```ts
const jobId = parseInt(job.id, 10)
```

---

### WR-04: Internal navigation uses `<a>` instead of `<Link>` — forces full page reload

**File:** `apps/web/components/dashboard/JobDetailCard.tsx:146-151`

**Issue:** `<a href={`/providers/${job.providerId}`}>View profile</a>` uses a plain anchor element for an internal Next.js route. This bypasses the Next.js router, causes a full page reload, discards client state (auth context, job list), and breaks browser-side prefetching. In a Next.js App Router application all internal links must use `<Link>` from `next/link`.

**Fix:**
```tsx
import Link from 'next/link'
// ...
<Link
  href={`/providers/${job.providerId}`}
  className="text-[12px] text-surface-900 underline underline-offset-2 hover:text-surface-600 transition-colors"
>
  View profile
</Link>
```

---

### WR-05: Happy-path API test does not assert `name` or `avatarUrl` fields on the response DTO

**File:** `apps/web/app/api/users/[id]/__tests__/route.test.ts:97-113`

**Issue:** The 200 happy-path test mocks `mockUserRow` with `name: 'Jane Smith'` and `avatarUrl: null` but asserts only on `id`, `email`, `role`, `createdAt`, and the absence of `passwordHash`. The test never asserts `body.data.name === 'Jane Smith'` or `body.data.avatarUrl === null`. These are the two new fields that constitute the entire identity change in this phase. If the route handler accidentally omitted `name` or `avatarUrl` from the DTO, the test would still pass — the core regression path for this phase is untested.

**Fix:** Add assertions:
```ts
expect(body.data.name).toBe('Jane Smith')
expect(body.data.avatarUrl).toBeNull()
```
Also add a second test case where `name: null` to cover the null fallback path.

---

## Info

### IN-01: `apps/web/lib/types.ts` CITY_AREAS has drifted from `packages/types/src/index.ts`

**File:** `apps/web/lib/types.ts:17-23`

**Issue:** The local web copy has 5 city areas; the canonical `packages/types/src/index.ts` has 10. This is a pre-existing drift from commit `be01681` and not introduced in this phase, but it is visible in the scope. If form dropdowns on web and mobile render from different source files, available city areas will diverge between platforms.

**Fix:** Import `CITY_AREAS` from `@local/types` in web code (or re-sync the local copy). The shared package is the single source of truth per AGENTS.md §3.1.

---

### IN-02: Stub tests assert only on mock data shapes, not component behaviour

**File:** `apps/web/app/providers/__tests__/ProviderProfile.test.tsx`, `apps/web/components/dashboard/__tests__/JobDetailCard.identity.test.tsx`

**Issue:** These "Wave 0 stub" tests construct mock objects and assert on the mock values directly (`expect(mockProvider.id).toBe('42')`). They do not render any component and will pass even if the components under test are entirely broken or deleted. They provide false confidence in test coverage for IDENTITY-01 and IDENTITY-03. The validation plan acknowledges these are stubs, but there is no follow-up task to promote them to real component tests.

**Fix:** Promote to proper component tests using `@testing-library/react`. At minimum, render the component with mock fetch responses and assert that the identity fields appear in the DOM.

---

### IN-03: `console.error` used in `JobDetailCard.tsx` — debug artifact

**File:** `apps/web/components/dashboard/JobDetailCard.tsx:59`

**Issue:** `console.error('Failed to fetch reviews:', err)` leaks error details to the browser console in production. Other fetch-error paths in the same file use a silent catch (`catch { // silently omit }`). The approach is inconsistent and exposes stack traces in production.

**Fix:** Remove the `console.error` call and adopt the same silent-catch pattern used in the `fetchProvider` block, or route to a proper error-reporting service.

---

_Reviewed: 2026-05-14T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
