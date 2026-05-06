---
status: partial
phase: 04-backend-job-core-posting-state-machine
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md]
started: 2026-05-06T00:00:00Z
updated: 2026-05-06T13:40:00Z
---

## Current Test

[testing paused - DATABASE_URL required for API tests]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Clear ephemeral state. Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query returns live data.
result: pass

### 2. Job Category Enum and Categories List
expected: jobCategoryEnum defined in Drizzle schema with 8 values: PLUMBING, ELECTRICAL, CLEANING, GARDENING, MOVING, HANDYMAN, PAINTING, OTHER. JOB_CATEGORIES array exported from apps/web/lib/db/categories.ts with matching values.
result: pass

### 3. Jobs Table Schema Correct
expected: jobs table in schema.ts has: id (serial pk), status (jobStatusEnum default PENDING), version (integer default 1), category (jobCategoryEnum), description (text), timeframe (text), cityArea (text), clientId (integer FK to users), providerId (integer FK nullable), createdAt (timestamp default now), updatedAt (timestamp). Migration 0001_add_jobs.sql exists.
result: pass

### 4. POST /api/jobs Creates Job (Authenticated CLIENT)
expected: With valid JWT (CLIENT role), POST /api/jobs with { category: "PLUMBING", description: "Fix leak", timeframe: "ASAP", cityArea: "Sofia" } returns 200 with ApiSuccessResponse containing JobDto with status PENDING, version 1, and all fields.
result: blocked
blocked_by: third-party
reason: DATABASE_URL not configured

### 5. POST /api/jobs Rejects Non-CLIENT Role
expected: With valid JWT (PROVIDER role), POST /api/jobs returns 403 Forbidden (only CLIENT can create jobs).
result: blocked
blocked_by: third-party
reason: DATABASE_URL not configured

### 6. POST /api/jobs Validates Required Fields
expected: POST /api/jobs with missing fields (no category, no description, etc.) returns 400 with ApiErrorResponse containing field-map errors for each missing field.
result: blocked
blocked_by: third-party
reason: DATABASE_URL not configured (but should validate before DB - let me test)

### 7. POST /api/jobs Validates Category
expected: POST /api/jobs with invalid category (e.g., "INVALID_CATEGORY") returns 400 with ApiErrorResponse indicating invalid category. Valid categories are the 8 from JOB_CATEGORIES.
result: blocked
blocked_by: third-party
reason: DATABASE_URL not configured

### 8. PATCH /api/jobs/[id] Valid Transition PENDING to ACCEPTED
expected: With valid JWT (PROVIDER role), PATCH /api/jobs/{jobId} with { status: "ACCEPTED", version: 1 } returns 200 with updated JobDto (status ACCEPTED, version 2). Job must exist and be in PENDING status.
result: blocked
blocked_by: third-party
reason: DATABASE_URL not configured

### 9. PATCH /api/jobs/[id] Invalid Transition Rejected
expected: PATCH /api/jobs/{jobId} with invalid transition (e.g., PENDING→IN_PROGRESS) returns 409 Conflict with ApiErrorResponse indicating invalid state transition.
result: blocked
blocked_by: third-party
reason: DATABASE_URL not configured

### 10. PATCH /api/jobs/[id] Job Not Found
expected: PATCH /api/jobs/{nonExistentId} returns 404 Not Found.
result: blocked
blocked_by: third-party
reason: DATABASE_URL not configured

### 11. State Machine Transitions Complete Flow
expected: Full flow: Create job (PENDING, v1) → Accept (ACCEPTED, v2) → Start (IN_PROGRESS, v3) → Complete (COMPLETED, v4). Each PATCH with correct version succeeds. Invalid version (e.g., v1 on second transition) returns 409.
result: blocked
blocked_by: third-party
reason: DATABASE_URL not configured

## Summary

total: 11
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 8

## Gaps

<!-- YAML format for plan-phase --gaps consumption -->
- truth: "POST /api/jobs creates job with valid input"
  status: failed
  reason: "DATABASE_URL not configured"
  severity: blocker
  test: 4
  root_cause: "DATABASE_URL environment variable not set"
  artifacts: ["apps/web/lib/db/client.ts"]
  missing: ["Neon PostgreSQL database or local PostgreSQL instance"]
  debug_session: ""
