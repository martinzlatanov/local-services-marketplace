# Phase 03 Mobile Auth Testing Guide — Emulator/Device

## Prerequisites
- Expo dev server is running on localhost:8081 (command: `npx expo start` in apps/mobile/)
- iOS Simulator installed (macOS with Xcode) OR Android Emulator installed (Android Studio)
- Neon development database provisioned with test data

## Connection Methods

### Option A: iOS Simulator (macOS)
```bash
# From the Expo terminal, press 'i'
# Or run directly:
npx expo start --ios
```

### Option B: Android Emulator
```bash
# Start Android Emulator first, then:
npx expo start --android
```

### Option C: Physical Device with Expo Go
1. Install Expo Go app from App Store / Google Play
2. Scan the QR code from Expo terminal
3. App loads on your device

---

## Test Scenarios

### Test 9: Mobile Login Screen Works
**Expected:** User can log in and token is stored in SecureStore

**Steps:**
1. Open mobile app (app should show login screen by default)
2. Enter a registered provider email and password
3. Tap "Login" button
4. Expected result:
   - ✅ Token is stored in SecureStore (SecureStore.getItemAsync('auth_token'))
   - ✅ AuthContext updates with user state (email should be visible)
   - ✅ User is redirected to home screen
   - ✅ Home screen displays the logged-in user's email

**Verification:**
- Look for user email display on the home screen
- No error messages should appear
- App should not crash

**Result:** [awaiting execution]

---

### Test 10: Mobile Register Screen Works
**Expected:** User can register as a provider and token is stored

**Steps:**
1. From login screen, tap "Register" link
2. Enter new email, password, select "PROVIDER" role
3. Tap "Register" button
4. Expected result:
   - ✅ API request succeeds (returns 200-201)
   - ✅ Token stored in SecureStore
   - ✅ AuthContext populated with new user data
   - ✅ Redirected to home screen
   - ✅ Home screen shows new user's email

**Verification:**
- Registration completes without errors
- New user email is displayed on home screen
- No crashes or error states

**Result:** [awaiting execution]

---

### Test 11: Mobile Logout Works
**Expected:** User can log out, token is cleared, redirected to login

**Steps:**
1. On home screen, look for logout option (typically in settings/menu)
2. Tap "Logout" or similar button
3. Expected result:
   - ✅ SecureStore token is cleared
   - ✅ AuthContext is cleared
   - ✅ User is redirected to login screen
   - ✅ Login screen is displayed (not home screen)

**Verification:**
- Login screen appears after logout
- No token in SecureStore (cannot access protected routes)
- App is ready to log in again

**Result:** [awaiting execution]

---

### Test 12: Mobile Auth Guard Works
**Expected:** App enforces authentication routing

**Steps:**
1. Close the app completely
2. Clear the stored token (simulate cold start with no auth):
   ```bash
   # In Expo terminal or dev tools, you can inspect/clear SecureStore
   ```
3. Reopen app
4. Expected result:
   - ✅ App shows login screen (not home screen)
   - ✅ Cannot navigate to protected routes without logging in
5. Now log in:
   - Enter credentials, tap login
   - ✅ Token stored, AuthContext updated
   - ✅ Redirected to home screen
6. Try navigating around:
   - ✅ Can access home screen and tabs
   - ✅ All protected routes accessible

**Verification:**
- Auth guard prevents unauthenticated access to home
- After login, all routes work correctly
- Navigation flows logically

**Result:** [awaiting execution]

---

## Debugging Tips

### Check SecureStore Content
In your Expo terminal, add debugging code temporarily:
```typescript
// In contexts/AuthContext.tsx
import * as SecureStore from 'expo-secure-store'

// After login:
const token = await SecureStore.getItemAsync('auth_token')
console.log('Token stored:', token)
```

### Monitor Network Requests
Enable Expo DevTools:
- Shake device/simulator
- Select "Show DevTools"
- Network tab shows all API calls

### Common Issues

| Issue | Solution |
|-------|----------|
| App crashes on startup | Check AuthContext initialization, ensure SecureStore is imported |
| Login fails (401) | Verify credentials exist in dev database, check API URL in AuthContext |
| Token not persisting | Verify SecureStore.setItemAsync() is called after login |
| Can't reach Expo server | Ensure `npx expo start` running; check firewall/network settings |
| Emulator won't connect | Try `npx expo start --localhost`; restart emulator |

---

## Test Results Template

After completing each test, update the corresponding test number below:

### Test 9: Mobile Login Screen Works
- **Executed:** No  
- **Result:** [ ] PASS [ ] FAIL
- **Notes:** 

### Test 10: Mobile Register Screen Works
- **Executed:** No  
- **Result:** [ ] PASS [ ] FAIL
- **Notes:** 

### Test 11: Mobile Logout Works
- **Executed:** No  
- **Result:** [ ] PASS [ ] FAIL
- **Notes:** 

### Test 12: Mobile Auth Guard Works
- **Executed:** No  
- **Result:** [ ] PASS [ ] FAIL
- **Notes:** 

---

## Next Steps After Testing

1. Update `.planning/phases/03-auth-client-integration/03-UAT.md` with results
2. Update status from "blocked" to "pass" or "fail"
3. If any tests fail, file bugs and document in Phase 03 notes

---

_Created: 2026-05-10_  
_Expo Dev Server: localhost:8081_  
_Status: Ready for emulator testing_
