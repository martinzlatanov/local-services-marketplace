# Phase 14: Advanced Admin Dashboard - Research

**Researched:** 2026-05-15
**Domain:** Next.js 16 proxy/middleware, Drizzle ORM junction tables, multi-role RBAC, admin UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Create a separate `user_roles` junction table (`user_id` FK, `role` varchar) to store multiple roles per user
- **D-02:** Remove the single `role` varchar column from `users` table entirely; migrate all API code at once to query the junction table
- **D-03:** Admin queries will group/aggregate by role (e.g., "users with ADMIN role", "users with multiple roles")
- **D-04:** Suspension is implemented via a `status` column (`active` or `suspended`) on the `users` table
- **D-05:** Suspended users cannot log in (auth route checks status column)
- **D-06:** Suspended users have complete login block — no read-only profile access
- **D-07:** In the admin dashboard, suspended users are always visible with a "Suspended" badge; no separate tab or hidden filter
- **D-08:** User list is displayed as a card grid (visual, browsable) instead of a data table
- **D-09:** Each user card displays: email, role pills (multi-role badges), and status indicator (Active/Suspended)
- **D-10:** Cards include an action menu (⋯) for managing that user
- **D-11:** Dashboard includes a search bar (email search) + an Advanced Filters panel (collapsible) with filters for role and status
- **D-12:** Pagination uses offset-based approach (20 users per page) with Next/Prev buttons
- **D-13:** Role assignment uses a modal dialog with checkboxes (ADMIN, CLIENT, PROVIDER); admin checks/unchecks roles and saves
- **D-14:** Validation: users must have at least one role; the system prevents removing the last role with a validation error
- **D-15:** Bulk actions are supported: admins can select multiple user cards (via checkbox) and apply suspend/activate to all selected users
- **D-16:** Self-protection: the currently logged-in admin cannot remove their own ADMIN role (validation prevents this)
- **D-17:** Admin role check happens in Next.js middleware (before the page renders), not just in the component
- **D-18:** Unauthorized access (non-admin users) are redirected to `/unauthorized` page with a message explaining they don't have permission
- **D-19:** The `/admin/dashboard` route is protected by the middleware; JWT validation happens first, then role check

### Claude's Discretion

None — all decisions locked by user input.

### Deferred Ideas (OUT OF SCOPE)

- Audit logging for admin actions (Phase 15/v3)
- Email notifications on suspension (Phase 15/v3)
- Role-based API access logs (Phase 15/v3)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMIN-01 | Admins can list all users (email, roles, status) with search and pagination | GET /api/admin/users with offset pagination, joined user_roles table |
| ADMIN-02 | Admins can suspend/activate users; suspended users cannot log in but data persists | PATCH /api/admin/users/:id; status check in getAuthenticatedUser |
| ADMIN-03 | Admins can add/remove CLIENT or PROVIDER roles; users can hold multiple roles | PATCH /api/admin/users/:id/roles; user_roles junction table |
| ADMIN-04 | /admin/dashboard is accessible only to users with ADMIN role; non-admins redirected to /unauthorized | proxy.ts file (Next.js 16 terminology); reads user from DB |
</phase_requirements>

---

## Summary

Phase 14 introduces a dedicated admin dashboard to manage all users — listing, searching, suspending/activating, and assigning multiple simultaneous roles. The core technical work splits into three areas: (1) a breaking database schema migration from a single `role` column to a `user_roles` junction table, (2) a route protection proxy (Next.js 16 renamed `middleware.ts` to `proxy.ts`) that checks ADMIN role before rendering the dashboard, and (3) the admin UI itself — a card grid with search/filter, role assignment modal, and bulk actions.

The most load-bearing risk is D-02: the migration must happen in three coordinated steps within the phase rather than as a single destructive migration, to avoid breaking all existing API routes that currently read `users.role`. The migration sequence is: add `user_roles` table + backfill from existing `role` column → switch all reads to `user_roles` → drop `users.role` column in a final migration.

