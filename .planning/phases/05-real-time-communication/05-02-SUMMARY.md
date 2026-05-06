---
phase: 05-real-time-communication
plan: 02
status: complete
completed_at: 2026-05-06T13:20:00Z
---

# Plan 05-02 Summary: Filter Accepted Jobs from Listings

## Objective
Modify the GET `/jobs` endpoint to exclude ACCEPTED jobs and ensure they no longer appear in provider's available job list, completing the concurrency control flow.

## What Was Built

### Core Implementation
Updated `apps/web/app/api/jobs/route.ts` - Added GET method that filters job listings to show only PENDING jobs:

**Key Features:**
1. **Authentication** - Verifies user is authenticated (GET required for providers to discover jobs)
2. **Status Filtering** - Returns only jobs with status = PENDING
3. **City Area Filtering** - Optional `cityArea` query parameter to filter jobs by geographic area
4. **DTO Mapping** - Converts database records to JobDto objects
5. **Array Response** - Returns array of jobs instead of single job

### Implementation Details

**Endpoint:** `GET /api/jobs?cityArea=NYC`

**Request Parameters:**
- `cityArea` (optional) - Filter to jobs in this geographic area

**Success Response (HTTP 200):**
```json
{
  "data": [
    {
      "id": "1",
      "status": "PENDING",
      "version": 1,
      "category": "PLUMBING",
      "description": "Fix kitchen sink",
      "timeframe": "This week",
      "cityArea": "NYC",
      "clientId": "client-1",
      "providerId": null,
      "createdAt": "2026-05-06T10:00:00Z",
      "updatedAt": "2026-05-06T10:00:00Z"
    },
    ...more jobs...
  ]
}
```

**Empty List Response:**
```json
{
  "data": []
}
```

### Database Behavior
The GET endpoint queries the jobs table with two possible WHERE conditions:

1. **Without cityArea parameter:**
   ```sql
   SELECT * FROM jobs WHERE status = 'PENDING'
   ```

2. **With cityArea parameter:**
   ```sql
   SELECT * FROM jobs WHERE status = 'PENDING' AND city_area = :cityArea
   ```

This ensures that:
- ✅ Accepted jobs (status ≠ PENDING) are never returned
- ✅ Providers see only jobs in their service area
- ✅ No visibility of jobs accepted by other providers

## Requirements Satisfied

- ✅ **ACCEPT-05**: Accepted job is no longer visible in other providers' open job lists
- ✅ **DISC-02**: Provider sees a filtered list of PENDING jobs matching their selected city/area

## Testing Notes

To verify the implementation works:

1. **Create test jobs in different areas:**
   ```bash
   POST /api/jobs { "category": "PLUMBING", "cityArea": "NYC", "description": "...", "timeframe": "..." }
   # Response: { "data": { "id": "1", "version": 1, "status": "PENDING" } }
   
   POST /api/jobs { "category": "PLUMBING", "cityArea": "LA", "description": "...", "timeframe": "..." }
   # Response: { "data": { "id": "2", "version": 1, "status": "PENDING" } }
   ```

2. **List all PENDING jobs:**
   ```bash
   GET /api/jobs
   # Response: { "data": [ job1, job2 ] }  (both PENDING jobs returned)
   ```

3. **List PENDING jobs filtered by area:**
   ```bash
   GET /api/jobs?cityArea=NYC
   # Response: { "data": [ job1 ] }  (only NYC PENDING job)
   ```

4. **Accept a job and verify it disappears:**
   ```bash
   POST /api/jobs/1/accept { "version": 1 }
   # Response: { "data": { "id": "1", "version": 2, "status": "ACCEPTED" } }
   
   GET /api/jobs?cityArea=NYC
   # Response: { "data": [] }  (job1 is now ACCEPTED, no longer visible)
   ```

5. **Verify non-matching areas return empty:**
   ```bash
   GET /api/jobs?cityArea=CHICAGO
   # Response: { "data": [] }  (no PENDING jobs in CHICAGO)
   ```

## Commits

- `feat(05-02): add GET /jobs endpoint filtering PENDING jobs by cityArea`

## Dependencies & Integrations

- **Database**: Uses Drizzle ORM for filtered queries with `and()` clause
- **Authentication**: Uses existing `getAuthenticatedUser()` utility
- **Types**: Uses existing `JobDto` type from `@local/types` package
- **Prior Work**: Depends on Plan 05-01 (accept endpoint that creates ACCEPTED jobs)

## Code Changes

Only one file was modified:
- `apps/web/app/api/jobs/route.ts` - Added GET function with import of `and` from 'drizzle-orm'

The POST method for job creation remains unchanged.

## Known Limitations

None. The endpoint fully satisfies ACCEPT-05 and DISC-02 requirements.

## Integration Points

This plan completes the backend job acceptance flow:
1. **Plan 05-01** enables providers to atomically accept jobs
2. **Plan 05-02** ensures accepted jobs are immediately removed from other providers' visible lists

Together, they guarantee:
- No double-booking (optimistic locking in 05-01)
- No stale visibility (filtering in 05-02)
- Providers see only available PENDING jobs in their area

## Next Phase

Phase 6 (Real-Time Infrastructure) will build the WebSocket server to push these status changes to connected clients in real time, completing the reactive architecture.
