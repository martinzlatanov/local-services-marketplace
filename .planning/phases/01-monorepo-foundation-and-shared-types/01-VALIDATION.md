---
phase: 1
slug: monorepo-foundation-and-shared-types
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-05
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler (`tsc`) — type-checking only for this phase |
| **Config file** | Per-workspace `tsconfig.json` |
| **Quick run command** | `npm run typecheck --workspaces --if-present` |
| **Full suite command** | `npm run typecheck --workspaces --if-present` (same — no runtime tests) |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck --workspaces --if-present`
- **After every plan wave:** Run `npm run typecheck --workspaces --if-present`
- **Before `/gsd-verify-work`:** Full suite must be green (zero errors)
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | — | — | N/A | type check | `npm run typecheck --workspaces --if-present` | ✅ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | TYPES-01, TYPES-03 | — | N/A | type check | `npm run typecheck --workspaces --if-present` | ✅ W0 | ⬜ pending |
| 1-03-01 | 03 | 2 | TYPES-02 | — | N/A | type check + grep | `npm run typecheck --workspaces --if-present` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/types/src/index.ts` — define all required exports (TYPES-01, TYPES-03)
- [ ] `packages/types/tsconfig.json` — extends ../../tsconfig.base.json, includes src/
- [ ] `apps/web/tsconfig.json` — extends ../../tsconfig.base.json, jsx: preserve override
- [ ] `apps/mobile/tsconfig.json` — extends ../../tsconfig.base.json
- [ ] Root `tsconfig.base.json` — strict: true, moduleResolution: bundler, module: preserve
- [ ] Each package/app: `"typecheck": "tsc --noEmit"` script in package.json

*(No test framework installation needed — this phase uses the TypeScript compiler only)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Expo Metro bundler resolves `@local/types` | TYPES-02 | Cannot run Metro in CI without device/emulator | Run `npm run start --workspace=apps/mobile`, confirm no "module not found" errors for @local/types imports |
| Single React version hoisted | Pitfall 3 | Requires npm ls inspection | Run `npm ls react` after install — verify single version listed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
