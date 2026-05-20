# AGENTS.md

## Documentation Index

Extended project documentation is in [`docs/`](docs/):

- [PROJECT-DOCUMENTATION.md](docs/PROJECT-DOCUMENTATION.md) — full architecture and feature reference
- [NEON-SETUP.md](docs/NEON-SETUP.md) — production database setup
- [PRODUCTION-ACCESS.md](docs/PRODUCTION-ACCESS.md) — production environment and credentials
- [E2E-STATUS.md](docs/E2E-STATUS.md) — end-to-end test status and quick-start
- [E2E-TEST-CHECKLIST.md](docs/E2E-TEST-CHECKLIST.md) — detailed E2E test scenarios
- [E2E-EXECUTION-SUMMARY.md](docs/E2E-EXECUTION-SUMMARY.md) — E2E execution results
- [MOBILE-EMULATOR-TEST-GUIDE.md](docs/MOBILE-EMULATOR-TEST-GUIDE.md) — mobile emulator testing
- [TEST_DATA.md](docs/TEST_DATA.md) — seed data and test accounts
- [VERCEL-DEPLOYMENT.md](docs/VERCEL-DEPLOYMENT.md) — deployment guide
- [QUICK-FIX-VERCEL-VARS.md](docs/QUICK-FIX-VERCEL-VARS.md) — Vercel environment variable fixes
- [10-UI-REVIEW.md](docs/10-UI-REVIEW.md) — UI audit results
- [behavioral-guideines.md](docs/behavioral-guideines.md) — behavioral guidelines

---

## 1. Project Context
**Application:** Local Services Task Marketplace.
**Scope:** A multi-platform full-stack application connecting Service Providers (Mobile) with Clients (Web).
**Core Logic:** Job posting, real-time bidding/acceptance, and lifecycle management of local tasks.

## Live Deployments

| App | Platform | URL |
|-----|----------|-----|
| Web (Next.js) | Vercel | https://web-gules-six-7paux4gsbf.vercel.app |
| Mobile (Expo web) | Netlify | https://local-services-marketplace.netlify.app |
| Database | Neon serverless PostgreSQL | Managed via [neon.tech](https://neon.tech) — connection string in `DATABASE_URL` env var |

**Database notes:** Schema migrations live in `apps/web/drizzle/`. Always use `npx drizzle-kit migrate` to apply changes — never modify the DB directly. Seed script at `apps/web/scripts/seed.mjs` populates 13 users, 30 curated jobs, and 10,000 bulk jobs for scalability testing.

## 2. Technology Stack
Adhere to the following stack as defined in the course curriculum:
*   **Language:** TypeScript (Strict Mode).
*   **Web Frontend:** Next.js (App Router) + React + Tailwind CSS.
*   **Mobile Frontend:** React Native via Expo.
*   **Backend:** Next.js API Routes.
*   **Database:** Neon serverless PostgreSQL using Drizzle ORM.
*   **Real-time Communication:** WebSockets for live status updates.

## 3. Architectural Guidelines
### 3.1. Unified Type System
*   Define all Data Transfer Objects (DTOs), API response shapes, and Enums in a shared `packages/types` directory.
*   Ensure both Web and Mobile clients import these types to maintain schema synchronization.

### 3.2. State Management & Concurrency
*   **Source of Truth:** The database is the absolute source of truth.
*   **Optimistic Concurrency:** Implement a `version` column in the `Jobs` table. Every update request must include the current `version` to prevent race conditions during job acceptance.
*   **State Machine:** Enforce valid transitions: `PENDING` -> `ACCEPTED` -> `IN_PROGRESS` -> `COMPLETED`. 

## 4. Automated Tests

### Web (`apps/web/`)
Run with `npm test` from `apps/web/`.

| Location | Type | What it covers |
|---|---|---|
| `apps/web/__tests__/` | Integration | Auth flow, job acceptance state machine, route-level tests |
| `apps/web/app/api/users/[id]/__tests__/` | Unit | User API route — happy path, 404, malformed input |
| `apps/web/components/dashboard/__tests__/` | Unit | JobCard, JobDashboard, JobDetailCard, JobPostingForm |
| `apps/web/app/providers/__tests__/` | Unit | Provider profile page rendering |
| `packages/types/src/index.test.ts` | Unit | Shared type contract validation |

### Mobile (`apps/mobile/`)
Run with `npm test` from `apps/mobile/`. Uses `jest-expo` preset — no native emulator required.

| Location | Type | What it covers |
|---|---|---|
| `apps/mobile/__tests__/api.jobs.test.ts` | Unit | `getJobs` — auth header, page param, pagination shape, error handling |
| `apps/mobile/__tests__/job-state-machine.test.ts` | Unit | State transitions, invalid skips, optimistic locking |
| `apps/mobile/__tests__/feed-filter.test.ts` | Unit | Category filter logic, infinite scroll append/reset/guard |
| `apps/mobile/__tests__/auth.test.ts` | Unit | Login success/failure, logout, token rehydration and expiry |

### Conventions
- Mobile tests avoid native module imports — they test logic, not component rendering.
- Do not mock the DB in web integration tests — use a real test DB or in-memory simulation.
- Place unit tests in a `__tests__/` folder co-located with the code they test.
- Place cross-cutting integration tests in the top-level `apps/web/__tests__/`.

## 5. Operational Instructions
*   **Tone & Style:** Maintain an active, clinical, and professional tone.
*   **Communication:** Avoid filler praise or sycophantic openers. Never use "I hope this finds you well" or equivalent phrases in generated drafts.
*   **Implementation:** Build features in vertical slices (Backend API + Web UI + Mobile UI) to ensure functional parity across platforms.
*   **Error Handling:** Implement standardized API error codes (400 for bad requests, 409 for state conflicts).