The second critical finding is the Next.js 16 rename: `middleware.ts` is deprecated and replaced by `proxy.ts`, which now defaults to Node.js runtime. This means the proxy can call `verifyJwt` directly (jsonwebtoken works in Node.js), and can query the `user_roles` table in the DB for a role check — the JWT payload currently contains only `{ sub, email }`, which is insufficient to check ADMIN role without a DB call.

**Primary recommendation:** Use three sequential migrations for D-01/D-02, add `status` column in the same wave as `user_roles`, implement route protection in `proxy.ts` using `verifyJwt` + DB role check, and add ADMIN check to `getAuthenticatedUser` for defense-in-depth on API routes. This dashboard is web-only — mobile admin is out of scope for v2.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Route protection (ADMIN-04) | Frontend Server (proxy.ts) | API / Backend | Proxy runs before page renders; redirects non-admins before SSR cost |
| User list + search + pagination | API / Backend | Browser / Client | `GET /api/admin/users` performs DB query; client renders result |
| Suspend/activate user | API / Backend | — | State mutation; DB is source of truth |
| Role assignment (multi-role) | API / Backend | Browser / Client | `PATCH /api/admin/users/:id/roles`; modal is client UI |
| Bulk actions | API / Backend | Browser / Client | API validates each user; client collects selection |
| Schema migration (junction table) | Database / Storage | — | Drizzle migration SQL files, applied to Neon |
| Login suspension check | API / Backend | — | `getAuthenticatedUser` queries `users.status` per request |
| Admin UI (card grid, modal) | Browser / Client | — | `'use client'` Next.js page; Tailwind + existing design tokens |

---

## Standard Stack

### Core (all already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.6 | App Router, proxy.ts route protection | Project stack; already installed |
| drizzle-orm | 0.45.2 | Junction table schema + queries | Project ORM; already installed |
| jsonwebtoken | 9.0.3 | JWT verification in proxy.ts (Node.js runtime) | Already installed; works in Node runtime |
| lucide-react | 1.14.0 | Icons (action menu ⋯, checkbox, chevron) | Already installed; used throughout project |
| tailwindcss | 4.2.4 | Styling with existing design tokens | Project CSS; already installed |

[VERIFIED: apps/web/package.json]

### No new packages required

All capabilities in this phase — DB migrations, proxy auth check, API routes, card UI, modal, pagination — use libraries already installed. Installing additional libraries (e.g., a modal library or data table library) is not warranted given the project's pattern of building UI components from Tailwind + lucide-react.

---

## Architecture Patterns

### System Architecture Diagram

```
Browser
  │
  ▼
proxy.ts (apps/web/proxy.ts) ── JWT verify ──► redirect /login (no JWT)
  │                         ── DB role check ─► redirect /unauthorized (non-admin)
  │                         ── pass ──────────► render /admin/dashboard
  ▼
/admin/dashboard (Client Component, 'use client')
  │
  ├── GET /api/admin/users?search=&role=&status=&page= ──► DB: users JOIN user_roles (paginated)
  │
  ├── PATCH /api/admin/users/:id ──────────────────────► DB: UPDATE users.status
  │     (suspend/activate)
  │
  ├── PATCH /api/admin/users/:id/roles ───────────────► DB: INSERT/DELETE user_roles rows
  │     (role assignment modal)                              validate >= 1 role remains
  │                                                          validate self-ADMIN-removal blocked
  │
  └── POST /api/admin/users/bulk-status ────────────────► DB: UPDATE users.status WHERE id IN (...)
        (bulk suspend/activate)                             wrapped in db.transaction()
```

### Recommended Project Structure

