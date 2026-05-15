# Requirements — Local Services Task Marketplace

## v1 Requirements

### Authentication (AUTH)

- [x] **AUTH-01**: User can register an account by providing email, password, and selecting a role (Client or Provider)
- [x] **AUTH-02**: User can log in with email and password and receive a session token
- [x] **AUTH-03**: User session persists across page/app reloads (token stored client-side)
- [x] **AUTH-04**: User can log out, invalidating their session

### Job Posting — Client Web (JOB-POST)

- [x] **JOB-POST-01**: Authenticated client can post a job by selecting a category from a fixed predefined list
- [x] **JOB-POST-02**: Client can provide a freeform description and required timeframe when posting a job
- [x] **JOB-POST-03**: Newly posted job is persisted with status PENDING and assigned a version number (v=1)
- [x] **JOB-POST-04**: Client can view all their posted jobs on a dashboard

### Real-Time Dashboard — Client Web (DASH)

- [x] **DASH-01**: Client dashboard receives live job status updates via WebSocket without page refresh
- [x] **DASH-02**: Status change from PENDING → ACCEPTED reflects on client dashboard within milliseconds of provider action
- [x] **DASH-03**: Each subsequent provider status update (IN_PROGRESS, COMPLETED) is pushed to the client dashboard in real time

### Job Discovery — Provider Mobile (DISC)

- [x] **DISC-01**: Authenticated provider can set their service area (city/area) during onboarding or profile setup
- [x] **DISC-02**: Provider sees a filtered list of PENDING jobs matching their selected city/area
- [x] **DISC-03**: Provider can view full job details (category, description, timeframe, location area) before accepting

### Job Acceptance & Concurrency (ACCEPT)

- [x] **ACCEPT-01**: Provider can accept a PENDING job, transitioning it to ACCEPTED
- [x] **ACCEPT-02**: Acceptance request includes the job's current `version` value
- [x] **ACCEPT-03**: Backend atomically increments `version` on successful acceptance; returns HTTP 200 with updated job
- [x] **ACCEPT-04**: If two providers submit concurrent acceptance for the same job, the second request receives HTTP 409 (Conflict) and the job remains locked to the first acceptor
- [x] **ACCEPT-05**: Accepted job is no longer visible in other providers' open job lists

### Job Lifecycle — Provider Mobile (LIFECYCLE)

- [x] **LIFECYCLE-01**: Provider can update job status from ACCEPTED → IN_PROGRESS
- [x] **LIFECYCLE-02**: Provider can update job status from IN_PROGRESS → COMPLETED
- [x] **LIFECYCLE-03**: Invalid state transitions (e.g., PENDING → COMPLETED) are rejected by the backend with HTTP 409
- [x] **LIFECYCLE-04**: Each status update triggers a WebSocket broadcast to the client's dashboard

### Job Closure — Client Web (CLOSE)

- [x] **CLOSE-01**: Client can close a job that has status COMPLETED, triggering a final state transition in the database
- [x] **CLOSE-02**: Closed jobs are moved to a "History" section on the client dashboard

### Ratings & Reviews (RATING)

- [x] **RATING-01**: After closing a job, client can submit a numeric rating (1–5) and optional text review for the provider
- [x] **RATING-02**: A job can only be rated once
- [x] **RATING-03**: Provider's ratings are visible on their public profile (average score + review list)

### Shared Type System (TYPES)

- [x] **TYPES-01**: All DTOs, API response shapes, and enums are defined in `packages/types`
- [x] **TYPES-02**: Web (`apps/web`) and mobile (`apps/mobile`) import types exclusively from `packages/types` — no local type duplication
- [x] **TYPES-03**: Job status enum, role enum, and all request/response interfaces are defined once in `packages/types`

---

### Provider & Client Identity — Job Context (IDENTITY)

- [x] **IDENTITY-01**: Web task detail view shows the provider's email/name when a job has been accepted (visible to the client)
- [x] **IDENTITY-02**: Mobile job detail screen shows the client's email/name (visible to the provider who accepted or is viewing the job)
- [x] **IDENTITY-03**: Provider public profile page (`/providers/[id]`) displays profile info (email, name, avatar initials, member since) and all approved reviews with star ratings
- [x] **IDENTITY-04**: `GET /api/users/[id]` returns a public user DTO (email, name, avatarUrl, role, createdAt) — no password hash or sensitive fields
- [x] **IDENTITY-05**: Users table gains optional `name` and `avatarUrl` columns (schema migration); existing rows are unaffected (nullable, no backfill required)

