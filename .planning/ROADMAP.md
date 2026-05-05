# Roadmap: Local Services Task Marketplace

## Overview

Starting from an empty monorepo, the project builds in dependency order: shared types first (the contract that locks in type safety across all layers), then backend authentication and job APIs, then real-time WebSocket infrastructure, then each platform's UI as vertical slices, and finally job closure and the ratings feature. Every phase delivers a coherent capability that can be independently verified.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Monorepo Foundation & Shared Types** - Scaffold monorepo structure and define all shared TypeScript contracts in `packages/types`
- [ ] **Phase 2: Backend Auth API** - Registration and login endpoints; JWT issuance; role enforcement
- [ ] **Phase 3: Auth Client Integration** - Token persistence on web and mobile; logout flow
- [ ] **Phase 4: Backend Job Core — Posting & State Machine** - Job creation endpoints; state machine enforcement with HTTP 409 for invalid transitions
- [ ] **Phase 5: Backend Job Acceptance & Concurrency** - Accept endpoint with optimistic locking; HTTP 409 on version conflict; job visibility after acceptance
- [ ] **Phase 6: Real-Time Infrastructure** - WebSocket hub wired to backend; broadcast on every state transition; client dashboard updates
- [ ] **Phase 7: Web Client — Job Posting & Dashboard** - Next.js post form; live client dashboard receiving real-time updates
- [ ] **Phase 8: Mobile Client — Onboarding & Discovery** - Provider service area setup; filtered PENDING job list; full job detail view
- [ ] **Phase 9: Mobile Client — Acceptance & Lifecycle** - Provider accepts job with version field; updates status through IN_PROGRESS to COMPLETED; accepted job removed from others' lists
- [ ] **Phase 10: Job Closure & Ratings** - Client closes completed job; history section; rating and review submission; provider profile with ratings

## Phase Details