```
apps/web/
├── proxy.ts                          # Next.js 16 proxy (replaces middleware.ts)
├── app/
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx              # Admin dashboard (client component)
│   ├── unauthorized/
│   │   └── page.tsx                  # 403 page for non-admins
│   └── api/
│       └── admin/
│           ├── users/
│           │   └── route.ts          # GET (list+search+paginate)
│           ├── users/[id]/
│           │   └── route.ts          # PATCH (suspend/activate)
│           ├── users/[id]/roles/
│           │   └── route.ts          # PATCH (role assignment)
│           └── users/bulk-status/
│               └── route.ts          # POST (bulk suspend/activate)
├── components/
│   └── admin/
│       ├── UserCard.tsx              # Card with email, role pills, status, action menu
│       ├── RoleModal.tsx             # Checkbox modal for role assignment
│       ├── FilterPanel.tsx           # Collapsible advanced filters
│       └── BulkActionBar.tsx         # Sticky bottom toolbar for bulk actions
├── drizzle/
│   ├── 0004_add_user_roles.sql       # Create user_roles table, backfill from users.role, add status column
│   ├── 0005_drop_users_role.sql      # Drop users.role column (after code migration complete)
└── lib/db/
    └── schema.ts                     # Add userRoles table, status column to users
```

### Pattern 1: Next.js 16 Proxy (proxy.ts)

**What:** `proxy.ts` runs before page render, reads JWT from cookie, verifies it, queries `user_roles` table for ADMIN role, redirects if unauthorized.

**When to use:** Protecting entire route segments from non-admin access before any RSC render.

**Important:** In Next.js 16, `middleware.ts` is deprecated and renamed to `proxy.ts`. The file exports a `proxy` function (not `middleware`). It defaults to Node.js runtime — no Edge runtime restrictions. [VERIFIED: nextjs.org/docs/app/api-reference/file-conventions/proxy]

```typescript
// Source: nextjs.org/docs/app/api-reference/file-conventions/proxy
// apps/web/proxy.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { db } from '@/lib/db/client'
import { userRoles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = verifyJwt(token)
  if (!payload?.sub) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // DB call is safe in proxy.ts (Node.js runtime, not Edge)
  const adminRole = await db
    .select()
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, parseInt(payload.sub)),
        eq(userRoles.role, 'ADMIN')
      )
    )
    .limit(1)

  if (adminRole.length === 0) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

### Pattern 2: Drizzle Junction Table Schema

**What:** `user_roles` table storing (userId, role) pairs with composite primary key. No separate `roles` lookup table — role values are still the existing `Role` enum strings.

**When to use:** Multi-role per user (D-01).

```typescript
// Source: orm.drizzle.team/docs/relations
// apps/web/lib/db/schema.ts additions

export const userRoles = pgTable(
  'user_roles',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    role: varchar('role', { length: 32 }).notNull(), // 'CLIENT' | 'PROVIDER' | 'ADMIN'
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.role] }),
  ]
)
```

### Pattern 3: Migration Sequence for D-02 (Three Steps)

**What:** Safe removal of `users.role` without breaking existing API routes during the phase.

**Critical:** D-02 says "migrate all API code at once." This means all code changes happen before the drop migration runs — not that a single SQL file does all of it. The correct sequence within Phase 14 is:

| Migration file | Action | When applied |
|----------------|--------|--------------|
| `0004_add_user_roles.sql` | CREATE `user_roles` + INSERT INTO user_roles (backfill) + ADD COLUMN `status` | Wave 1 (before code changes read it) |
| Code changes | Switch all API reads from `users.role` to `user_roles`; auth.ts, all route handlers | Wave 2 |
| `0005_drop_users_role.sql` | DROP COLUMN `users.role` | Wave 3 (after all code is migrated) |

Applying the drop migration before code is migrated breaks `findUserByEmail`, `createUser`, `toAuthUserDto`, login/register routes, and `GET /api/users/[id]`. This is a rollback-required failure. The phased approach within the phase prevents this.

```sql
-- 0004_add_user_roles.sql
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER NOT NULL REFERENCES users(id),
  role VARCHAR(32) NOT NULL,
  PRIMARY KEY (user_id, role)
);

