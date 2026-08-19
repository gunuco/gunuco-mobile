# EAS Native Testing Readiness

> Step 25. Phases 1–12 remain complete. This is **not** Phase 13.
> No Android/iOS/Razorpay/FCM/APNs/deep-link device tests were run. Those remain **NOT TESTED**.
> Status values: **READY** | **BLOCKED** | **CONFIRM** | **NOT TESTED**.

Date: 15 Aug 2026.

---

## 1. Overall Status

**READY WITH CONDITIONS**

The app can be prepared for EAS **development** and **preview** builds. Identifiers, scheme, SDK, and native modules are present. Production store submission is **not** started.

Cannot claim **READY FOR DEVELOPMENT BUILD** until:

- Expo/EAS account is logged in and the project is linked
- `EXPO_PUBLIC_API_BASE_URL` for a **device-reachable HTTPS** API is set (development profile currently uses `api.dev.gunuco.local`)

Cannot claim **READY FOR PREVIEW BUILD** until the same EAS link exists, plus staging API / test Razorpay / Maps keys in EAS Environment.

**BLOCKED** for FCM, APNs, production signing, and store submit until the manual setup list is done.

---

## 2. Expo Configuration

| Field | Effective value | Source |
|---|---|---|
| name | GUNUCO | `app.json` |
| slug | gunuco-mobile | `app.json` |
| version | 0.1.0 | `app.json` (not incremented) |
| sdkVersion | 57.0.0 | Expo |
| orientation | portrait | `app.json` |
| icon | `./assets/images/icon.png` | `app.json` |
| scheme | `gunuco` | `app.json` |
| userInterfaceStyle | automatic | `app.json` |
| newArchEnabled | **true** | `app.json` |
| splash | plugin: splash-icon, `#F7F3EE` | `app.json` plugins |
| experiments.typedRoutes | true | `app.json` |
| extra.eas.projectId | `d2281969-bca1-42de-b2b5-20ae43b0902b` | `app.json` extra.eas (written after `eas init` could not patch `app.config.js`) |
| owner | `gunuco` | Matches `@gunuco/gunuco-mobile` |
| runtimeVersion / updates | **not configured** | No EAS Update in this step |
| platforms | ios, android, web | Expo default |

`app.config.js` spreads `app.json.expo` and adds:

- iOS `LSApplicationQueriesSchemes`: tez, phonepe, paytmmp (Razorpay UPI apps)
- `expo-image-picker` (photos only; camera/microphone false)
- `expo-notifications` (icon, brand color, default channel)
- `react-native-maps` keys from `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

Expo Doctor’s “app.config.js is not using app.json” warning is a **false positive**. Do not delete `app.json`.

Command used: `npx expo config --type public`.

---

## 3. Android

| Item | Value | Status |
|---|---|---|
| package | `com.gunuco.customer` | READY — do not change |
| version | 0.1.0 | READY |
| versionCode | EAS `cli.appVersionSource: remote` + production `autoIncrement` | READY (managed by EAS after link) |
| buildType development/preview | APK | READY (config) |
| buildType production | AAB | READY (config only — do not run) |
| google-services.json | absent | FCM NOT READY |
| cleartext | not enabled | READY |
| keystore | not in repo (`.jks` gitignored) | Needs EAS credentials |

Android compile: **NOT TESTED**.

---

## 4. iOS

| Item | Value | Status |
|---|---|---|
| bundleIdentifier | `com.gunuco.customer` | READY — do not change |
| version | 0.1.0 | READY |
| buildNumber | EAS remote + production autoIncrement | READY (after Apple/EAS credentials) |
| supportsTablet | true | as-is |
| UPI query schemes | tez, phonepe, paytmmp | READY (config) |
| Push entitlement | via `expo-notifications` plugin | CONFIRM until credentials exist |
| GoogleService-Info.plist | absent | APNs uses Apple keys, not this file |
| Apple Developer / dist certs | not in repo | NOT CONFIGURED |

iOS compile: **NOT TESTED**. This Windows environment cannot produce a local iOS binary.

---

## 5. Razorpay

| Check | Status |
|---|---|
| Package | `react-native-razorpay` ^3.0.0 — native, not web |
| Public key only | READY (code). Value: **NOT CONFIGURED** in templates |
| Secret in repo | none found |
| Duplicate Pay tap | code disables while `busy` |
| Backend confirm authoritative | code — device **NOT TESTED** |
| New Architecture | `newArchEnabled: true`; doctor: unsupported. **Native compatibility unverified.** |
| Expo Go | cannot open Razorpay (app already messages this) |

**Recommendation:** leave New Architecture and Razorpay versions unchanged. First native build is the compatibility test.

Do not use production Razorpay credentials on the preview profile unless that is an explicit choice. Use a **test** key id in EAS Environment for development/preview.

---

## 6. FCM

| Check | Status |
|---|---|
| Implementation | `getDevicePushTokenAsync` → `POST /devices/push-token` | READY (code) |
| Permission | Contextual (Order Confirmation + Inbox), not first launch | READY (code) |
| google-services.json | missing | **FCM NOT READY** |
| EAS FCM V1 service account | not configured | **FCM NOT READY** |
| Device | | **NOT TESTED** |

Do not add a second notification system.

---

## 7. APNs

| Check | Status |
|---|---|
| Plugin | `expo-notifications` | READY (config) |
| Apple Push key / EAS iOS credentials | | **NOT CONFIGURED** |
| Device | | **NOT TESTED** |

---

## 8. Deep Links

| Item | Value |
|---|---|
| Scheme | `gunuco://` |
| Router | Expo Router typed routes |
| Push payload | IDs only (`orderId`, `ticketId`, `orderItemId`) |
| Unknown payload | stay in inbox (no navigation) |
| Logged-out | auth intent `returnTo` then destination |

