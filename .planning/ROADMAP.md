# Project Roadmap

## Phase 1: Monorepo Foundation & Shared Types
**Goal**: Establish the Turborepo structure, shared TypeScript configuration, and common data transfer objects (DTOs)
**Status**: Complete
**Requirements**: INIT-01, INIT-02, INIT-03
**Success Criteria** (what must be TRUE):
  1. `npm run typecheck` passes from the root, validating both `apps/web` and `apps/mobile`
  2. Both apps can import a shared `UserDto` from `packages/types`
**Plans**: 3 plans

Plans:
- [x] 01-01: Initialize Turborepo with `apps/web` (Next.js) and `apps/mobile` (Expo); configure root `package.json` workspaces
- [x] 01-02: Create `packages/types` with `tsconfig.json` and initial `UserDto` interface; link as dependency in both apps
- [x] 01-03: Configure strict TypeScript settings across all packages; verify cross-package imports work

## Phase 2: Backend Auth API
**Goal**: A secure Next.js API route that issues JWTs and manages user sessions in the database
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. `POST /api/auth/register` creates a user in the database and returns a JWT
  2. `POST /api/auth/login` validates credentials and returns a JWT
  3. `GET /api/auth/me` validates the JWT and returns the user profile
**Plans**: 3 plans

Plans:
- [x] 02-01: Set up Neon serverless Postgres with Drizzle ORM; define `Users` schema (id, email, password_hash, role)
- [x] 02-02: Implement `/api/auth/register` and `/api/auth/login` routes using `bcrypt` for password hashing and `jose` for JWT generation
- [x] 02-03: Implement `/api/auth/me` route with JWT verification middleware; write automated tests for auth flow

## Phase 3: Auth Client Integration
**Goal**: Both Web and Mobile clients can log in, maintain session state, and protect private routes
**Depends on**: Phase 2
**Requirements**: AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. Web client stores JWT in an `httpOnly` cookie and redirects unauthenticated users away from `/dashboard`
  2. Mobile client stores JWT in Expo SecureStore and shows the Auth screen if no token is found
  3. Both clients display the logged-in user's email on their respective home screens
**Plans**: 5 plans

Plans:
- [x] 03-01: Define shared auth API client functions in `packages/api-client` (login, register, getMe)
- [x] 03-02: Web: Implement Next.js middleware for route protection; create login/register pages
- [x] 03-03: Web: Implement React Context for global auth state; wire up login form to API
- [x] 03-04: Mobile: Set up Expo Router with protected `(app)` group and public `(auth)` group
- [x] 03-05: Mobile: Implement SecureStore token management and wire up mobile login screen

## Phase 4: Backend Job Core (Posting & State Machine)
**Goal**: Clients can post jobs, and the database enforces valid state transitions (PENDING -> ACCEPTED -> IN_PROGRESS -> COMPLETED)
**Depends on**: Phase 3
**Requirements**: JOB-POST-01, JOB-POST-02, JOB-POST-03, LIFECYCLE-03
**Success Criteria** (what must be TRUE):
  1. `POST /api/jobs` creates a job with status `PENDING` and `version: 1`
  2. `PATCH /api/jobs/:id/status` successfully transitions a job from `PENDING` to `ACCEPTED`
  3. `PATCH /api/jobs/:id/status` rejects a transition from `PENDING` directly to `COMPLETED` (HTTP 400)
**Plans**: 2 plans

Plans:
- [x] 04-01: Extend Drizzle schema with `Jobs` table (id, client_id, provider_id, category, description, status, version)
- [x] 04-02: Implement `/api/jobs` POST route; implement `/api/jobs/:id/status` PATCH route with state machine validation

## Phase 5: Backend Job Acceptance & Concurrency
**Goal**: Providers can accept jobs safely without race conditions (Optimistic Concurrency Control)
**Depends on**: Phase 4
**Requirements**: ACCEPT-01, ACCEPT-02, ACCEPT-03, ACCEPT-04, ACCEPT-05
**Success Criteria** (what must be TRUE):
  1. If two providers try to accept the same `PENDING` job simultaneously, exactly one succeeds (HTTP 200) and one fails (HTTP 409 Conflict)
  2. The successful acceptance increments the job's `version` column in the database
