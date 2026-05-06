---
status: testing
phase: 02-backend-auth-api
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md]
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

### 2. Database Schema with Users Table
expected: Drizzle schema at apps/web/lib/db/schema.ts defines a users table with id (serial pk), email (varchar unique), password (varchar), role (Role enum), createdAt (timestamp). Migration 0000_initial_user.sql exists and creates the users table with unique email index.
result: pending

### 3. Auth Library Functions Work
expected: apps/web/lib/auth.ts exports hashPassword, verifyPassword, signJwt, verifyJwt, createUser, getUserByEmail. Functions use bcrypt for password hashing, jsonwebtoken for JWT operations. Modules are lazy-loaded to avoid Drizzle initialization errors.
result: pending

### 4. Register Endpoint Validates Input
expected: POST /api/auth/register with missing email or password returns 400 with ApiErrorResponse containing errors field-map (e.g., { email: "Email is required", password: "Password is required" }). Invalid JSON returns 400.
result: pending

### 5. Register Endpoint Creates User
expected: POST /api/auth/register with valid email and password creates a new user with CLIENT role (default), returns 201 with ApiSuccessResponse containing user (without password) and token. Duplicate email returns 409.
result: pending

### 6. Login Endpoint Validates Credentials
expected: POST /api/auth/login with invalid credentials returns 401. Missing credentials return 400 with field-map errors. Valid credentials return 200 with ApiSuccessResponse containing user and token, and sets httpOnly cookie named 'token'.
result: pending

### 7. Logout Endpoint Clears Cookie
expected: POST /api/auth/logout returns 200 and clears the 'token' cookie (httpOnly, sameSite: lax).
result: pending

### 8. Me Endpoint Returns Authenticated User
expected: GET /api/auth/me with valid JWT in cookie or Authorization Bearer header returns 200 with ApiSuccessResponse containing AuthUserDto (id, email, role, createdAt). Invalid/missing token returns 401.
result: pending

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps

<!-- YAML format for plan-phase --gaps consumption -->
