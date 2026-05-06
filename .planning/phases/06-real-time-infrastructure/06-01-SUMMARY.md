---
phase: 06-real-time-infrastructure
plan: 01
type: execute
completed: 2026-05-06
tasks_completed: 3
deviations: []
decisions: []
---

# Summary: Phase 06 - Plan 01

## Objective
Add WebSocket server to `apps/web` (ws or socket.io); implement connection auth (JWT on handshake); define WebSocket event types in `packages/types`.

## Tasks Completed

### Task 1: Define WebSocket event types
- Added `WsEvent` type to `packages/types/src/index.ts`
- Defined `JOB_UPDATED` event type with payload containing updated job data
- Exported the types

### Task 2: Implement WebSocket server
- Created `apps/web/lib/ws/server.ts`
- Implemented WebSocket server using `ws` library
- Implemented connection authentication using JWT from handshake request
- Used `verifyJwt` from `apps/web/lib/auth.ts` to authenticate connection
- Stored authenticated connections with user ID for targeted broadcasting
- Exported `initWsServer` and `broadcastToUser` functions

### Task 3: Integrate WebSocket server with Next.js
- Created custom Next.js server in `apps/web/server.js`
- Imported `initWsServer` from `apps/web/lib/ws/server.ts`
- Listened for `upgrade` event on HTTP server and passed to WebSocket server
- Updated `apps/web/package.json` scripts to use `node server.js`
- Installed `ws` and `@types/ws` as dependencies

## Files Created/Modified
- `packages/types/src/index.ts` (modified)
- `apps/web/lib/ws/server.ts` (created)
- `apps/web/server.js` (created)
- `apps/web/package.json` (modified)

## Verification Results
- `npm run typecheck` passes
- `grep -c "export type WsEvent" packages/types/src/index.ts` returns > 0
- `grep -c "export function initWsServer" apps/web/lib/ws/server.ts` returns > 0
- `grep -c "server.on('upgrade'" apps/web/server.js` returns > 0

## Self-Check: PASSED
All acceptance criteria met. All verification commands passed.
