---
status: testing
phase: 03-auth-client-integration
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, 03-05-SUMMARY.md]
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

### 2. Web Login Page Renders
expected: Visit http://localhost:3001/login. Page shows email and password input fields, submit button. Tailwind CSS is applied (styled form). No JavaScript errors in console.
result: pending

### 3. Web Login Flow Works
expected: Enter valid registered email and password at /login. Submit. AuthContext updates with user state. Browser cookie 'token' is set (httpOnly). Redirected to /dashboard. Dashboard shows user email greeting.
result: pending

### 4. Web Register Page Renders
expected: Visit http://localhost:3001/register. Page shows email, password, and role select dropdown (CLIENT/PROVIDER). Submit button present. Tailwind CSS applied.
result: pending

### 5. Web Register Flow Works
expected: Enter new email, password, select role at /register. Submit. API returns success. AuthContext populates. Redirected to /dashboard. Dashboard shows new user email.
result: pending

### 6. Web Logout Works
expected: On /dashboard, click logout. AuthContext clears. Browser cookie 'token' is cleared. Redirected to /login.
result: pending

### 7. Middleware Guards Protected Routes
expected: Without valid token cookie, visiting /dashboard redirects to /login. With valid token, visiting /login or /register redirects to /dashboard.
result: pending

### 8. Mobile App Boots with Expo Router
expected: Run `npx expo start` in apps/mobile. Expo Router loads. Stack navigator renders (with headerShown: false). No Metro errors. React Native Paper theme applied.
result: pending

### 9. Mobile Login Screen Works
expected: In Expo app, navigate to login screen. Enter valid credentials. Submit. Token stored in SecureStore via AuthContext. Redirected to home screen showing user email.
result: pending

### 10. Mobile Register Screen Works
expected: In Expo app, navigate to register screen. Enter email, password. Submit. Token stored in SecureStore. Redirected to home screen. AuthContext has user state.
result: pending

### 11. Mobile Logout Works
expected: On mobile home screen, click logout. SecureStore token cleared. AuthContext cleared. Redirected to login screen.
result: pending

### 12. Mobile Auth Guard Works
expected: With no token in SecureStore, opening the app redirects to /(auth)/login. After login, app shows home screen. Expo Router navigation guard works.
result: pending

## Summary

total: 12
passed: 0
issues: 0
pending: 12
skipped: 0
blocked: 0

## Gaps

<!-- YAML format for plan-phase --gaps consumption -->
