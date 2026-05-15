# Local Services Task Marketplace

## What This Is

A multi-platform capstone application that connects clients (web) with local service providers (mobile). Clients post tasks in predefined categories; nearby providers browse open jobs by city/area and claim them instantly. The system enforces strict job state transitions in real time, ensuring both parties always see accurate job status through WebSocket-powered live updates.

## Core Value

A provider accepting a job must lock it atomically — no double-booking, no stale state, no race conditions. Everything else flows from that guarantee.

## Requirements

### Validated

- ✓ **Authentication** — Users can sign up (Client/Provider), log in, and maintain sessions across reloads — v2.0
- ✓ **Job Posting** — Clients can post jobs with category, description, timeframe, and city — v2.0
- ✓ **Job Discovery** — Providers can browse PENDING jobs filtered by their selected city/area — v2.0
- ✓ **Concurrency Integrity** — Job acceptance is atomic; concurrent acceptances resolve to exactly one winner (409 Conflict on loser) — v2.0
- ✓ **Real-Time Status Updates** — WebSocket broadcasts all job state transitions (ACCEPTED, IN_PROGRESS, COMPLETED) to client dashboard within milliseconds — v2.0
- ✓ **Job Lifecycle** — Providers can transition jobs PENDING → ACCEPTED → IN_PROGRESS → COMPLETED; invalid transitions rejected with 409 — v2.0
- ✓ **Reviews & Ratings** — Clients can rate providers (1–5) with category ratings and text; ratings visible on provider profiles — v2.0
- ✓ **Identity & Context** — Clients see provider info on job details; providers see client info; public provider profiles with review history — v2.0
- ✓ **Design Language** — Monochrome surface-900/surface-50 Stripe/Linear aesthetic across web and mobile — v2.0
- ✓ **Type Safety** — All cross-platform contracts defined in `packages/types`; no local duplication — v2.0
- ✓ **Deployment** — Web deployed to Vercel, mobile configured for production, database on Neon production — v2.0

### Active (v3.0 — Deferred)

- **In-app messaging** between client and provider after job acceptance (deferred; WebSocket status updates sufficient for v2)
- **Payment handling** — price setting, client payment, provider payout (deferred; capstone scope doesn't require payment)
- **Native mobile push notifications** (deferred; WebSocket updates to open clients sufficient for v2)
- **Provider availability scheduling** (deferred; instant first-accept model sufficient for v2)
- **Admin moderation dashboard** for review approval workflows (partially shipped in v2; full moderation features deferred)

### Out of Scope

- In-app messaging — deferred; WebSocket status updates cover coordination needs for v1
- Payment handling — deferred; out of scope for capstone
- Native push notifications — WebSocket updates to open web/mobile clients are sufficient for v1
- Provider bidding — not the model; instant first-accept-wins acceptance only
- GPS-based job discovery — city/area manual selection is sufficient for capstone scope

## Context

This is a course capstone project. The primary evaluation criteria are technical correctness across the full vertical stack: real-time synchronization, concurrency integrity, cross-platform type safety, and correct state machine enforcement. The system must be demonstrably deployable.

**Platform split by role:**
- Web (Next.js App Router) — Client experience only
- Mobile (Expo/React Native) — Provider experience only
- Backend (Node.js REST + WebSockets) — Serves both platforms

**Monorepo structure:**
- `apps/web` — Next.js client
- `apps/mobile` — Expo provider app
- `apps/api` — Node.js backend
- `packages/types` — Shared TypeScript contracts

## Constraints

- **Tech Stack**: TypeScript strict mode, Next.js App Router (frontend + API Route Handlers), Expo/React Native, Neon (serverless PostgreSQL) + Drizzle ORM, WebSockets — all mandated by curriculum
- **Type Safety**: All cross-platform contracts must flow through `packages/types` — no exceptions
- **State Machine**: Only valid transitions allowed: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED; invalid transitions return HTTP 409
- **Concurrency**: Optimistic locking via `version` column on Jobs table — version mismatch returns HTTP 409

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Instant acceptance (not bidding) | Simpler state machine; bidding adds complexity without capstone value | ✓ **Good** — Reduced implementation complexity; first-accept-wins model is clear and enforceable |
| Role at signup (not role switching) | Reduces auth complexity; web = client, mobile = provider is the natural split | ✓ **Good** — Clean separation reduced auth surface area; works well for capstone |
| City/area selection (not GPS) | Avoids device permission complexity; sufficient for demonstrating geographic filtering | ✓ **Good** — Manual selection works; avoided device permission entanglement |
| Fixed category list | Simplifies filtering, search, and provider expertise matching | ✓ **Good** — Category enum in shared types prevents sprawl; clean schema design |
| Ratings only (no payments/messaging) | Covers capstone evaluation criteria without over-engineering | ✓ **Good** — Ratings shipped successfully; messaging deferred sensibly |
| Optimistic locking via version column | Enforces atomic acceptance without transaction overhead | ✓ **Good** — Version check in WHERE clause guarantees exactly-once semantics; tested under concurrency |
| WebSocket for real-time updates | Instant status broadcast to client dashboard | ✓ **Good** — Meets latency requirements; suffices for MVP (native push deferred) |
| UI redesign to Stripe/Linear aesthetic | Applied Variant B sketch specs (monochrome, surface-900 primary) | ✓ **Good** — Clinical, professional appearance; consistent across web and mobile |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

## Current State (v2.0)

**Shipped:** All 13 core phases complete. The application is a fully functional, deployed marketplace:
- Web client deployed to Vercel (production)
- Mobile client built and configured for production
- Database provisioned on Neon production
- Real-time job lifecycle management with atomic concurrency control
- User reviews and ratings with admin moderation
- Modern UI across all platforms

**Known Gaps (Deferred to v3.0):**
- Payment handling (client payment, provider payout)
- In-app messaging (WebSocket updates sufficient for v2)
- Native mobile push notifications
- Advanced provider availability scheduling
- Admin dashboard (partial; review moderation shipped)

**Codebase Stats:**
- 14 phases, 45 plans, 125+ implementations
- ~2,500+ LOC TypeScript (web + mobile + API)
- 11 API endpoints (auth, jobs, reviews, users)
- 2 WebSocket event types (JOB_UPDATED, NOTIFICATION)
- Type-safe across all platforms via `packages/types`

---
*Last updated: 2026-05-15 after v2.0 milestone completion*
