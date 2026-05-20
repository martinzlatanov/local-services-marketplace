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
**Status**: Complete
**Plans**: 3 plans

Plans:
- [x] 09-01-PLAN.md — Backend GET /api/jobs/mine endpoint + mobile API helpers (getMyJobs, updateJobStatus)
- [x] 09-02-PLAN.md — Active Jobs tab (Feed | Active Jobs | Settings) with tab-focus refresh and pull-to-refresh
- [x] 09-03-PLAN.md — Detail screen with conditional CTAs (Accept / Start Work / Finish Work) based on job status

**Success Criteria** (what must be TRUE):
  1. The mobile app has an "Active Jobs" tab showing jobs the provider has accepted
  2. The provider can tap "Start Work" to transition the job to `IN_PROGRESS`
  3. The provider can tap "Finish Work" to transition the job to `COMPLETED`

### Phase 10: End-to-End Polish & Deployment
**Goal**: The system is deployed to production environments and passes a full lifecycle test
**Depends on**: Phase 7, Phase 9
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03
**Status**: ✅ COMPLETE
**Plans**: 3 plans

Plans:
- [x] 10-01-PLAN.md — Vercel deployment config + production environment variables
- [x] 10-02-PLAN.md — Neon production database + Drizzle migrations setup
- [x] 10-03-PLAN.md — E2E test checklist + mobile production configuration

