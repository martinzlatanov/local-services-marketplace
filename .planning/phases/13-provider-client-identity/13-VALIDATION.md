---
phase: 13
slug: provider-client-identity
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-14
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (detected: `apps/web/components/dashboard/__tests__/`) |
| **Config file** | `apps/web/jest.config.*` (check at `apps/web/` root) |
| **Quick run command** | `cd apps/web && npx jest --testPathPattern="(users|JobDetailCard)" --passWithNoTests` |
| **Full suite command** | `cd apps/web && npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/web && npx jest --testPathPattern="(users|JobDetailCard)" --passWithNoTests`
- **After every plan wave:** Run `cd apps/web && npx jest`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| Schema migration | DB | 1 | IDENTITY-05 | — | nullable columns, no backfill | manual | n/a — DB inspection | ❌ W0 | ⬜ pending |
| PublicUserDto type | types | 1 | IDENTITY-04 | — | no passwordHash in DTO | unit | `cd apps/web && npx jest --testPathPattern=api/users --passWithNoTests` | ❌ W0 | ⬜ pending |
| GET /api/users/[id] happy path | api | 1 | IDENTITY-04 | — | returns PublicUserDto, no passwordHash | unit | `cd apps/web && npx jest --testPathPattern=api/users` | ❌ W0 | ⬜ pending |
| GET /api/users/[id] 401 unauthenticated | api | 1 | IDENTITY-04 | — | rejects requests without token | unit | same | ❌ W0 | ⬜ pending |
| GET /api/users/[id] 404 unknown id | api | 1 | IDENTITY-04 | — | 404 for nonexistent user | unit | same | ❌ W0 | ⬜ pending |
| Web inline identity (providerId set) | web | 2 | IDENTITY-01 | — | shows avatar + email + name + link | component | `cd apps/web && npx jest --testPathPattern=JobDetailCard` | ❌ W0 | ⬜ pending |
| Web inline identity (providerId null) | web | 2 | IDENTITY-01 | — | section not rendered | component | same | ❌ W0 | ⬜ pending |
| Provider profile page (loaded) | web | 2 | IDENTITY-03 | — | avatar, email, name, member-since, rating, reviews | component | `cd apps/web && npx jest --testPathPattern=providers` | ❌ W0 | ⬜ pending |
| Provider profile page (empty reviews) | web | 2 | IDENTITY-03 | — | "No reviews yet." shown | component | same | ❌ W0 | ⬜ pending |
| Mobile inline identity | mobile | 2 | IDENTITY-02 | — | client email/name shown after job loads | manual | n/a — requires device/emulator | manual-only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/app/api/users/[id]/__tests__/route.test.ts` — stubs for IDENTITY-04 (happy path, 401, 404, no passwordHash)
- [ ] `apps/web/components/dashboard/__tests__/JobDetailCard.identity.test.tsx` — stubs for IDENTITY-01 (providerId set vs null)
- [ ] `apps/web/app/providers/__tests__/ProviderProfile.test.tsx` — stubs for IDENTITY-03 (loaded state, empty reviews)

*Existing Jest infrastructure detected — no new framework installation required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `users` table has `name` VARCHAR(100) and `avatar_url` TEXT columns after migration | IDENTITY-05 | Schema migration requires live DB inspection | Run `npx drizzle-kit push`, then `psql $DATABASE_URL -c "\d users"` and verify both columns present and nullable |
| Mobile job detail shows client email/name | IDENTITY-02 | Requires Expo emulator or physical device | Run `cd apps/mobile && npx expo start`, open a job as a provider, verify client identity section renders |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