Device tests: **NOT TESTED**. Plan in this document § deep-link tests.

---

## 9. Environment Variables

All `EXPO_PUBLIC_*` values are **visible in the client**. Never put secrets there.

| Name | Purpose | Required | Development | Preview | Production | Sensitive? | Safe for frontend? |
|---|---|---|---|---|---|---|---|
| `EXPO_PUBLIC_APP_ENV` | `development` / `staging` / `production` | Recommended | development | staging | production | No | Yes |
| `EXPO_PUBLIC_API_BASE_URL` | API origin (HTTPS in staging/prod) | Yes | `.local` host — **not phone-reachable** | `https://api.staging.gunuco.com` | `https://api.gunuco.com` | No | Yes |
| `EXPO_PUBLIC_ENABLE_LOGGING` | Reserved flag | No | true | true | false | No | Yes |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps SDK public key | Yes for maps | **NOT CONFIGURED** | **NOT CONFIGURED** | **NOT CONFIGURED** | No (restrict by package/bundle) | Yes |
| `EXPO_PUBLIC_RAZORPAY_KEY_ID` | Razorpay **public** key | Yes for payment | **NOT CONFIGURED** | **NOT CONFIGURED** | **NOT CONFIGURED** | No | Yes — **never** the key secret |

No localhost / 127.0.0.1 / 192.168.x.x in production config.

Secret scan of source + config: **no backend secrets found**. Proceed.

---

## 10. Credentials

| Credential | Status |
|---|---|
| Expo/EAS login | Needs developer action |
| EAS `projectId` | `d2281969-bca1-42de-b2b5-20ae43b0902b` (`@gunuco/gunuco-mobile`) |
| Android keystore | Needs EAS setup |
| iOS distribution / push | **NOT CONFIGURED** |
| Firebase / FCM V1 | **NOT CONFIGURED** |
| Maps key | **NOT CONFIGURED** |
| Razorpay public key | **NOT CONFIGURED** |

Do not print secrets.

---

## 11. Native Dependencies

