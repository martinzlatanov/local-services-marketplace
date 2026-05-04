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
| AUTH-01 – AUTH-04 | — | Pending mapping |
| JOB-POST-01 – JOB-POST-04 | — | Pending mapping |
| DASH-01 – DASH-03 | — | Pending mapping |
| DISC-01 – DISC-03 | — | Pending mapping |
| ACCEPT-01 – ACCEPT-05 | — | Pending mapping |
| LIFECYCLE-01 – LIFECYCLE-04 | — | Pending mapping |
| CLOSE-01 – CLOSE-02 | — | Pending mapping |
| RATING-01 – RATING-03 | — | Pending mapping |
| TYPES-01 – TYPES-03 | — | Pending mapping |
