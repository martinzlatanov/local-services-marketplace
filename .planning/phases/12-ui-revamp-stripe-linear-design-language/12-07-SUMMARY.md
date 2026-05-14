---
phase: 12
plan: "07"
subsystem: mobile-ui
tags: [mobile, active-jobs, settings, progress-track, modal, react-native]
dependency_graph:
  requires: []
  provides: [active-jobs-progress-track, settings-modal-bottom-sheet]
  affects: [apps/mobile/app/(app)/(tabs)/active-jobs.tsx, apps/mobile/app/(app)/(tabs)/settings.tsx]
tech_stack:
  added: []
  patterns: [ProgressTrack step indicator, RN Modal bottom sheet]
key_files:
  created: []
  modified:
    - apps/mobile/app/(app)/(tabs)/active-jobs.tsx
    - apps/mobile/app/(app)/(tabs)/settings.tsx
decisions:
  - Used React Native Modal (transparent + animationType slide) instead of react-native-paper Portal/Dialog for settings area picker to avoid Paper overlay z-index issues and enable native bottom-sheet feel
  - ProgressTrack placed above main component to avoid re-definition on each render
metrics:
  duration: ~5 minutes
  completed_date: "2026-05-14"
---

# Phase 12 Plan 07: Active Jobs ProgressTrack + Settings Modal Bottom Sheet Summary

Rebuilt active-jobs.tsx with a ProgressTrack step indicator, outlined cards, and status-based action buttons; replaced Dialog+RadioButton in settings.tsx with a native Modal bottom sheet.

## Tasks Completed

### T1 — active-jobs.tsx
- Defined `ProgressTrack` component above `ActiveJobsScreen` with STEPS/STEP_INDEX constants and `ptStyles`
- Changed `Card mode="elevated"` to `mode="outlined"` for all job cards
- Added status-based action buttons: "Start job →" (ACCEPTED), "Mark complete →" (IN_PROGRESS), "Details" (all other statuses)
- Added `activeStyles` StyleSheet with `btnPrimary` and `btnSecondary`
- Preserved all existing logic: fetchJobs, refreshControl, isLoading/isRefreshing, router.push navigation

**Commit:** f3dc9c1

### T2 — settings.tsx
- Removed Dialog, Portal, RadioButton, RadioButton.Group imports and all related JSX
- Added Modal, ScrollView, TouchableOpacity, Pressable imports from react-native
- Replaced dialog with a transparent slide-up Modal bottom sheet featuring a handle bar, area list with active highlighting, Cancel and Update buttons
- Added `areaModalVisible` (boolean) and `tempArea` (string) state
- Updated List.Item onPress to call `setAreaModalVisible(true)`
- Preserved: serviceArea, saveServiceArea, logout, isSaving, Appbar header, List sections

**Commit:** ef7b264

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None - no new network endpoints or auth paths introduced.

## Self-Check: PASSED

- apps/mobile/app/(app)/(tabs)/active-jobs.tsx: contains ProgressTrack, dotDone, mode="outlined" — VERIFIED
- apps/mobile/app/(app)/(tabs)/settings.tsx: no Dialog, no RadioButton, contains Modal, contains saveServiceArea — VERIFIED
- Commits f3dc9c1 and ef7b264 exist in git log — VERIFIED
