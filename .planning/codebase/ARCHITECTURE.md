# Architecture

**Analysis Date:** 2026-05-04
**Status:** PLANNED — no code exists yet. This document reflects the intended architecture from `Agents.md`.

## System Overview

```text
┌─────────────────────────────────┬─────────────────────────────────┐
│         Web (Next.js)           │      Mobile (Expo/RN)           │
│         Clients (Web)           │   Service Providers (Mobile)    │
│    `apps/web/` (planned)        │   `apps/mobile/` (planned)      │
└────────────────┬────────────────┴──────────────┬──────────────────┘
                 │  REST + WebSocket              │  REST + WebSocket
                 ▼                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                     Backend (Node.js REST API)                     │
│                       `apps/api/` (planned)                        │
│            Job lifecycle · Bidding · State machine                 │
└───────────────────────────────────┬────────────────────────────────┘
                                    │  Prisma
                                    ▼
┌────────────────────────────────────────────────────────────────────┐
│                          PostgreSQL                                │
│                     Source of truth for all state                  │
└────────────────────────────────────────────────────────────────────┘

Shared across all layers:
┌────────────────────────────────────────────────────────────────────┐
│              `packages/types/` — DTOs, Enums, API shapes           │
└────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | Planned Path |
|-----------|----------------|--------------|
| Web (Next.js) | Client-facing UI — job posting, tracking | `apps/web/` |
| Mobile (Expo) | Provider-facing UI — job discovery, bidding, updates | `apps/mobile/` |
| Backend API | Business logic, job lifecycle, auth, WebSocket hub | `apps/api/` |
| PostgreSQL | Persistent state, source of truth | external service |
| Prisma | Schema definition, migrations, query client | `apps/api/` |
| Shared Types | DTOs, response shapes, Enums — imported by all layers | `packages/types/` |

## Monorepo Structure

The project is structured as a monorepo with distinct app packages and a shared types layer.

```
[project-root]/
├── apps/
│   ├── web/          # Next.js App Router — web client
│   ├── mobile/       # Expo/React Native — mobile client
│   └── api/          # Node.js REST API + WebSocket server
└── packages/
    └── types/        # Shared TypeScript types: DTOs, Enums, API contracts
```

All packages use TypeScript strict mode.

## Shared Types Package

**Purpose:** Single source of truth for all type contracts between layers.

**Contains:**
- Data Transfer Objects (DTOs) for API request/response shapes
- Enums (e.g., job status values: `PENDING`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`)
- Shared API response wrappers

**Rule:** Both web and mobile clients import exclusively from `packages/types`. Types are never duplicated in individual apps.

## Job Lifecycle State Machine

Job status transitions are strictly enforced. Only the following transitions are valid:

```
PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
```

Invalid transitions (e.g., `PENDING → COMPLETED`, `COMPLETED → IN_PROGRESS`) must be rejected by the backend with a `409 Conflict` response.

**Enforcement:** The backend API enforces all state transitions. Clients send requests; the backend validates the current state before applying changes.

**Enum location:** `packages/types/` — used by both backend (to enforce) and clients (to display/request).

## Optimistic Concurrency

**Problem addressed:** Multiple service providers may attempt to accept the same job simultaneously.

**Approach:**
- The `Jobs` table includes a `version` integer column (managed by Prisma).
- Every update request from a client must include the current `version` of the job.
- The backend checks that the submitted `version` matches the database value before applying the update.
- If `version` has changed (another update occurred first), the backend returns `409 Conflict`.
- The client is responsible for re-fetching the job and retrying if appropriate.

**No optimistic UI updates** should be treated as final — the database state is authoritative.

## API Design Patterns

**Style:** RESTful HTTP API

**Error codes (standardized):**
- `400 Bad Request` — malformed input, validation failures
- `409 Conflict` — state machine violation or version mismatch (concurrency conflict)

**Real-time:** WebSockets are used for live job status updates (e.g., notifying the web client when a provider accepts a job). REST handles commands; WebSockets handle event push.

**Implementation pattern:** Vertical slices — each feature is implemented across all three layers (Backend API + Web UI + Mobile UI) together, ensuring functional parity.

## Error Handling Conventions

**Strategy:** Standardized HTTP status codes. All errors return a consistent response shape (defined in `packages/types/`).

**Patterns:**
- `400`: Input does not pass validation (missing fields, wrong types)
- `409`: Business rule violation — invalid state transition or optimistic concurrency conflict
- No silent swallowing of errors; surface failures explicitly to the caller

## Coding Behavior Constraints

Derived from `behavioral-guideines.md`:

- **Simplicity first:** Minimum code to satisfy the requirement. No speculative abstractions.
- **Surgical changes:** Each change traces directly to a requirement. No opportunistic refactoring.
- **Goal-driven:** Features are built against verifiable success criteria, not open-ended "make it work" targets.
- **Assumptions surfaced:** Ambiguities are named and resolved before implementation begins.

---

*Architecture analysis: 2026-05-04*