-- Backfill: copy existing role to junction table
INSERT INTO user_roles (user_id, role)
SELECT id, role FROM users
ON CONFLICT DO NOTHING;

-- Add status column for D-04
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'active';
```

```sql
-- 0005_drop_users_role.sql (applied only after all code migrated)
ALTER TABLE users DROP COLUMN IF EXISTS role;
```

### Pattern 4: Suspension Check in getAuthenticatedUser

**What:** Suspended users are blocked immediately (per D-05, D-06) because `getAuthenticatedUser` performs a DB read per request. Adding a `status` check there cuts off sessions at token validation time.

```typescript
// apps/web/lib/auth.ts — updated getAuthenticatedUser (after status column added)
// After fetching the user row:
if (rows[0].status !== 'active') {
  return null  // suspended user treated as unauthenticated
}
```

This approach is superior to JWT revocation lists: no additional infrastructure, immediate effect, consistent with existing pattern.

### Pattern 5: Role Assignment API with Validation

**What:** Full-replace role assignment via PATCH (D-13). Accepts new role set, validates minimum 1 role and self-ADMIN protection.

```typescript
// apps/web/app/api/admin/users/[id]/roles/route.ts

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthenticatedUser(req)
  if (!admin) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  // Verify caller has ADMIN role (defense-in-depth — proxy also checks)
  const callerRoles = await getAdminRoles(admin.id)
  if (!callerRoles.includes('ADMIN')) {
    return NextResponse.json({ errors: { auth: 'forbidden' } }, { status: 403 })
  }

  const { roles } = await req.json()  // e.g., ['CLIENT', 'PROVIDER']

  // D-14: must retain at least one role
  if (!roles || roles.length === 0) {
    return NextResponse.json({ errors: { roles: 'at_least_one_required' } }, { status: 400 })
  }

  const { id } = await params
  const targetId = parseInt(id, 10)

  // D-16: admin cannot remove their own ADMIN role
  if (targetId === parseInt(admin.id, 10) && !roles.includes('ADMIN')) {
    return NextResponse.json({ errors: { roles: 'cannot_remove_own_admin' } }, { status: 400 })
  }

  // Full replace: delete existing roles, insert new set
  await db.transaction(async (tx) => {
    await tx.delete(userRoles).where(eq(userRoles.userId, targetId))
    await tx.insert(userRoles).values(roles.map((r: string) => ({ userId: targetId, role: r })))
  })

  return NextResponse.json({ data: { id, roles } })
}
```

### Pattern 6: Bulk Action API

**What:** POST with array of user IDs + action. Uses `db.transaction()` for all-or-nothing semantics.

```typescript
// apps/web/app/api/admin/users/bulk-status/route.ts

