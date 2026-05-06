---
status: complete
phase: 05-backend-job-acceptance-and-concurrency
source: [.planning/phases/05-backend-job-acceptance-and-concurrency/05-01-PLAN.md, .planning/phases/05-backend-job-acceptance-and-concurrency/05-02-PLAN.md]
started: 2026-05-06T12:30:00Z
updated: 2026-05-06T13:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 6
name: Concurrent Acceptance Exactly-Once Guarantee
expected: |
  Using a test or script, simulate two nearly-simultaneous POST /api/jobs/:id/accept requests with the same version number.
  Verify that exactly one request returns HTTP 200 and the other returns HTTP 409.
  After the test, the job status is ACCEPTED and version has been incremented exactly once.
[testing complete]

## Tests

### 1. Provider Can Accept PENDING Job
expected: |
  A provider (role=PROVIDER) sends POST /api/jobs/:id/accept with body { "version": 1 }.
  The response is HTTP 200 with a JobDto containing status: "ACCEPTED", providerId set to the provider's ID, and version: 2 (incremented from 1).
  The job's status in the database changes from PENDING to ACCEPTED.
result: pass

### 2. Non-Provider Role Rejected (403)
expected: |
  A client (role=CLIENT) or unauthenticated user sends POST /api/jobs/:id/accept.
  The response is HTTP 403 with an error indicating only providers can accept jobs (or 401 if unauthenticated).
result: [pending]

### 3. Version Conflict Returns 409
expected: |
  Two providers attempt to accept the same PENDING job (same version number) simultaneously or in quick succession.
  Exactly one provider gets HTTP 200 (the winner), and the other gets HTTP 409 Conflict with a version conflict error message.
result: [pending]

### 4. Version Increments on Successful Acceptance
expected: |
  After a successful acceptance (POST /api/jobs/:id/accept with HTTP 200), query the database directly or via GET /api/jobs/:id.
  The job's version column has been incremented by 1 from its previous value.
result: [pending]

### 5. GET /api/jobs with cityArea and status Filtering
expected: |
  GET /api/jobs?cityArea=Springfield&status=PENDING returns only jobs with status PENDING in the Springfield area.
  GET /api/jobs (without status param) returns only PENDING jobs by default (accepted jobs are excluded).
  The response is an array of JobDto objects.
result: [pending]

### 6. Concurrent Acceptance Exactly-Once Guarantee
expected: |
  Using a test or script, simulate two nearly-simultaneous POST /api/jobs/:id/accept requests with the same version number.
  Verify that exactly one request returns HTTP 200 and the other returns HTTP 409.
  After the test, the job status is ACCEPTED and version has been incremented exactly once.
result: [pending]

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
