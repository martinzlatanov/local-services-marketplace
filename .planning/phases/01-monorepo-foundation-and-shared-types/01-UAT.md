---
status: testing
phase: 01-monorepo-foundation-and-shared-types
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md]
started: 2026-05-06T00:00:00Z
updated: 2026-05-06T00:00:00Z
---

## Current Test

number: 1
name: Cold Start Smoke Test
expected: |
  Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files).
  Start the application from scratch. Server boots without errors, any seed/migration completes,
  and a primary query (health check, homepage load, or basic API call) returns live data.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Clear ephemeral state. Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query returns live data.
result: pending

### 2. Shared Types Package Exists
expected: The @local/types package exists at packages/types with package.json, tsconfig.json, and src/index.ts exporting JobStatus, Role, JobDto, ApiSuccessResponse, ApiErrorResponse, CreateJobRequest, AcceptJobRequest, UpdateJobStatusRequest.
result: pending

### 3. TypeScript Typecheck Passes for All Workspaces
expected: Running `npm run typecheck --workspace=packages/types`, `npm run typecheck --workspace=apps/web`, and `npm run typecheck --workspace=apps/mobile` all exit with code 0. No type errors.
result: pending

### 4. Next.js Web App Scaffolded with @local/types Resolution
expected: apps/web is a Next.js 16 App Router workspace. It imports JobStatus from @local/types in page.tsx. The app boots and renders without errors. next.config.ts contains transpilePackages: ['@local/types'].
result: pending

### 5. Expo Mobile App Scaffolded with @local/types Resolution
expected: apps/mobile is an Expo SDK 55 workspace. It imports JobStatus from @local/types in App.tsx. The app can be started with Expo and loads without type errors. No metro.config.js needed (SDK 55 built-in monorepo support).
result: pending

### 6. JobStatus Enum Has Correct Values
expected: JobStatus enum has 4 string-valued members: PENDING, ACCEPTED, IN_PROGRESS, COMPLETED. These are regular enums (not const enum) to avoid Metro inlining issues.
result: pending

### 7. Role Enum Has Correct Values
expected: Role enum has 2 string-valued members: CLIENT, PROVIDER. These are regular enums (not const enum).
result: pending

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps

<!-- YAML format for plan-phase --gaps consumption -->