| Package | Version | Native? | Android | iOS | New Architecture | EAS impact | Action |
|---|---|---|---|---|---|---|---|
| expo | ~57.0.12 | Yes | Yes | Yes | Supported | SDK 57 | Keep (patch drift vs ~57.0.13 — document only) |
| react-native | 0.86.2 | Yes | Yes | Yes | Enabled | Core | Keep |
| react | 19.2.3 | No | — | — | — | — | Keep |
| expo-router | ~57.0.12 | Yes | Yes | Yes | Supported | Deep links | Keep |
| expo-dev-client | ~57.0.12 | Yes | Yes | Yes | Supported | Required for development profile | Added this step |
| expo-notifications | ~57.0.11 | Yes | Yes | Yes | Supported | FCM/APNs | Keep; needs credentials |
| expo-secure-store | ~57.0.1 | Yes | Yes | Yes | Supported | Tokens | Keep |
| expo-constants | ~57.0.10 | Yes | Yes | Yes | Supported | Version | Keep |
| expo-web-browser | ~57.0.2 | Yes | Yes | Yes | Supported | Legal/invoice | Keep |
| expo-image | ~57.0.2 | Yes | Yes | Yes | Supported | Patch drift vs ~57.0.3 | Keep |
| expo-image-picker | ~57.0.10 | Yes | Yes | Yes | Supported | Photos | Keep |
| expo-linking | ~57.0.5 | Yes | Yes | Yes | Supported | Patch drift vs ~57.0.6 | Keep |
| expo-crypto | ~57.0.1 | Yes | Yes | Yes | Supported | Idempotency UUIDs | Keep |
| expo-splash-screen | ~57.0.6 | Yes | Yes | Yes | Supported | Bootstrap | Keep |
| @shopify/flash-list | 2.0.2 | Yes | Yes | Yes | Supported | Lists | Keep |
| react-native-razorpay | ^3.0.0 | Yes | Yes | Yes | **Doctor: unsupported** | **Build risk** | Keep; verify on first native build |
| react-native-maps | 1.27.2 | Yes | Yes | Yes | npm audit High (transitive) | Maps key required | Keep |
| react-native-reanimated | 4.5.1 | Yes | Yes | Yes | Supported | Babel plugin last | Keep |
| react-native-gesture-handler | ~2.32.0 | Yes | Yes | Yes | Supported | Navigation | Keep |
| react-native-screens | ~4.26.0 | Yes | Yes | Yes | Supported | Navigation | Keep |
| react-native-safe-area-context | ~5.7.0 | Yes | Yes | Yes | Supported | Safe areas | Keep |
| react-native-worklets | 0.10.1 | Yes | Yes | Yes | Supported | Reanimated | Keep |
| @reduxjs/toolkit | ^2.12.0 | No | — | — | — | JS only | Keep |

No major upgrades. No Razorpay/Expo major bump.

---

## 12. EAS Profiles

`eas.json` created this step. Minimal three profiles:

| Profile | Client | Distribution | Android | Env |
|---|---|---|---|---|
| development | developmentClient | internal | APK | development + `.local` API |
| preview | standalone | internal | APK | staging API |
| production | standalone | store (default) | AAB | production API |

iOS preview uses internal (ad hoc) distribution and needs Apple credentials + device registration, **or** use TestFlight via the production profile later.

`cli.appVersionSource` is `remote` so Android `versionCode` / iOS `buildNumber` are not duplicated in `app.json`.

---

## 13. Build Commands

Do **not** run production until explicitly requested. Prerequisites: Expo login (already done) and EAS Environment keys.

### Windows (PowerShell)

```powershell
npm run typecheck
npm run lint
npx expo start --dev-client
```

### EAS (after login + init)

```powershell
npx eas-cli login
npx eas-cli init
npx eas-cli build --profile development --platform android
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile preview --platform ios
```

Production (do not run now):

```powershell
npx eas-cli build --profile production --platform android
npx eas-cli build --profile production --platform ios
```

Development Android: EAS development APK + Metro (`npx expo start --dev-client`).  
Preview Android: installable APK, no Metro.  
Production Android: AAB.  
iOS all profiles: Apple Developer account required.

---

## 14. Known Blockers

| Blocker | Blocks | Notes |
|---|---|---|
| No EAS `projectId` | Resolved | Written to `app.json` extra.eas after `eas init` could not patch `app.config.js` |
| Razorpay key **NOT CONFIGURED** | Payment native test | Set public key in EAS Environment |
| Maps key **NOT CONFIGURED** | Address pin + tracking map tiles | Restricted public key |
| FCM config missing | Android push | google-services.json or EAS FCM V1 |
| APNs credentials missing | iOS push | EAS iOS credentials |
| Development API `.local` | Phone vs that host | Override URL for device |
| Razorpay + New Architecture | Payment compile/runtime | Unverified until first native build |
| Apple/Android signing | iOS any; Android if not using EAS-managed keystore | EAS credentials |

---

## 15. Required Manual Setup

1. Expo account login (`npx eas-cli login`)
2. Link this repo — **done** (`@gunuco/gunuco-mobile`)
3. EAS Environment (or secrets) for:
   - reachable `EXPO_PUBLIC_API_BASE_URL` on development if not using `.local`
   - `EXPO_PUBLIC_RAZORPAY_KEY_ID` (test key for preview)
   - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (restricted to `com.gunuco.customer`)