### Phase 1: Monorepo Foundation & Shared Types
**Goal**: All packages in the monorepo build cleanly and every cross-platform type contract is defined in one place
**Depends on**: Nothing (first phase)
**Requirements**: TYPES-01, TYPES-02, TYPES-03
**Success Criteria** (what must be TRUE):
  1. Running `tsc --noEmit` across all packages produces zero errors in strict mode
  2. `packages/types` exports the JobStatus enum (`PENDING`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`), the Role enum (`CLIENT`, `PROVIDER`), all job DTO interfaces, and all API response wrapper types
  3. `apps/web` and `apps/mobile` import types exclusively from `packages/types` — no locally defined duplicates exist anywhere in the codebase
  4. The monorepo workspace is configured so that a single `npm install` at root resolves all inter-package dependencies
**Plans**: 3 plans

Plans:
**Wave 1**
- [x] 01-01: Initialize monorepo with npm workspaces (root package.json, tsconfig.base.json, shared eslint config)

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 01-02: Scaffold `packages/types` — define all enums, DTOs, and API response shapes; configure package build

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 01-03: Scaffold `apps/web` (Next.js) and `apps/mobile` (Expo) with workspace references to `packages/types`; verify tsc clean

### Phase 2: Backend Auth API
**Goal**: Users can register and log in via the API; role is fixed at registration; authenticated requests carry verifiable credentials
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. A POST to `/auth/register` with email, password, and role (`CLIENT` or `PROVIDER`) creates a new user in the database and returns a signed JWT
  2. A POST to `/auth/login` with valid credentials returns a signed JWT containing the user's ID and role
  3. A POST to `/auth/login` with invalid credentials returns HTTP 401
  4. Attempting to register with an already-used email returns HTTP 409
  5. Protected routes reject requests with no or invalid JWT with HTTP 401
**Plans**: TBD

Plans:
- [ ] 02-01: Set up Drizzle schema (User model with role, email, passwordHash), run first migration, connect to PostgreSQL
- [ ] 02-02: Implement `/auth/register` and `/auth/login` endpoints with bcrypt + JWT; apply auth middleware to protected routes

### Phase 3: Auth Client Integration
**Goal**: Users on web and mobile can log in once and stay logged in across sessions; they can log out
**Depends on**: Phase 2
**Requirements**: AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. After logging in on the web app, refreshing the browser does not require re-login — the session token is stored client-side and rehydrated
  2. After logging in on the mobile app, closing and reopening the app does not require re-login
  3. Tapping/clicking Log Out on either platform clears the stored token and redirects to the login screen
  4. After logout, navigating to a protected route redirects to login rather than loading the protected page
**Plans**: TBD

Plans:
- [ ] 03-01: Implement web auth flow (Next.js login/register pages, token stored in httpOnly cookie or localStorage, auth context/middleware protecting client routes)
- [ ] 03-02: Implement mobile auth flow (Expo login/register screens, token stored in SecureStore, navigation guard protecting provider screens)

### Phase 4: Backend Job Core — Posting & State Machine
**Goal**: Jobs can be created via the API and the backend enforces all valid state transitions, rejecting invalid ones
**Depends on**: Phase 2
**Requirements**: JOB-POST-01, JOB-POST-02, JOB-POST-03, LIFECYCLE-03
**Success Criteria** (what must be TRUE):
  1. A POST to `/jobs` with a valid category (from the fixed list), description, timeframe, and city/area creates a job with status `PENDING` and `version = 1` in the database
  2. Attempting to post a job with an invalid category returns HTTP 400
  3. The API returns the newly created job using the shared DTO type from `packages/types`
  4. Attempting an invalid state transition (e.g., `PENDING → COMPLETED`) returns HTTP 409 with a clear error body
  5. Valid transitions (`PENDING → ACCEPTED`, `ACCEPTED → IN_PROGRESS`, `IN_PROGRESS → COMPLETED`) are accepted when submitted in order
**Plans**: TBD

Plans:
- [ ] 04-01: Extend Drizzle schema with Job model (category, description, timeframe, cityArea, status, version, clientId); run migration; seed category enum
- [ ] 04-02: Implement `/jobs` POST endpoint (create job, enforce CLIENT role) and state transition endpoint (enforce valid transition sequence, return 409 for violations)

### Phase 5: Backend Job Acceptance & Concurrency
**Goal**: A provider accepting a job locks it atomically — concurrent acceptances resolve to exactly one winner, the other gets HTTP 409
**Depends on**: Phase 4
**Requirements**: ACCEPT-01, ACCEPT-02, ACCEPT-03, ACCEPT-04, ACCEPT-05
**Success Criteria** (what must be TRUE):
  1. A provider sends POST `/jobs/:id/accept` with the current `version`; the backend atomically increments version, sets status to `ACCEPTED`, and assigns the job to that provider
  2. A concurrent acceptance of the same job by a second provider (same version submitted) returns HTTP 409; the job remains locked to the first acceptor in the database
  3. After acceptance, a GET `/jobs?cityArea=...` for the provider's area no longer includes the accepted job in the PENDING list
  4. The HTTP 200 response from a successful acceptance contains the full updated job DTO with incremented version
**Plans**: TBD

Plans:
- [ ] 05-01: Implement `/jobs/:id/accept` endpoint using Drizzle optimistic concurrency (version check in WHERE clause, atomic increment); return 409 on version mismatch; enforce PROVIDER role
- [ ] 05-02: Implement `/jobs` GET endpoint with `cityArea` and `status=PENDING` filtering; write concurrent acceptance integration test (two simultaneous requests, verify exactly one 200 and one 409)

### Phase 6: Real-Time Infrastructure
**Goal**: Every job state transition is broadcast over WebSocket and the client dashboard reflects changes within milliseconds of the provider action
**Depends on**: Phase 5
**Requirements**: DASH-01, DASH-02, DASH-03, LIFECYCLE-04
**Success Criteria** (what must be TRUE):
  1. The backend maintains a WebSocket server; clients can connect and authenticate their socket session
  2. When a provider's acceptance transitions a job to `ACCEPTED`, the client's browser dashboard reflects the new status without a page refresh and within seconds of the provider action
  3. When a provider updates a job to `IN_PROGRESS` or `COMPLETED`, those transitions are pushed to the client's open dashboard in real time
  4. Disconnecting and reconnecting a WebSocket client causes the client to refetch current job state (no stale data displayed)
**Plans**: TBD

Plans:
- [ ] 06-01: Add WebSocket server to `apps/web` (ws or socket.io); implement connection auth (JWT on handshake); define WebSocket event types in `packages/types`
- [ ] 06-02: Wire state transition logic to broadcast events on every job status change; implement client-side subscription in Next.js dashboard (context or hook); verify PENDING→ACCEPTED, ACCEPTED→IN_PROGRESS, IN_PROGRESS→COMPLETED all arrive in real time

### Phase 7: Web Client — Job Posting & Dashboard
**Goal**: Authenticated clients can post jobs from the web app and see all their jobs with live status on a dashboard
**Depends on**: Phase 6
**Requirements**: JOB-POST-04
**Success Criteria** (what must be TRUE):
  1. A logged-in client fills out and submits the job posting form (category from dropdown, description, timeframe, city/area) and sees the new job appear on their dashboard with status `PENDING`
  2. The client dashboard lists all their posted jobs with current status displayed
  3. When a provider action changes a job's status (in another session/device), the dashboard updates to show the new status without the client refreshing the page
  4. The web app uses types imported from `packages/types` for all API calls and response handling — no locally defined types
**Plans**: TBD

Plans:
- [ ] 07-01: Build Next.js job posting page (form with category select, description textarea, timeframe input, city/area input; POST to API; redirect to dashboard on success)
- [ ] 07-02: Build client dashboard page (fetch all client's jobs; subscribe to WebSocket updates; render live job list with status badges)
**UI hint**: yes

### Phase 8: Mobile Client — Onboarding & Discovery
**Goal**: An authenticated provider can set their service area and browse PENDING jobs matching that area; they can read full job details before acting
**Depends on**: Phase 5
**Requirements**: DISC-01, DISC-02, DISC-03
**Success Criteria** (what must be TRUE):
  1. On first login, a provider is prompted to select or enter their service area (city/area) before seeing the job list
  2. The provider's job list shows only PENDING jobs whose `cityArea` matches their selected area
  3. Tapping a job opens a detail screen showing category, description, timeframe, and location area
  4. If no PENDING jobs exist in the provider's area, the list shows an empty state rather than erroring
**Plans**: TBD

Plans:
- [ ] 08-01: Build Expo onboarding screen for service area selection (stored locally and sent to API on profile update); implement navigation guard routing new providers through onboarding
- [ ] 08-02: Build job list screen (fetch filtered PENDING jobs by cityArea; pull-to-refresh) and job detail screen (full job info; Accept button placeholder)
**UI hint**: yes

### Phase 9: Mobile Client — Acceptance & Lifecycle
**Goal**: A provider can accept a job from the mobile app and update its status through to COMPLETED; accepted jobs vanish from other providers' lists
**Depends on**: Phase 8
**Requirements**: LIFECYCLE-01, LIFECYCLE-02
**Success Criteria** (what must be TRUE):
  1. Tapping Accept on the job detail screen sends the acceptance request with the current `version`; on success the job moves to the provider's active jobs list
  2. If acceptance fails due to a concurrent conflict (HTTP 409), the app shows an error message and refreshes the job list (the job is gone or already accepted)
  3. A provider can change an accepted job's status to `IN_PROGRESS` from their active jobs screen
  4. A provider can change an `IN_PROGRESS` job to `COMPLETED`
  5. After a job is accepted, it no longer appears in the PENDING job list visible to other providers
**Plans**: TBD

Plans:
- [ ] 09-01: Wire Accept button on job detail screen to POST `/jobs/:id/accept` with version; handle 200 (move to active list) and 409 (show conflict message, refresh list); build active jobs list screen
- [ ] 09-02: Build status update controls on active job detail (IN_PROGRESS button, COMPLETED button); submit PATCH with new status; update local state on success

### Phase 10: Job Closure & Ratings
**Goal**: Clients can close completed jobs and submit ratings; providers have visible rating histories on their profiles
**Depends on**: Phase 9
**Requirements**: CLOSE-01, CLOSE-02, RATING-01, RATING-02, RATING-03
**Success Criteria** (what must be TRUE):
  1. A client sees a Close button on any job with status `COMPLETED` and clicking it triggers the final state transition in the database
  2. Closed jobs no longer appear in the active jobs list; they appear in a History section on the dashboard
  3. After closing, the client is prompted to submit a rating (1–5 stars) and optional text review for the provider
  4. Submitting a rating a second time for the same job is rejected (HTTP 409 or equivalent)
  5. A provider's public profile page shows their average star rating and a list of text reviews from past clients
**Plans**: TBD

Plans:
- [ ] 10-01: Add Rating model to Drizzle schema (jobId unique, providerId, score 1-5, text optional); implement `/jobs/:id/close` endpoint and `/ratings` POST endpoint with uniqueness enforcement
- [ ] 10-02: Build web client — Close button on COMPLETED jobs, history section on dashboard, post-close rating form
- [ ] 10-03: Build provider profile page (web and/or mobile) showing average rating and review list; fetch from `/providers/:id/profile` endpoint
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Monorepo Foundation & Shared Types | 1/3 | In Progress|  |
| 2. Backend Auth API | 0/2 | Not started | - |
| 3. Auth Client Integration | 0/2 | Not started | - |
| 4. Backend Job Core — Posting & State Machine | 0/2 | Not started | - |
| 5. Backend Job Acceptance & Concurrency | 0/2 | Not started | - |
| 6. Real-Time Infrastructure | 0/2 | Not started | - |
| 7. Web Client — Job Posting & Dashboard | 0/2 | Not started | - |
| 8. Mobile Client — Onboarding & Discovery | 0/2 | Not started | - |
| 9. Mobile Client — Acceptance & Lifecycle | 0/2 | Not started | - |
| 10. Job Closure & Ratings | 0/3 | Not started | - |
