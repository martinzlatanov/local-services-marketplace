# End-to-End Test Checklist — Production

## Prerequisites
- [ ] Web app deployed to Vercel (https://your-app.vercel.app)
- [ ] Neon production database provisioned and migrated
- [ ] Mobile app configured with production API URL
- [ ] Two user accounts ready (one client, one provider)

## Test Scenario: Full Job Lifecycle

### Phase 1: Client Registers and Posts Job
- [ ] Open production web app in browser
- [ ] Click "Register" and create client account
- [ ] Verify redirect to dashboard after registration
- [ ] Click "Post a Job"
- [ ] Fill form: Category (e.g., "Plumbing"), Description, Timeframe, City/Area
- [ ] Submit job
- [ ] Verify job appears on dashboard with status "PENDING"
- [ ] Note the job ID for later verification

### Phase 2: Provider Registers and Accepts Job
- [ ] Open mobile app (Expo dev or production build)
- [ ] Register as provider (select service area matching job's city/area)
- [ ] Verify "Feed" tab shows the posted job
- [ ] Tap job to view details
- [ ] Tap "Accept job"
- [ ] Verify job disappears from Feed
- [ ] Navigate to "Active Jobs" tab
- [ ] Verify job appears with status "ACCEPTED"

### Phase 3: Provider Starts Work
- [ ] In "Active Jobs" tab, tap the accepted job
- [ ] Verify detail screen shows "Start Work" button
- [ ] Tap "Start Work"
- [ ] Verify button changes to "Finish Work"
- [ ] Verify job status now shows "IN_PROGRESS"

### Phase 4: Provider Completes Work
- [ ] Tap "Finish Work"
- [ ] Verify job disappears from "Active Jobs" tab (or status changes to COMPLETED)
- [ ] Verify no errors or crashes

### Phase 5: Verify Real-Time Updates
- [ ] Open web dashboard in browser (client account)
- [ ] Keep dashboard open during Phase 2-4
- [ ] Verify job status updates in real-time:
  - [ ] Status changes from PENDING → ACCEPTED (when provider accepts)
  - [ ] Status changes from ACCEPTED → IN_PROGRESS (when provider starts)
  - [ ] Status changes from IN_PROGRESS → COMPLETED (when provider finishes)
- [ ] Verify no page refresh needed for updates

## Success Criteria
- [ ] All steps completed without errors
- [ ] Real-time updates working on web dashboard
- [ ] Job lifecycle fully functional in production
