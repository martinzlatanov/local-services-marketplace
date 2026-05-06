---
phase: 05-real-time-communication
plan: 01
status: complete
completed_at: 2026-05-06T13:15:00Z
---

# Plan 05-01 Summary: Job Acceptance with Optimistic Locking

## Objective
Implement the POST `/jobs/:id/accept` endpoint with optimistic locking to ensure atomic job acceptance and prevent double-booking.

## What Was Built

### Core Implementation
Created `apps/web/app/api/jobs/[id]/accept/route.ts` - A new POST endpoint that handles job acceptance with version-based concurrency control:

**Key Features:**
1. **Authentication & Authorization** - Verifies user is authenticated and has PROVIDER role
2. **Version-Based Optimistic Locking** - Matches the client's submitted version against the database version
3. **Atomic Update** - Uses a single SQL UPDATE with a WHERE clause on both job ID AND version to ensure atomicity
4. **Concurrency Handling** - Returns HTTP 409 (Conflict) when version mismatch occurs (concurrent acceptance)
5. **Status Transition** - Transitions job from PENDING to ACCEPTED on successful acceptance
6. **Provider Assignment** - Assigns the accepting provider's ID to the job's providerId field
7. **Response DTO** - Returns the updated JobDto with incremented version on successful acceptance

### Implementation Details

**Endpoint:** `POST /jobs/:id/accept`

**Request Body:**
```json
{
  "version": 1  // Client-provided current version of the job
}
```

**Success Response (HTTP 200):**
```json
{
  "data": {
    "id": "123",
    "status": "ACCEPTED",
    "version": 2,
    "providerId": "provider-user-id",
    ...other job fields...
  }
}
```

**Conflict Response (HTTP 409):**
```json
{
  "errors": {
    "version": "conflict_job_already_accepted"
  }
}
```

**Error Responses:**
- HTTP 401 - Unauthorized (no authentication token)
- HTTP 403 - Forbidden (user is not a PROVIDER)
- HTTP 404 - Job not found
- HTTP 409 - Job not PENDING or version conflict

### Database Behavior
The update uses Drizzle ORM with a WHERE condition that matches both:
- `jobs.id = :jobId`
- `jobs.version = :clientProvidedVersion`

If no rows are updated (version mismatch), the endpoint returns HTTP 409. This is the core mechanism for atomic job locking - exactly one provider wins the race condition.

## Requirements Satisfied

- ✅ **ACCEPT-01**: Provider can accept a PENDING job
- ✅ **ACCEPT-02**: Acceptance request includes the job's current version value
- ✅ **ACCEPT-03**: Backend atomically increments version and returns HTTP 200 with updated job

## Testing Notes

To verify the implementation works:

1. **Create a test job:**
   ```bash
   POST /api/jobs
   { "category": "PLUMBING", "description": "...", "timeframe": "...", "cityArea": "NYC" }
   # Response: { "data": { "id": "1", "version": 1, "status": "PENDING" } }
   ```

2. **Test successful acceptance:**
   ```bash
   POST /api/jobs/1/accept
   { "version": 1 }
   # Response: { "data": { "id": "1", "version": 2, "status": "ACCEPTED", "providerId": "provider-1" } }
   ```

3. **Test concurrent acceptance (409 conflict):**
   ```bash
   # Two concurrent requests with same version
   POST /api/jobs/1/accept  { "version": 1 }  # Provider A
   POST /api/jobs/1/accept  { "version": 1 }  # Provider B (simultaneously)
   # Provider A gets HTTP 200
   # Provider B gets HTTP 409 Conflict
   ```

4. **Test stale version rejection:**
   ```bash
   POST /api/jobs/1/accept
   { "version": 1 }  # Client has stale version (current is 2)
   # Response: HTTP 409 Conflict
   ```

## Commits

- `feat(05-01): implement job acceptance endpoint with optimistic locking`

## Dependencies & Integrations

- **Database**: Uses PostgreSQL with Drizzle ORM for atomic updates
- **Authentication**: Uses existing `getAuthenticatedUser()` utility
- **Types**: Uses existing `AcceptJobRequest` and `JobDto` types from `@local/types` package
- **Job Schema**: Requires `version` field in jobs table (already exists)

## Known Limitations

None. The endpoint is fully functional and meets all ACCEPT-01, ACCEPT-02, ACCEPT-03 requirements.

## Next Steps

Plan 05-02 implements filtering to ensure accepted jobs are no longer visible in provider job listings.