export async function POST(req: Request) {
  const { userIds, status } = await req.json()  // status: 'active' | 'suspended'
  if (!['active', 'suspended'].includes(status)) {
    return NextResponse.json({ errors: { status: 'invalid' } }, { status: 400 })
  }

  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({ status })
      .where(inArray(users.id, userIds.map(Number)))
  })

  return NextResponse.json({ data: { updated: userIds.length } })
}
```

### Anti-Patterns to Avoid

- **Using `middleware.ts` filename in Next.js 16:** Will throw deprecation warning and eventually break. Use `proxy.ts` + `proxy` function export. [VERIFIED: nextjs.org/docs/app/api-reference/file-conventions/proxy]
- **Single destructive migration:** Do NOT drop `users.role` in the same migration that creates `user_roles`. This breaks all existing routes that read `users.role` if code isn't updated simultaneously.
- **Role check in component only:** D-17 requires proxy-level check. A component-only check still renders the page server-side before redirecting. Proxy prevents SSR cost and data leakage.
- **Storing roles in JWT payload:** Roles would go stale after admin changes them. The JWT expires in 45 minutes — role changes wouldn't take effect immediately. DB check in proxy is correct.
- **Edge runtime in proxy.ts:** Not applicable in Next.js 16. The `proxy.ts` file defaults to Node.js runtime and the `runtime` config option is not available in proxy files. [VERIFIED: nextjs.org/docs/app/api-reference/file-conventions/proxy]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Offset pagination | Custom page-skip logic | Drizzle `.limit().offset()` | One-liner; no custom math needed |
| Transaction for bulk updates | Manual try/catch rollback | `db.transaction(async tx => {...})` | Drizzle handles rollback automatically |
| Modal UI | Custom modal from scratch | Build with Tailwind + `dialog` or `div` overlay | No modal library needed; existing patterns in codebase sufficient for this use case |
| Role validation | Custom role set validation | Inline check before DB write | Simple array length check; no library warranted |
| Search query | Custom full-text search | Drizzle `like(users.email, '%query%')` | Email search is prefix/substring match; no FTS needed for admin tool |

---

## Common Pitfalls

### Pitfall 1: Proxy DB Import Causing Build Failure

**What goes wrong:** `proxy.ts` imports from `@/lib/db/client` which lazy-imports `@neondatabase/serverless`. If the `DATABASE_URL` env var is missing in build, import will fail or warn.

**Why it happens:** The existing codebase uses lazy dynamic imports in `auth.ts` to avoid this exact issue. `proxy.ts` must follow the same pattern or verify that Drizzle client instantiation is safe at module init time.

**How to avoid:** Check how `apps/web/lib/db/client.ts` instantiates the Drizzle client. If it calls `neon(process.env.DATABASE_URL!)` at module load time, the proxy import is fine in production but may fail locally without a `.env.local`. Use the same pattern as existing route handlers — import `db` at the top of `proxy.ts` since it runs server-side only.

**Warning signs:** `Error: process.env.DATABASE_URL is undefined` during `next build`.

### Pitfall 2: Three-Migration Sequencing Error

**What goes wrong:** Planner creates Wave 1 as a single task that includes both the new migration file AND code changes that read from the new table. Reviewer merges the migration before code is updated, breaking login and all existing routes.

**Why it happens:** D-02 says "migrate all API code at once" — this is ambiguous. It means all code is migrated within Phase 14 before the drop migration, not that migration + code ship simultaneously.

**How to avoid:** Structure the plan so the backfill migration (`0004`) runs first (Wave 1), code migrations happen in Wave 2 (reading from both `users.role` and `user_roles` transitionally if needed), and the drop migration (`0005`) is the final task in Wave 3.

**Warning signs:** `column "role" does not exist` errors after `0005` is applied before all route files are updated.

### Pitfall 3: Auth UserDto Still Returning Single Role

**What goes wrong:** After migration, `toAuthUserDto` still reads `row.role` from the users table (which no longer exists after `0005`). Login breaks.

**Why it happens:** `auth.ts` constructs `AuthUserDto` with `role: row.role`. After the `role` column is dropped, this throws a runtime error.

**How to avoid:** Update `AuthUserDto` in `lib/types.ts` to include `roles: Role[]` (plural). Update `toAuthUserDto` to join `user_roles` and return an array. Update all usages (dashboard, API routes, context) that check `user.role === Role.X` to `user.roles.includes(Role.X)`.

**Warning signs:** TypeScript errors on `user.role` after schema change; runtime errors on login after `0005` migration.

### Pitfall 4: Proxy Matcher Blocking Static Assets

**What goes wrong:** `proxy.ts` matcher includes all paths, causing the proxy to run on `_next/static`, `_next/image`, and `favicon.ico`. Auth redirects cascade on every asset load.

**Why it happens:** Forgetting to scope the `matcher` to admin routes only.

**How to avoid:** Scope matcher to `/admin/:path*` only. The proxy should not run on API routes (those do their own auth checks) or public pages.

### Pitfall 5: JWT Expiry During Admin Session

**What goes wrong:** JWT expires (45 min) while admin is on the dashboard. Next API call returns 401. Dashboard shows error state.

**Why it happens:** No refresh token mechanism in the current auth stack.

**How to avoid:** Document this as a known limitation (consistent with existing behavior across the app). Admin should re-login after 45 minutes. No new handling needed in this phase.

---

## Code Examples

### Drizzle Paginated Query with JOIN

```typescript
// Source: orm.drizzle.team/docs/relations
// GET /api/admin/users with search, role filter, status filter, pagination