**Plans**: 2 plans

Plans:
- [x] 05-01: Implement `/api/jobs/:id/accept` route; add `version` check to SQL update (`WHERE id = ? AND version = ?`)
- [x] 05-02: Write concurrency tests simulating simultaneous requests to verify exactly-once acceptance

### Phase 6: Real-Time Infrastructure
**Goal**: Every job state transition is broadcast over WebSocket and the client dashboard reflects changes within milliseconds of the provider action
**Depends on**: Phase 5
**Requirements**: DASH-01, DASH-02, DASH-03, LIFECYCLE-04
**Success Criteria** (what must be TRUE):
  1. The backend maintains a WebSocket server; clients can connect and authenticate their socket session
  2. When a provider's acceptance transitions a job to `ACCEPTED`, the client's browser dashboard reflects the new status without a page refresh and within seconds of the provider action
  3. When a provider updates a job to `IN_PROGRESS` or `COMPLETED`, those transitions are pushed to the client's open dashboard in real time
  4. Disconnecting and reconnecting a WebSocket client causes the client to refetch current job state (no stale data displayed)
**Plans**: 2 plans

Plans:
- [x] 06-01: Add WebSocket server to `apps/web` (ws or socket.io); implement connection auth (JWT on handshake); define WebSocket event types in `packages/types`
- [x] 06-02: Wire state transition logic to broadcast events on every job status change; implement client-side subscription in Next.js dashboard (context or hook); verify PENDING→ACCEPTED, ACCEPTED→IN_PROGRESS, IN_PROGRESS→COMPLETED all arrive in real time

### Phase 7: Web Client — Job Posting & Dashboard
**Goal**: Authenticated clients can post jobs from the web app and see all their jobs with live status on a dashboard
**Depends on**: Phase 6
**Requirements**: JOB-POST-04
**Success Criteria** (what must be TRUE):
  1. A logged-in client fills out and submits the job posting form (category from dropdown, description, timeframe, city/area) and sees the new job appear on their dashboard with status `PENDING`
**Plans**: 2 plans

Plans:
- [x] 07-01-PLAN.md — Implement the job posting form and integrate it into the client dashboard
- [x] 07-02-PLAN.md — Implement the dashboard layout and job card components to display the user's posted jobs with real-time status updates

### Phase 8: Mobile Client — Job Discovery & Acceptance
**Goal**: Providers can browse available jobs in their area and accept them with a single tap
**Depends on**: Phase 5
**Requirements**: DISC-01, DISC-02, DISC-03
**Success Criteria** (what must be TRUE):
  1. The mobile app displays a feed of `PENDING` jobs filtered by the provider's selected city/area
  2. Tapping "Accept" on a job calls the acceptance API and immediately removes the job from the available feed on success
  3. If the acceptance API returns a 409 Conflict (job already taken), the app shows a clear error message and refreshes the feed
**Plans**: 3 plans

Plans:
- [x] 08-01-PLAN.md — Service area contract, SecureStore hook, onboarding gate, and tabs shell
- [x] 08-02-PLAN.md — Feed list with API client, pull-to-refresh, and WebSocket updates
- [x] 08-03-PLAN.md — Job detail accept flow and Settings area editing

### Phase 9: Mobile Client — Active Job Execution
**Goal**: Providers can manage the lifecycle of an accepted job (In Progress -> Completed)
**Depends on**: Phase 8
**Requirements**: LIFECYCLE-01, LIFECYCLE-02
**Success Criteria** (what must be TRUE):
  1. The mobile app has an "Active Jobs" tab showing jobs the provider has accepted
  2. The provider can tap "Start Work" to transition the job to `IN_PROGRESS`
  3. The provider can tap "Finish Work" to transition the job to `COMPLETED`

### Phase 10: End-to-End Polish & Deployment
**Goal**: The system is deployed to production environments and passes a full lifecycle test
**Depends on**: Phase 7, Phase 9
**Requirements**: (All remaining polish items)
**Success Criteria** (what must be TRUE):
  1. Web app is deployed to Vercel
  2. Database is provisioned in Neon production environment
  3. A user can register as a client on the web, post a job, register as a provider on mobile, accept the job, and complete it, with all real-time updates functioning in the production environment
