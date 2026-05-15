# Phase 14: Advanced Admin Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-15
**Phase:** 14-Advanced Admin Dashboard
**Areas discussed:** Multi-role data model, Suspension behavior, Admin dashboard layout, Role assignment UX, Authorization & route protection

---

## Multi-Role Data Model

| Option | Description | Selected |
|--------|-------------|----------|
| JSON array in role column | Store as `role: "[\"ADMIN\",\"CLIENT\"]"` (backwards-compatible column name, no schema change to structure) | |
| Separate roles junction table | Create `user_roles(user_id, role)` table; cleaner queries, easier to index and validate, but requires a migration | ✓ |
| Bitmask in integer column | Use bit flags (ADMIN=1, CLIENT=2, PROVIDER=4); compact, but less readable and harder to add new roles later | |

**User's choice:** Separate roles junction table

**Notes:** User prioritized clean querying and maintainability over backwards compatibility.

---

| Option | Description | Selected |
|--------|-------------|----------|
| "Find all users with ADMIN role" | Simple equality check — all models handle this | |
| "Find users with multiple roles" | e.g., users who are both ADMIN and CLIENT; junction table makes this natural | |
| "List all users, group by role" | Aggregation query; JSON array makes this harder | ✓ |

**User's choice:** List all users, group by role

**Notes:** Query pattern for the admin dashboard is central to the decision; grouping/aggregation is essential.

---

**Backwards compatibility decision:**

| Option | Description | Selected |
|--------|-------------|----------|
| Migrate all API code at once | Update all queries to use the junction table; remove the `role` column entirely (clean break) | ✓ |
| Keep `role` column as a cache | Junction table is source of truth; keep `role` column denormalized for backward compatibility | |
| Use a view or database function | Create a SQL view or function that reconstructs the role column on-the-fly | |

**User's choice:** Migrate all API code at once

**Notes:** Clean break approach; all existing code referencing the single `role` column will be updated during this phase.

---

## Suspension Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, always visible with suspended badge | Admins see all users including suspended; easy to reactivate | ✓ |
| Hidden by default, with filter toggle | Only show active users by default; have a checkbox to include suspended users | |
| Separate "Suspended Users" tab | Dedicated section for suspended users vs active users | |

**User's choice:** Yes, always visible with suspended badge

**Notes:** Transparent visibility; suspended users should be discoverable and re-activatable at any time.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, read-only view allowed | Can view their jobs, reviews, profile; cannot post jobs or accept | |
| No, complete login block | Suspension means no access at all — they're locked out | ✓ |

**User's choice:** No, complete login block

**Notes:** Suspended users have full account lock; stricter enforcement of suspension policy.

---

## Admin Dashboard Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Data table (responsive, filterable) | Columns: email, roles, status, created date. Reuses the table pattern from Phase 12 | |
| Card grid (visual, browsable) | Cards with email, role badge, status indicator; might feel like overkill for admin-only feature | ✓ |
| Compact list (dense, scannable) | Minimal rows: email + role pills + status + action menu | |

**User's choice:** Card grid

**Notes:** Visual, scannable cards preferred over dense tabular layout. More aligned with modern admin UI patterns (e.g., Stripe users panel).

---

| Option | Description | Selected |
|--------|-------------|----------|
| Search bar only (by email) | Quick text search; filters hidden until needed | |
| Search bar + role filter dropdown | Email search + role selector (show users with ADMIN role, etc.) | |
| Search bar + Advanced filters panel | Email + role + status (active/suspended); collapsible panel for discoverability | ✓ |

**User's choice:** Search bar + Advanced filters panel

**Notes:** Collapsible panel for discoverable but compact filtering.

---

**User card content decision:**

| Option | Description | Selected |
|--------|-------------|----------|
| Email + roles + status + created date (all) | Full info: primary identifier, multi-role pills, active/suspended badge, account age | |
| Email + roles + status only | Minimal: just what's needed for managing users | ✓ |
| Email + status + action menu | Streamlined: action menu is the key UI element | ✓ |

**User's choice:** Hybrid — email + roles + status as primary card content, with the action menu handling management tasks

**Notes:** Cards display core info (email, role pills, status); action menu accessed via ⋯ icon.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Offset-based (20 users per page) | Standard pagination with Next/Prev | ✓ |
| Infinite scroll | Load more as user scrolls | |
| All users at once | Simple, no pagination needed | |

**User's choice:** Offset-based (20 users per page)

**Notes:** Standard pagination expected; 20 users per card grid is reasonable visual density.

---

## Role Assignment UX

| Option | Description | Selected |
|--------|-------------|----------|
| Modal dialog with checkboxes | Click "Edit Roles" → dialog opens with checkboxes (ADMIN, CLIENT, PROVIDER); user checks/unchecks and saves | ✓ |
| Inline quick toggles | Hover over user card → role toggles appear inline on the card (simpler, no modal) | |
| Dedicated role editor sheet | Bottom sheet (mobile) or side panel (desktop) slides in; all role management in one place | |

**User's choice:** Modal dialog with checkboxes

**Notes:** Clear, focused interaction; prevents accidental changes.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Prevent it (validation error) | User must always have at least one role | ✓ |
| Allow it (user becomes roleless) | Admins can create inactive users with no roles; unusual but flexible | |

**User's choice:** Prevent it (validation error)

**Notes:** Defensive validation; users must have at least one role.

---

**Bulk actions decision:**

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, checkbox per card + bulk suspend/activate | Select multiple users and apply the same action at once | ✓ |
| No, one action at a time | Simpler UX; actions per individual user via the menu | |

**User's choice:** Yes, checkbox per card + bulk suspend/activate

**Notes:** Efficiency for admins managing multiple users at once.

---

**Admin self-protection decision:**

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, prevent removing own ADMIN role | Logged-in admin cannot accidentally remove their own admin privilege | ✓ |
| No, allow it (risky but flexible) | Admins can demote themselves; will need another admin to re-promote | |

**User's choice:** Yes, prevent removing own ADMIN role

**Notes:** Defensive mechanism; prevents accidental self-demotion.

---

## Authorization & Route Protection

| Option | Description | Selected |
|--------|-------------|----------|
| Next.js middleware (before page renders) | Check JWT in middleware; redirect unauthorized users at the framework level | ✓ |
| In the page component itself | Page checks auth state context; shows "Unauthorized" if not admin | |
| Both (defense in depth) | Middleware + page component both check; redundant but safer | |

**User's choice:** Next.js middleware (before page renders)

**Notes:** Framework-level protection; most efficient and cleanest approach.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect to /unauthorized page | Clean error page explaining they don't have access | ✓ |
| Redirect to /dashboard (their role's home) | Silently send them to the appropriate page for their role | |
| Show 403 Forbidden inline | Display error in-page without redirect | |

**User's choice:** Redirect to /unauthorized page

**Notes:** Explicit feedback; users know they're accessing a restricted area.

---

## Claude's Discretion

None — all decisions made by user input.

## Deferred Ideas

- **Audit logging for admin actions:** Deferred to Phase 15 (v3). Track who suspended/activated users, timestamps, role changes for compliance/traceability.
- **Email notifications on suspension:** Deferred to Phase 15 (v3). Should suspended users be notified of their suspension? Out of v2 scope.
- **Role-based API access logging:** Deferred to Phase 15 (v3). Monitor admin dashboard usage for security audit trails.

---

*Phase: 14-Advanced Admin Dashboard*
*Discussion completed: 2026-05-15*