const PAGE_SIZE = 20

async function listUsers({ search, role, status, page }: {
  search?: string
  role?: string
  status?: string
  page: number
}) {
  const offset = (page - 1) * PAGE_SIZE
  const conditions = []

  if (search) conditions.push(like(users.email, `%${search}%`))
  if (status) conditions.push(eq(users.status, status))

  // role filter: only return users who have this role in user_roles table
  if (role) {
    // subquery approach: users whose id is in user_roles where role = ?
    conditions.push(
      exists(
        db.select().from(userRoles)
          .where(and(eq(userRoles.userId, users.id), eq(userRoles.role, role)))
      )
    )
  }

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(PAGE_SIZE)
    .offset(offset)
    .orderBy(users.createdAt)

  // Fetch roles for each user in a second query (avoids row duplication from JOIN)
  const userIds = rows.map(r => r.id)
  const rolesRows = userIds.length > 0
    ? await db.select().from(userRoles).where(inArray(userRoles.userId, userIds))
    : []

  const rolesByUser = rolesRows.reduce((acc, r) => {
    acc[r.userId] = [...(acc[r.userId] || []), r.role]
    return acc
  }, {} as Record<number, string[]>)

  return rows.map(r => ({ ...r, roles: rolesByUser[r.id] || [] }))
}
```

### User Card Component Structure

```typescript
// Following existing JobCard.tsx pattern (JobCard.tsx uses surface-* tokens + lucide-react)

interface UserCardProps {
  user: AdminUserDto
  onSuspend: (id: string) => void
  onActivate: (id: string) => void
  onEditRoles: (user: AdminUserDto) => void
  selected: boolean
  onSelect: (id: string) => void
}

