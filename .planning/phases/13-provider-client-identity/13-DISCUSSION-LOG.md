# Phase 13: Provider & Client Identity - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-14
**Phase:** 13-provider-client-identity
**Areas discussed:** Identity on job detail, Provider profile page, Schema migration approach, User DTO and auth flow

---

## Identity on job detail

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in the job card | Show provider email + name directly in the existing job card/row. No navigation needed. | ✓ |
| Link to provider profile | Show a 'View provider' link navigating to /providers/[id]. | |
| Tooltip or popover on hover | Hover trigger reveals identity info. | |

**User's choice:** Inline in the job card

---

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in the job detail screen | Show client email + name as a section in the existing mobile job detail. | ✓ |
| Only show after job is accepted | Client identity hidden until ACCEPTED state. | |
| Always shown (even PENDING) | Show client identity regardless of job status. | |

**User's choice:** Inline in the job detail screen

---

| Option | Description | Selected |
|--------|-------------|----------|
| Separate GET /api/users/[id] call | JobDto unchanged; second fetch to resolve identity. Fits IDENTITY-04 exactly. | ✓ |
| Embed identity fields into JobDto | Add clientEmail, clientName, etc. to JobDto. Single fetch but changes shared contract. | |

**User's choice:** Separate GET /api/users/[id] call — JobDto stays unchanged

---

| Option | Description | Selected |
|--------|-------------|----------|
| Require authentication | Consistent with every other API route. Token already available on both platforms. | ✓ |
| Public (no auth) | Anyone can fetch user info by ID. Exposes emails to unauthenticated requests. | |

**User's choice:** Require authentication

---

## Provider profile page

| Option | Description | Selected |
|--------|-------------|----------|
| Any authenticated user | Any logged-in user (client or provider) can view any provider's profile. | ✓ |
| Clients only | Only clients can view provider profiles. | |
| Public (no auth required) | Anyone can view provider profiles. Inconsistent with rest of API. | |

**User's choice:** Any authenticated user

---

| Option | Description | Selected |
|--------|-------------|----------|
| From name if set, fallback to email first letter | "John Smith" → "JS"; null name → first letter of email. | ✓ |
| Always from email | Always first letter(s) of email. Simpler but ignores name. | |
| Placeholder icon when no name | Generic person icon if name is null. | |

**User's choice:** From name if set, fallback to email first letter

---

| Option | Description | Selected |
|--------|-------------|----------|
| Empty state with message | Profile header shown + "No reviews yet" message. Star rating shows unrated. | ✓ |
| Hide the reviews section entirely | Reviews section not rendered if empty. | |
| Show rating as N/A | Display "Rating: N/A" with empty reviews list. | |

**User's choice:** Empty state with message ("No reviews yet")

---

## Schema migration approach

| Option | Description | Selected |
|--------|-------------|----------|
| New Drizzle migration file | SQL migration in apps/web/drizzle/ + update schema.ts. Consistent with 0000, 0001. | ✓ |
| Amend existing schema file only | Update schema.ts, let developer run fresh migrate. No rollback safety. | |
| Inline ALTER TABLE in API route | Lazy migration on first request. Not idiomatic for this project. | |

**User's choice:** New Drizzle migration file

---

| Option | Description | Selected |
|--------|-------------|----------|
| Derive initials from email, show no display name | Avatar = first letter of email. Name field not rendered if null. | ✓ |
| Show email as display name fallback | Use email address wherever name would appear. | |
| Show 'Unknown' or 'Anonymous' | Static placeholder text. Looks unpolished. | |

**User's choice:** Derive initials from email; name field omitted (not rendered) when null

---

## User DTO and auth flow

| Option | Description | Selected |
|--------|-------------|----------|
| New PublicUserDto in packages/types | `{ id, email, name, avatarUrl, role, createdAt }` — separate from AuthUserDto. | ✓ |
| Extend AuthUserDto with optional name and avatarUrl | Fewer types but conflates auth token shape with profile shape. | |
| Inline type in the API route only | Breaks shared-types contract enforced throughout the project. | |

**User's choice:** New PublicUserDto — AuthUserDto left unchanged

---

| Option | Description | Selected |
|--------|-------------|----------|
| Add to mobile lib/api.ts | `getUser(token, userId)` helper. Consistent with all other mobile API calls. | ✓ |
| Inline fetch in the component | Direct fetch inside job detail screen. Inconsistent with mobile API layer pattern. | |

**User's choice:** Add getUser() to apps/mobile/lib/api.ts

---

## Claude's Discretion

- Exact Tailwind classes for provider identity section in web job detail
- Layout of identity section in mobile job detail (label/value rows vs inline)
- Loading state while user identity fetch is in progress
- Provider profile page layout details (card vs full-width, review list vs grid)
- Average star rating calculation method from ReviewDTO fields

## Deferred Ideas

- Profile editing (name, avatar upload) — not in scope; would be its own phase
- Provider self-view ("My Profile" link) — not scoped for this phase
