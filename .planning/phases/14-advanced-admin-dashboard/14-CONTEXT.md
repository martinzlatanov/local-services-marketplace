# Phase 14: Advanced Admin Dashboard - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

## Phase Boundary

Admins can access a dedicated `/admin/dashboard` page to list, search, and manage all users in the system. Admins can:
- View all users (email, roles, status, created date)
- Search by email and filter by role and status
- Suspend/activate users (suspended users cannot log in)
- Assign/remove roles to/from users (users can hold multiple roles: ADMIN, CLIENT, PROVIDER simultaneously)
- Bulk select users and apply suspend/activate actions

Users with ADMIN role can also hold CLIENT or PROVIDER roles. Non-admins are redirected to an `/unauthorized` page if they attempt to access the admin dashboard.

## Implementation Decisions

### Data Model — Multi-Role Support
- **D-01:** Create a separate `user_roles` junction table (`user_id` FK, `role` varchar) to store multiple roles per user
- **D-02:** Remove the single `role` varchar column from `users` table entirely; migrate all API code at once to query the junction table
- **D-03:** Admin queries will group/aggregate by role (e.g., "users with ADMIN role", "users with multiple roles")

### User Suspension & Access Control
- **D-04:** Suspension is implemented via a `status` column (`active` or `suspended`) on the `users` table
- **D-05:** Suspended users cannot log in (auth route checks status column)
- **D-06:** Suspended users have complete login block — no read-only profile access
- **D-07:** In the admin dashboard, suspended users are always visible with a "Suspended" badge; no separate tab or hidden filter

### Admin Dashboard UI Layout
- **D-08:** User list is displayed as a card grid (visual, browsable) instead of a data table
- **D-09:** Each user card displays: email, role pills (multi-role badges), and status indicator (Active/Suspended)
- **D-10:** Cards include an action menu (⋯) for managing that user
- **D-11:** Dashboard includes a search bar (email search) + an Advanced Filters panel (collapsible) with filters for role and status
- **D-12:** Pagination uses offset-based approach (20 users per page) with Next/Prev buttons

### Role Assignment & User Management
- **D-13:** Role assignment uses a modal dialog with checkboxes (ADMIN, CLIENT, PROVIDER); admin checks/unchecks roles and saves
- **D-14:** Validation: users must have at least one role; the system prevents removing the last role with a validation error
- **D-15:** Bulk actions are supported: admins can select multiple user cards (via checkbox) and apply suspend/activate to all selected users
- **D-16:** Self-protection: the currently logged-in admin cannot remove their own ADMIN role (validation prevents this)

### Authorization & Route Protection
- **D-17:** Admin role check happens in Next.js middleware (before the page renders), not just in the component
- **D-18:** Unauthorized access (non-admin users) are redirected to `/unauthorized` page with a message explaining they don't have permission
- **D-19:** The `/admin/dashboard` route is protected by the middleware; JWT validation happens first, then role check

### Claude's Discretion
- None — all decisions locked by user input

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Phase Context
- `.planning/PROJECT.md` — Project overview; key decision on atomic concurrency, schema design principles
- `.planning/ROADMAP.md` (Phase 14 section) — Phase goal and success criteria
- `.planning/REQUIREMENTS.md` — Traceability matrix (ADMIN-01 through ADMIN-04 not yet added to REQUIREMENTS.md; will be added during planning)
- `AGENTS.md` — Technology stack (Next.js, TypeScript strict, Drizzle ORM, Tailwind CSS) and architectural constraints

### Architecture & Patterns
- `.planning/codebase/ARCHITECTURE.md` — System overview, state machine patterns, API design conventions (REST, error codes 400/409)
- `.planning/codebase/STACK.md` — Technology stack confirmation (Next.js App Router, Drizzle ORM, Neon, Tailwind)

### Database Schema
- `apps/web/lib/db/schema.ts` — Current schema: `users` table structure (id, email, passwordHash, role, createdAt, name, avatarUrl); `jobs` table (concurrency model with version column)

### Existing Auth & Middleware
- `apps/web/app/middleware.ts` (if exists) or auth patterns from Phase 2-3 — JWT validation, protected routes, session handling

### Prior Phases
- **Phase 13 (Provider & Client Identity):** User profiles, avatar, name columns; schema structure for user identity data
- **Phase 12 (UI Revamp):** Tailwind design tokens, surface-900 color scheme, data table patterns (if any), card component patterns for reuse

## Existing Code Insights

### Reusable Assets
- **Users table schema:** Already has `id`, `email`, `passwordHash`, `role`, `createdAt`, `name`, `avatarUrl` columns from Phase 13; migration will add `status` column and remove `role` column, then add `user_roles` junction table
- **JWT & auth middleware:** Existing auth logic from Phases 2-3 validates JWT on protected routes; admin dashboard will extend this with role checks
- **Tailwind CSS design system:** Phase 12 established surface-900/surface-50 palette; admin dashboard UI (cards, buttons, filters) will follow the same design tokens
- **API error handling:** Standardized 400 (validation) / 409 (conflict) responses from earlier phases; admin actions (e.g., invalid role removal) will use 400 Bad Request

### Established Patterns
- **WebSocket integration:** Phase 6+ established real-time updates; admin suspend/activate actions could broadcast user status changes (deferred to v3 if needed)
- **State machine validation:** Jobs table enforces version-based concurrency; admin actions (role removal validation, suspension logic) will follow similar defensive-validation pattern
- **Form patterns:** Existing forms (auth, job posting) from Phases 2, 7 provide templates for role assignment modal and search/filter UI

### Integration Points
- **Auth middleware:** Extend existing JWT check to add role requirement for `/admin/dashboard`
- **API routes:** New routes needed: `GET /api/users` (list with filters), `PATCH /api/users/:id` (suspend/activate/change roles), `DELETE /api/users/:id/roles/:role` (remove role)
- **WebSocket hub:** Suspend/activate actions could emit events (deferred; not in v2 scope)

## Specific Ideas

- **Card layout inspiration:** Stripe's admin users interface uses visually scannable cards with inline role badges and action menus. Match that pattern.
- **Filter panel toggle:** Advanced Filters panel should collapse/expand smoothly; store open/closed state in localStorage or session state for UX continuity
- **Bulk action UI:** After selecting users, show a floating action bar or sticky bottom toolbar with "Suspend Selected" / "Activate Selected" buttons

## Deferred Ideas

- **Audit logging for admin actions:** Deferred to Phase 15 (v3). Track who suspended/activated users, who changed roles, timestamps. Out of current scope.
- **Email notifications on suspension:** Deferred to Phase 15 (v3). Silent suspension is sufficient for v2; user communication deferred.
- **Role-based API access logs:** Deferred to Phase 15 (v3). Monitor admin dashboard usage for compliance; out of current scope.

---

*Phase: 14-Advanced Admin Dashboard*
*Context gathered: 2026-05-15*