// Design tokens from globals.css:
// bg-surface-0, border-surface-200, rounded-[var(--radius-card)]
// Role pill: bg-surface-100 text-surface-700 rounded-[var(--radius-badge)]
// Suspended badge: bg-status-error-50 text-status-error-700
// Active badge: bg-status-completed-bg text-status-completed-text
```

---

## Runtime State Inventory

This is a schema migration phase affecting the `users` table `role` column. The following runtime state is affected.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `users.role` column in Neon: all existing users have a single role value stored there | SQL backfill — `INSERT INTO user_roles SELECT id, role FROM users` in migration 0004 |
| Live service config | None — no external service stores role values | None |
| OS-registered state | None | None |
| Secrets/env vars | `DATABASE_URL`, `JWT_SECRET` — no rename; code reads same env vars | None |
| Build artifacts | `apps/web/tsconfig.tsbuildinfo` — will regenerate after schema.ts changes | Delete and rebuild; not a blocker |

**Post-migration state:** After `0005_drop_users_role.sql`, the `users.role` column no longer exists in Neon. Any code still reading `row.role` from a users query will fail at runtime with a TypeScript undefined error (not a build error). The type system will not catch this unless `schema.ts` is updated to remove the `role` field from the `users` table definition.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + `export function middleware()` | `proxy.ts` + `export function proxy()` | Next.js 16.0.0 | Must rename file and function; codemod available: `npx @next/codemod@canary middleware-to-proxy .` |
| Edge runtime for middleware | Node.js runtime by default for proxy.ts | Next.js 15.5 (stable), 16.0 default | Can use `jsonwebtoken`, Drizzle, Node APIs directly in proxy |
| `middleware.ts` in v15 with `export const config = { runtime: 'nodejs' }` | proxy.ts defaults to nodejs; no runtime config option | Next.js 16.0.0 | Do not set `runtime` in proxy.ts — throws error |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `db.transaction()` is available in drizzle-orm 0.45.2 for PostgreSQL | Code Examples | Planner creates task for bulk actions using transaction; if unavailable, must use manual try/catch |
| A2 | `inArray` operator is available in drizzle-orm 0.45.2 | Code Examples | Bulk status update query must use alternative filter |
| A3 | `exists` operator is available in drizzle-orm 0.45.2 for role filtering subquery | Code Examples | Role filter query must use JOIN approach instead |
| A4 | `apps/web/lib/db/client.ts` instantiates the Neon client at module load (safe for import in proxy.ts) | Common Pitfalls | Proxy may fail to initialize DB connection if lazy import is required |
| A5 | D-17 references "Next.js middleware" — interpreted as `proxy.ts` (Next.js 16.0 renamed the file convention; execution model unchanged: runs before page render). Filename and export function renamed only; D-17's intent preserved. | User Constraints / Pattern 1 | If user expected a different protection mechanism, the proxy.ts approach is not wrong but may not match their mental model. |

---

## Open Questions

1. **D-02 "migrate all API code at once" interpretation**
   - What we know: D-02 says remove `role` column and "migrate all API code at once"
   - What's unclear: Does "at once" mean in a single commit/deploy, or a single migration SQL file?
   - Recommendation: Treat as "within this phase, all code and migrations are shipped together before any external observation." Use three migrations (add junction → migrate code → drop column) to prevent runtime breakage during the phase.

2. **AuthUserDto shape after migration**
   - What we know: `AuthUserDto` currently has `role: Role` (singular). Proxy needs to check roles. All existing components and contexts check `user.role`.
   - What's unclear: Should `AuthUserDto.role` become `roles: Role[]`, or maintain backward compat via a computed `role` field?
   - Recommendation: Add `roles: Role[]` to `AuthUserDto` and update all usages. Computing a single `role` for backward compat is error-prone (which role is "primary"?). Full migration is cleaner.

3. **proxy.ts DB client import safety**
   - What we know: `auth.ts` uses lazy dynamic imports to avoid DB initialization failures. `proxy.ts` runs at request time, not module load time.
   - What's unclear: Whether `apps/web/lib/db/client.ts` uses eager or lazy initialization.
   - Recommendation: Verify `lib/db/client.ts` before writing proxy.ts. Use the same import pattern as route handlers.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Neon PostgreSQL | DB migrations, all API routes | ✓ | Serverless | — |
| drizzle-orm | Schema + queries | ✓ | 0.45.2 | — |
| jsonwebtoken | JWT verify in proxy.ts | ✓ | 9.0.3 | — |
| next | App Router, proxy.ts | ✓ | 16.2.6 | — |
| drizzle-kit | Running migrations | ✓ | 0.18.1 | — |

[VERIFIED: apps/web/package.json]

All dependencies available. No blocking gaps.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30.0.0 + @testing-library/react 16.3.0 |
| Config file | `apps/web/jest.config.js` |
| Quick run command | `cd apps/web && npm test -- --testPathPattern=admin --passWithNoTests` |
| Full suite command | `cd apps/web && npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-01 | GET /api/admin/users returns paginated list | unit (route handler) | `npm test -- --testPathPattern=api/admin/users` | ❌ Wave 0 |
| ADMIN-01 | Search by email filters results | unit (route handler) | `npm test -- --testPathPattern=api/admin/users` | ❌ Wave 0 |
| ADMIN-02 | PATCH /api/admin/users/:id suspends user | unit (route handler) | `npm test -- --testPathPattern=api/admin/users` | ❌ Wave 0 |
| ADMIN-02 | Suspended user cannot log in (returns 401) | unit (auth) | `npm test -- --testPathPattern=lib/auth` | ❌ Wave 0 |
| ADMIN-03 | PATCH /api/admin/users/:id/roles sets multi-role | unit (route handler) | `npm test -- --testPathPattern=api/admin/users` | ❌ Wave 0 |
| ADMIN-03 | Removing last role returns 400 | unit (route handler) | `npm test -- --testPathPattern=api/admin/users` | ❌ Wave 0 |
| ADMIN-03 | Admin cannot remove own ADMIN role (returns 400) | unit (route handler) | `npm test -- --testPathPattern=api/admin/users` | ❌ Wave 0 |
| ADMIN-04 | proxy.ts redirects non-admin to /unauthorized | unit (proxy) | `npm test -- --testPathPattern=proxy` | ❌ Wave 0 |
| ADMIN-04 | proxy.ts passes through ADMIN user | unit (proxy) | `npm test -- --testPathPattern=proxy` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `cd apps/web && npm test -- --testPathPattern=admin --passWithNoTests`
- **Per wave merge:** `cd apps/web && npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `apps/web/app/api/admin/users/__tests__/route.test.ts` — covers ADMIN-01, ADMIN-02
- [ ] `apps/web/app/api/admin/users/[id]/roles/__tests__/route.test.ts` — covers ADMIN-03
- [ ] `apps/web/__tests__/proxy.test.ts` — covers ADMIN-04 (using `unstable_doesProxyMatch` from `next/experimental/testing/server`)
- [ ] `apps/web/lib/__tests__/auth.status.test.ts` — covers ADMIN-02 suspension check in `getAuthenticatedUser`

---

## Security Domain

`security_enforcement` is `false` in `.planning/config.json`. [VERIFIED: .planning/config.json]

Security section omitted per configuration.

---

## Sources

### Primary (HIGH confidence)

- [VERIFIED: nextjs.org/docs/app/api-reference/file-conventions/proxy] — proxy.ts naming, Node.js runtime default, matcher config, migration from middleware.ts
- [VERIFIED: nextjs.org/docs/app/guides/upgrading/version-16] — v16 changes: middleware deprecated, proxy.ts introduced, Turbopack default
- [VERIFIED: orm.drizzle.team/docs/relations] — many-to-many junction table pattern, composite primary key
- [VERIFIED: apps/web/package.json] — all installed package versions
- [VERIFIED: apps/web/lib/db/schema.ts] — current users table structure (role varchar, no status column, no user_roles table)
- [VERIFIED: apps/web/lib/auth.ts] — JWT payload shape `{ sub, email }`, lazy DB imports, `getAuthenticatedUser` pattern
- [VERIFIED: apps/web/lib/types.ts] — `AuthUserDto` shape, `Role` enum values
- [VERIFIED: apps/web/app/globals.css] — design tokens: surface-*, status-*, radius-*, shadow-*
- [VERIFIED: apps/web/components/dashboard/JobCard.tsx] — card component pattern for reuse reference
- [VERIFIED: .planning/config.json] — security_enforcement: false, nyquist_validation: true

### Secondary (MEDIUM confidence)

- [CITED: nextjs.org/docs/app/api-reference/file-conventions/proxy — Version history table] — v15.5 Node.js runtime stable for middleware, v16.0 renamed to proxy with Node.js default

### Tertiary (LOW confidence)

- None — all critical claims verified against official sources or codebase.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against package.json
- Architecture: HIGH — verified against Next.js 16 docs and existing codebase patterns
- Pitfalls: HIGH — D-02 migration sequence verified against existing migration files; proxy pitfalls verified against Next.js 16 docs
- Migration sequence: HIGH — confirmed file-by-file against existing drizzle migrations

**Research date:** 2026-05-15
**Valid until:** 2026-06-15 (Next.js 16 API is stable; Drizzle 0.45.x is stable)
