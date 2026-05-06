---
status: testing
phase: 02-backend-auth-api
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md]
started: 2026-05-06T00:00:00Z
updated: 2026-05-06T15:10:00Z
---

## Current Test

number: 5
name: Register Endpoint Creates User
expected: |
  POST /api/auth/register with valid email and password creates a new user
  with CLIENT role (default), returns 201 with ApiSuccessResponse containing
  user (without password) and token. Duplicate email returns 409.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Clear ephemeral state. Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query returns live data.
result: pass

### 2. Database Schema with Users Table
expected: Drizzle schema at apps/web/lib/db/schema.ts defines a users table with id (serial pk), email (varchar unique), password (varchar), role (Role enum), createdAt (timestamp). Migration 0000_initial_user.sql exists and creates the users table with unique email index.
result: pass

### 3. Auth Library Functions Work
expected: apps/web/lib/auth.ts exports hashPassword, verifyPassword, signJwt, verifyJwt, createUser, getUserByEmail. Functions use bcrypt for password hashing, jsonwebtoken for JWT operations. Modules are lazy-loaded to avoid Drizzle initialization errors.
result: pass

### 4. Register Endpoint Validates Input
expected: POST /api/auth/register with missing email or password returns 400 with ApiErrorResponse containing errors field-map (e.g., { email: "required", password: "required" }). Invalid JSON returns 400.
result: pass

### 5. Register Endpoint Creates User
expected: POST /api/auth/register with valid email and password creates a new user with CLIENT role (default), returns 201 with ApiSuccessResponse containing user (without password) and token. Duplicate email returns 409.
result: pass
reported: "POST /api/auth/register with valid credentials returns 201 with user and token"

### 6. Login Endpoint Validates Credentials
expected: POST /api/auth/login with invalid credentials returns 401. Missing credentials return 400 with field-map errors. Valid credentials return 200 with ApiSuccessResponse containing user and token, and sets httpOnly cookie named 'token'.
result: pass
reported: "POST /api/auth/login with valid credentials returns 200 with user and token"

### 7. Logout Endpoint Clears Cookie
expected: POST /api/auth/logout returns 200 and clears the 'token' cookie (httpOnly, sameSite: lax).
result: pass

### 8. Me Endpoint Returns Authenticated User
expected: GET /api/auth/me with valid JWT in cookie or Authorization Bearer header returns 200 with ApiSuccessResponse containing AuthUserDto (id, email, role, createdAt). Invalid/missing token returns 401.
result: pass
reported: "GET /api/auth/me with valid token returns 200 with user data"

## Summary

total: 8
passed: 8
issues: 0
pending: 0
blocked: 0

## Gaps

<!-- YAML format for plan-phase --gaps consumption -->