**Success Criteria** (what must be TRUE):
  1. ✅ Web app is deployed to Vercel (https://web-f22sfm8v1-martinzlatanov-8547s-projects.vercel.app)
  2. ✅ Database is provisioned in Neon production environment (NEON-SETUP.md created)
  3. ⚠️ Full lifecycle E2E test needs manual execution (E2E-TEST-CHECKLIST.md created)

**Deployment Details:**
- Production URL: https://web-f22sfm8v1-martinzlatanov-8547s-projects.vercel.app
- Vercel Inspect: https://vercel.com/martinzlatanov-8547s-projects/web/5SbX5DjDLbCH3tpxGULCFXaRXF2t
- Mobile app configured with production API URL

### Phase 11: Ratings & Reviews
**Goal**: Clients can rate and review service providers after job completion; providers can see their ratings on their profile
**Depends on**: Phase 10
**Requirements**: REVIEW-01, REVIEW-02
**Status**: ✅ COMPLETE
**Plans**: 4 plans

**Success Criteria** (what must be TRUE):
  1. ✅ Client can submit a 1-5 star rating with category ratings (communication, quality, punctuality) and text review for a provider after a job is `COMPLETED`
  2. ✅ Review includes optional photo upload; reviews require admin approval before appearing on provider's public profile
  3. ✅ Provider's profile displays their average rating and list of approved reviews
  4. ✅ Both clients and providers can view review history (clients reviewing providers, providers reviewing clients)

**Plans Executed**:
- [x] 11-01-PLAN.md — Database schema & types foundation
- [x] 11-02-PLAN.md — Review APIs (submission, query, approval)
- [x] 11-03-PLAN.md — Frontend review UI (forms & profile display)
- [x] 11-04-PLAN.md — Admin dashboard & WebSocket integration

### Phase 12: UI Revamp — Stripe/Linear Design Language
**Goal**: Replace the current teal-gradient, amber-CTA aesthetic with a clinical monochrome design language across all screens: web (Next.js + Tailwind CSS) and mobile (React Native + Paper). Every public-facing screen is rebuilt to the approved sketch specifications.
**Depends on**: Phase 11
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UI-08
**Status**: Ready to plan
**Plans**: TBD

**Success Criteria** (what must be TRUE):
  1. `apps/web/app/globals.css` primary CTA color is `surface-900` (`#0f172a`); no amber (`#f59e0b`) in any button role
  2. Landing page matches sketch `01-landing-page-variant-B.html`: announcement bar, split hero, metrics panel, numbered feature strip, categories data table
  3. Login page matches sketch `03-auth-login.html`: `surface-900` left panel, `surface-50` right form, no teal gradient
  4. Register page matches sketch `06-auth-register.html`: role picker cards with `surface-900` active border + radio check dot
  5. Client dashboard matches sketch `04-client-dashboard.html`: stat strip, numbered panels, jobs data table with tab bar
  6. Provider dashboard matches sketch `05-provider-dashboard.html`: available jobs feed with teal-accent rows, active jobs progress track
  7. Browse page matches sketch `07-browse-page.html`: sidebar filter list, jobs as data table, pagination
  8. Mobile feed matches sketch `02-mobile-feed-variant-A.html`: filter chips, unified-token cards, pinned Accept CTA
  9. Mobile active jobs + settings match sketch `08-mobile-active-jobs-settings.html`: progress track cards, bottom sheet area picker replaces Paper Dialog

### Phase 13: Provider & Client Identity
**Goal**: Surface who is involved in each job — providers see client info on job details, clients see provider info on job details — and give providers a public profile page showing all their approved reviews, an avatar, and profile metadata.
**Depends on**: Phase 12
**Requirements**: IDENTITY-01, IDENTITY-02, IDENTITY-03, IDENTITY-04, IDENTITY-05
**Status**: ✅ COMPLETE
**Plans**: 4 plans

**Success Criteria** (what must be TRUE):
  1. ✅ Web job detail (client view) shows provider email and name when a job has `providerId` set
  2. ✅ Mobile job detail (provider view) shows client email and name for every job
  3. ✅ `GET /api/users/[id]` returns `{ id, email, name, avatarUrl, role, createdAt }` — no password hash
  4. ✅ Provider profile page at `/providers/[id]` renders: avatar initials circle, email/name, member-since date, average star rating, and list of approved reviews with photos
  5. ✅ `users` table has nullable `name` varchar(100) and `avatarUrl` text columns — migration applied without breaking existing rows

### Phase 14: Advanced Admin Dashboard
**Goal**: Admins can manage users (suspend/activate, change roles) in a dedicated admin-only dashboard. A single user can hold multiple roles (CLIENT, PROVIDER, ADMIN) simultaneously. Suspended users cannot log in but their data (jobs, reviews) persists.
**Depends on**: Phase 13
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04
**Status**: Ready to spec
**Plans**: TBD

**Success Criteria** (what must be TRUE):
  1. Admins can list all users (email, role, status) with search and pagination
  2. Admins can suspend/activate users; suspended users cannot log in but data persists
  3. Admins can add/remove CLIENT or PROVIDER roles from any user; users can hold multiple roles
  4. Users with ADMIN role can also be CLIENT or PROVIDER simultaneously
  5. `/admin/dashboard` page is accessible only to users with ADMIN role; redirects non-admins to unauthorized page

### Phase 15: Job Categories & Locations DB Normalization
**Goal**: Extract job categories and service locations from inline enums/varchars into dedicated lookup tables (`job_categories`, `locations`) with foreign keys; each migration is a standalone replayable SQL file
**Depends on**: Phase 14
**Requirements**: NORM-01, NORM-02, NORM-03, NORM-04, NORM-05
**Status**: Complete ✓ (2026-05-20)
**Plans**: 4 plans — all complete

**Success Criteria** (what must be TRUE):
  1. A `job_categories` table exists with seeded rows for all 8 current category values; `jobs.category` column references it via FK
  2. A `locations` table exists with seeded rows for common city/area values; `jobs.city_area` column references it via FK
  3. Each DB change is in its own numbered migration file (e.g. `0004_add_job_categories.sql`, `0005_add_locations.sql`, etc.) so the schema can be fully replayed from scratch
  4. All existing API routes (`POST /api/jobs`, `GET /api/jobs`, `PATCH /api/jobs/:id/status`, `PATCH /api/jobs/:id/accept`) pass TypeScript type-checks and return correct data after the schema change
  5. The Drizzle schema (`apps/web/lib/db/schema.ts`) reflects the new tables and FK relations; the `jobCategoryEnum` pgEnum is removed