---

### UI Design Language (UI)

- [x] **UI-01**: Design tokens in `globals.css` — `surface-900` is primary CTA color; amber (`accent-500`) is retired from all button roles
- [x] **UI-02**: Landing page rebuilt to Variant B sketch: announcement bar, split hero, metrics panel, numbered feature strip, categories data table
- [x] **UI-03**: Login and register pages rebuilt: `surface-900` left panel, `surface-50` right form; register includes role picker cards and password strength bar
- [x] **UI-04**: Client dashboard rebuilt: stat strip, numbered panels, jobs data table with tab bar and search
- [x] **UI-05**: Provider dashboard rebuilt: available jobs feed with teal-accent featured rows and active jobs progress track
- [x] **UI-06**: Browse page rebuilt: sidebar filter list, jobs as data table, teal accent on new jobs, pagination
- [x] **UI-07**: Mobile feed rebuilt: filter chips, unified-token outlined cards, pinned `surface-900` Accept CTA
- [x] **UI-08**: Mobile active jobs rebuilt with 4-step progress track; settings rebuilt with grouped icon-tile rows and bottom sheet area picker replacing Paper Dialog

---

## v2 Requirements (Deferred)

- In-app messaging between client and provider after job acceptance
- Payment handling (price setting, client payment, provider payout)
- Native mobile push notifications (beyond WebSocket)
- Provider availability scheduling
- Admin moderation dashboard

---

## Out of Scope

- Provider bidding — instant first-accept-wins model only; bidding adds state complexity without capstone value
- GPS-based job discovery — city/area manual selection is sufficient; avoids device permission complexity
- Role switching — a user is either a Client or Provider, set at registration
- Real-time chat — WebSocket status updates cover coordination needs for v1

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| TYPES-01 | Phase 1 | Complete |
| TYPES-02 | Phase 1 | Complete |
| TYPES-03 | Phase 1 | Complete |
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 3 | Complete |
| AUTH-04 | Phase 3 | Complete |
| JOB-POST-01 | Phase 4 | Complete |
| JOB-POST-02 | Phase 4 | Complete |
| JOB-POST-03 | Phase 4 | Complete |
| LIFECYCLE-03 | Phase 4 | Complete |
| ACCEPT-01 | Phase 5 | Complete |
| ACCEPT-02 | Phase 5 | Complete |
| ACCEPT-03 | Phase 5 | Complete |
| ACCEPT-04 | Phase 5 | Complete |
| ACCEPT-05 | Phase 5 | Complete |
| DASH-01 | Phase 6 | Complete |
| DASH-02 | Phase 6 | Complete |
| DASH-03 | Phase 6 | Complete |
| LIFECYCLE-04 | Phase 6 | Complete |
| JOB-POST-04 | Phase 7 | Complete |
| DISC-01 | Phase 8 | Complete |
| DISC-02 | Phase 8 | Complete |
| DISC-03 | Phase 8 | Complete |
| LIFECYCLE-01 | Phase 9 | Complete |
| LIFECYCLE-02 | Phase 9 | Complete |
| CLOSE-01 | Phase 10 | Complete |
| CLOSE-02 | Phase 10 | Complete |
| RATING-01 | Phase 11 | Complete |
| RATING-02 | Phase 11 | Complete |
| RATING-03 | Phase 11 | Complete |
| IDENTITY-01 | Phase 13 | Complete |
| IDENTITY-02 | Phase 13 | Complete |
| IDENTITY-03 | Phase 13 | Complete |
| IDENTITY-04 | Phase 13 | Complete |
| IDENTITY-05 | Phase 13 | Complete |
| UI-01 | Phase 12 | Complete |
| UI-02 | Phase 12 | Complete |
| UI-03 | Phase 12 | Complete |
| UI-04 | Phase 12 | Complete |
| UI-05 | Phase 12 | Complete |
| UI-06 | Phase 12 | Complete |
| UI-07 | Phase 12 | Complete |
| UI-08 | Phase 12 | Complete |