4. Android: allow EAS to generate/store the keystore (first Android build prompt)
5. Apple Developer: bundle `com.gunuco.customer`, distribution cert, devices for ad hoc, APNs key
6. Firebase Android app + FCM V1 (EAS credentials or `google-services.json`)
7. Staging/production HTTPS API actually serving the documented routes
8. Android phone or emulator with Google Play (Maps + Razorpay)
9. iPhone + Mac for local iOS if not using EAS cloud
10. Do not put Razorpay secret, Firebase Admin JSON, or JWT secrets in `EXPO_PUBLIC_*`

---

## 16. Validation Results

| Check | Result |
|---|---|
| `npx expo config --type public` | Ran — identifiers, scheme, New Architecture true, Maps keys empty, no projectId |
| `npx expo install --check` | Same Phase 12 patch drift (expo, expo-image, expo-linking, expo-router). **Not upgraded.** |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 errors; 2 pre-existing RiderMap warnings) |
| `npm run format:check` | PASS |
| `npx expo-doctor` | 17/21 — **unchanged** vs Phase 12 (same 4 issues) |
| `npm audit` | Critical 0 / High 15 / Moderate 8 / Low 0 — **unchanged**; no upgrades |

---

## Build readiness table

| Area | Status | Evidence | Action |
|---|---|---|---|
| Android EAS | READY WITH CONDITIONS | `projectId` + `eas.json`; credentials/keys still needed | development/preview APK after EAS env keys |
| iOS EAS | BLOCKED | `projectId` present; Apple credentials NOT CONFIGURED | Apple setup then development/preview |
| Razorpay | NOT TESTED | Native module + empty public key | Configure test key; first native build |
| FCM | BLOCKED | No google-services / FCM V1 | Firebase + EAS credentials |
| APNs | BLOCKED | No Apple push credentials | EAS iOS credentials |
| Deep Links | NOT TESTED | scheme `gunuco` in config | Test after install |
| Maps | BLOCKED | Empty Maps key in effective config | Set restricted public key |
| Environment | READY | HTTPS prod/staging in `eas.json`; `.local` only on development | Override development URL for devices |
| Credentials | NOT CONFIGURED | No extra.eas; no keystore/p12 in repo | EAS-managed credentials |
| New Architecture | NOT TESTED | `newArchEnabled: true`; Razorpay doctor warning | Do not flip; verify on first native build |

---

## Permissions (native)

| Permission | Android | iOS | App behaviour |
|---|---|---|---|
| Notifications | POST_NOTIFICATIONS via plugin | APNs via plugin | Contextual, not first launch |
| Photo library | Image picker | `photosPermission` usage string | Denial explained (Phase 12) |
| Camera | plugin `false` | plugin `false` | Not requested |
| Microphone | plugin `false` | plugin `false` | Not requested |
| Customer GPS / background location | not requested in app | not requested | Map tap for pin; tracking uses backend rider coords |

---

## Deep-link test plan (run after a native build)

| Case | Expected |
|---|---|
| Order `orderId` | `/orders/{id}` after auth |
| Tracking type + `orderId` | `/orders/{id}/tracking` |
| Support `ticketId` | `/support/{id}` |
| Review `orderItemId` | `/review/write?orderItemId=` |
| Unknown payload | stay in inbox |
| Logged-out | phone auth, then `returnTo` |
| Expired session | session modal / re-auth; no private data from params |
| Missing ID | no broken route |
| Unauthorized ID | backend 403 → not-found copy |

---

## Android device test checklist

1. Install development or preview build  
2. Login  
3. OTP  
4. Home  
5. Product  
6. Wishlist  
7. Cart  
8. Checkout  
9. Razorpay  
10. Order  
11. Tracking  
12. Chat  
13. Notifications  
14. Support  
15. Profile  
16. Settings  
17. Legal  
18. Maintenance  
19. Force Update  
20. Logout A → B  
21. Offline / slow network  
22. Accessibility  
23. Deep links  

Also: Android 13+ notification permission, back button, keyboard, navigation bar, WebBrowser.

---

## UI test profile (backend not required)

`eas build --profile native-test --platform android` sets `EXPO_PUBLIC_UI_TEST_MODE=true` and does not call a real API.

This exercises the **same screens and RTK hooks** with mock transport. It is **not** backend integration testing.

See `docs/ui-test-mode.md`. Production / preview / development profiles keep `EXPO_PUBLIC_UI_TEST_MODE=false`.

---

## iOS device test checklist

Same 1–23, plus: APNs, iOS permission dialogs, swipe back, safe areas, keyboard, VoiceOver.

---

*End of EAS native testing readiness.*
