# Requirements — Local Services Task Marketplace

## v1 Requirements

### Authentication (AUTH)

- [ ] **AUTH-01**: User can register an account by providing email, password, and selecting a role (Client or Provider)
- [ ] **AUTH-02**: User can log in with email and password and receive a session token
- [ ] **AUTH-03**: User session persists across page/app reloads (token stored client-side)
- [ ] **AUTH-04**: User can log out, invalidating their session

### Job Posting — Client Web (JOB-POST)

- [ ] **JOB-POST-01**: Authenticated client can post a job by selecting a category from a fixed predefined list
- [ ] **JOB-POST-02**: Client can provide a freeform description and required timeframe when posting a job
- [ ] **JOB-POST-03**: Newly posted job is persisted with status PENDING and assigned a version number (v=1)
- [ ] **JOB-POST-04**: Client can view all their posted jobs on a dashboard

### Real-Time Dashboard — Client Web (DASH)

- [ ] **DASH-01**: Client dashboard receives live job status updates via WebSocket without page refresh
- [ ] **DASH-02**: Status change from PENDING → ACCEPTED reflects on client dashboard within milliseconds of provider action
- [ ] **DASH-03**: Each subsequent provider status update (IN_PROGRESS, COMPLETED) is pushed to the client dashboard in real time

### Job Discovery — Provider Mobile (DISC)

- [ ] **DISC-01**: Authenticated provider can set their service area (city/area) during onboarding or profile setup
- [ ] **DISC-02**: Provider sees a filtered list of PENDING jobs matching their selected city/area
- [ ] **DISC-03**: Provider can view full job details (category, description, timeframe, location area) before accepting

### Job Acceptance & Concurrency (ACCEPT)

- [ ] **ACCEPT-01**: Provider can accept a PENDING job, transitioning it to ACCEPTED
- [ ] **ACCEPT-02**: Acceptance request includes the job's current `version` value
- [ ] **ACCEPT-03**: Backend atomically increments `version` on successful acceptance; returns HTTP 200 with updated job
- [ ] **ACCEPT-04**: If two providers submit concurrent acceptance for the same job, the second request receives HTTP 409 (Conflict) and the job remains locked to the first acceptor
- [ ] **ACCEPT-05**: Accepted job is no longer visible in other providers' open job lists

### Job Lifecycle — Provider Mobile (LIFECYCLE)

- [ ] **LIFECYCLE-01**: Provider can update job status from ACCEPTED → IN_PROGRESS
- [ ] **LIFECYCLE-02**: Provider can update job status from IN_PROGRESS → COMPLETED
- [ ] **LIFECYCLE-03**: Invalid state transitions (e.g., PENDING → COMPLETED) are rejected by the backend with HTTP 409
- [ ] **LIFECYCLE-04**: Each status update triggers a WebSocket broadcast to the client's dashboard

### Job Closure — Client Web (CLOSE)

- [ ] **CLOSE-01**: Client can close a job that has status COMPLETED, triggering a final state transition in the database
- [ ] **CLOSE-02**: Closed jobs are moved to a "History" section on the client dashboard

### Ratings & Reviews (RATING)

- [ ] **RATING-01**: After closing a job, client can submit a numeric rating (1–5) and optional text review for the provider
- [ ] **RATING-02**: A job can only be rated once
- [ ] **RATING-03**: Provider's ratings are visible on their public profile (average score + review list)

### Shared Type System (TYPES)

- [ ] **TYPES-01**: All DTOs, API response shapes, and enums are defined in `packages/types`
- [ ] **TYPES-02**: Web (`apps/web`) and mobile (`apps/mobile`) import types exclusively from `packages/types` — no local type duplication
- [ ] **TYPES-03**: Job status enum, role enum, and all request/response interfaces are defined once in `packages/types`

---

### UI Design Language (UI)

- [ ] **UI-01**: Design tokens in `globals.css` — `surface-900` is primary CTA color; amber (`accent-500`) is retired from all button roles
- [ ] **UI-02**: Landing page rebuilt to Variant B sketch: announcement bar, split hero, metrics panel, numbered feature strip, categories data table
- [ ] **UI-03**: Login and register pages rebuilt: `surface-900` left panel, `surface-50` right form; register includes role picker cards and password strength bar
- [ ] **UI-04**: Client dashboard rebuilt: stat strip, numbered panels, jobs data table with tab bar and search
- [ ] **UI-05**: Provider dashboard rebuilt: available jobs feed with teal-accent featured rows and active jobs progress track
- [ ] **UI-06**: Browse page rebuilt: sidebar filter list, jobs as data table, teal accent on new jobs, pagination
- [ ] **UI-07**: Mobile feed rebuilt: filter chips, unified-token outlined cards, pinned `surface-900` Accept CTA
- [ ] **UI-08**: Mobile active jobs rebuilt with 4-step progress track; settings rebuilt with grouped icon-tile rows and bottom sheet area picker replacing Paper Dialog

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
| TYPES-01 | Phase 1 | Pending |
| TYPES-02 | Phase 1 | Pending |
| TYPES-03 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 3 | Pending |
| AUTH-04 | Phase 3 | Pending |
| JOB-POST-01 | Phase 4 | Pending |
| JOB-POST-02 | Phase 4 | Pending |
| JOB-POST-03 | Phase 4 | Pending |
| LIFECYCLE-03 | Phase 4 | Pending |
| ACCEPT-01 | Phase 5 | Pending |
| ACCEPT-02 | Phase 5 | Pending |
| ACCEPT-03 | Phase 5 | Pending |
| ACCEPT-04 | Phase 5 | Pending |
| ACCEPT-05 | Phase 5 | Pending |
| DASH-01 | Phase 6 | Pending |
| DASH-02 | Phase 6 | Pending |
| DASH-03 | Phase 6 | Pending |
| LIFECYCLE-04 | Phase 6 | Pending |
| JOB-POST-04 | Phase 7 | Pending |
| DISC-01 | Phase 8 | Pending |
| DISC-02 | Phase 8 | Pending |
| DISC-03 | Phase 8 | Pending |
| LIFECYCLE-01 | Phase 9 | Pending |
| LIFECYCLE-02 | Phase 9 | Pending |
| CLOSE-01 | Phase 10 | Pending |
| CLOSE-02 | Phase 10 | Pending |
| RATING-01 | Phase 10 | Pending |
| RATING-02 | Phase 10 | Pending |
| RATING-03 | Phase 10 | Pending |
| UI-01 | Phase 12 | Pending |
| UI-02 | Phase 12 | Pending |
| UI-03 | Phase 12 | Pending |
| UI-04 | Phase 12 | Pending |
| UI-05 | Phase 12 | Pending |
| UI-06 | Phase 12 | Pending |
| UI-07 | Phase 12 | Pending |
| UI-08 | Phase 12 | Pending |
