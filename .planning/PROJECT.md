# Local Services Task Marketplace

## What This Is

A multi-platform capstone application that connects clients (web) with local service providers (mobile). Clients post tasks in predefined categories; nearby providers browse open jobs by city/area and claim them instantly. The system enforces strict job state transitions in real time, ensuring both parties always see accurate job status through WebSocket-powered live updates.

## Core Value

A provider accepting a job must lock it atomically — no double-booking, no stale state, no race conditions. Everything else flows from that guarantee.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Authentication**
- [ ] User can sign up as a Client or Provider (role selected at registration)
- [ ] User can log in and maintain session across page/app reloads
- [ ] User can log out

**Job Posting (Client — Web)**
- [ ] Client can post a job by selecting a category from a fixed list, writing a description, and specifying a required timeframe
- [ ] Client can view a live dashboard of their posted jobs with real-time status updates via WebSocket

**Job Discovery (Provider — Mobile)**
- [ ] Provider can set their service area (city/area) during onboarding
- [ ] Provider can view open jobs filtered by their selected city/area (list and/or map view)
- [ ] Provider can read full job details before accepting

**Job Acceptance & Concurrency**
- [ ] Provider can accept an open job, which transitions it to ACCEPTED and locks it against other acceptances
- [ ] Backend rejects a concurrent acceptance attempt with HTTP 409 using optimistic concurrency (version column)
- [ ] Client sees the ACCEPTED state reflected on their dashboard within milliseconds of provider action

**Job Lifecycle**
- [ ] Provider can update job status through: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
- [ ] Each status transition pushes a real-time update to the client's web dashboard via WebSocket
- [ ] Client can mark a completed job as closed, triggering the final state transition

**Ratings & Reviews**
- [ ] Client can submit a rating and text review for a provider after closing a job
- [ ] Provider's rating is visible on their profile

**Shared Type System**
- [ ] All DTOs, API response shapes, and enums live in a shared `packages/types` package
- [ ] Both web and mobile clients import exclusively from `packages/types` — no locally duplicated type definitions

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
| Instant acceptance (not bidding) | Simpler state machine; bidding adds complexity without capstone value | — Pending |
| Role at signup (not role switching) | Reduces auth complexity; web = client, mobile = provider is the natural split | — Pending |
| City/area selection (not GPS) | Avoids device permission complexity; sufficient for demonstrating geographic filtering | — Pending |
| Fixed category list | Simplifies filtering, search, and provider expertise matching | — Pending |
| Ratings only (no payments/messaging) | Covers capstone evaluation criteria without over-engineering | — Pending |

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

---
*Last updated: 2026-05-04 after initialization*
