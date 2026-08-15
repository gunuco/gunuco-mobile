# GUNUCO Customer App — Phase 12 Security Audit

> Code and repository review on 15 Aug 2026. Device, payment, and push tests: **NOT TESTED**.
> Status values: PASS | PARTIAL | FAIL | CONFIRM | NOT TESTED.

---

## 1. Authentication

| Check | Status | Evidence | Notes |
|---|---|---|---|
| Phone + OTP only | PASS | `app/(auth)/phone.tsx`, `otp.tsx` | No password |
| Tokens not in URLs | PASS | OTP/phone-change `challengeId` in memory | `otpChallenge.ts`, `phoneChangeChallenge.ts` |
| Tokens not in navigation params | PASS | Auth intent is in-memory | `authIntent.ts` |
| Tokens not in Redux | PASS | `authSlice` stores customerId/phone/name only | |
| Session restore | PASS | `restoreSession` refresh → `GET /customers/me` | Failure → `clearSession` |
| 401 refresh mutex | PASS | `baseApi.ts` `Mutex` | No duplicate refresh |
| Refresh failure signs out | PASS | `dropInvalidSession` | Phase 12 also resets RTK + in-memory state |
| Guest browse without private APIs | PASS | Queries `skip: !isAuthenticated` | Cart, orders, support, notifications, store credit, wishlist GET |
| Stale auth intent | PASS | Cleared on logout/401, Profile sign-in, session-expired sign-in | Consumed after OTP |

## 2. Storage

| Check | Status | Evidence | Notes |
|---|---|---|---|
| Access/refresh in SecureStore only | PASS | `secureStorage.ts` | No AsyncStorage in app source |
| No tokens in files / logs | PASS | No `console.*` in `*.ts`/`*.tsx` | |
| Theme in SecureStore | PASS | `themePreference.ts` | Not a secret |
| Payment session in memory | PASS | `paymentSession.ts` | Cleared on logout/401/app kill |
| Order confirmation in memory | PASS | `orderConfirmation.ts` | Not persisted |

## 3. Navigation

| Check | Status | Evidence | Notes |
|---|---|---|---|
| IDs not full objects | PASS | `src/utils/navigation.ts` | |
| Deep link private data | PASS | Fetch after auth | Unknown notification stays in inbox (`parsePushData` no-op) |
| Force-update store URL | PASS | `isSafeStoreUrl` | https / market / itms / itms-apps only (Phase 12) |
| Legal / invoice URLs | PASS | HTTPS only, `expo-web-browser`, no auth headers | `urls.ts`, `orderActions.ts`, `legal/[type].tsx` |

## 4. API

| Check | Status | Evidence | Notes |
|---|---|---|---|
| Single client | PASS | `baseApi` + injectEndpoints | |
| Bearer on private calls | PASS | `prepareHeaders` | Anonymous auth endpoints skip Bearer |
| Timeout | PASS | 30s `fetchBaseQuery` timeout | |
| Error copy | PASS | `getErrorMessage` | No stack traces / SQL / correlation IDs. 403 mapped like 404 |
| Fail-open config | PASS | `checkRemoteAppConfig` | Unchanged |

## 5. Payment

| Check | Status | Evidence | Notes |
|---|---|---|---|
| No Razorpay secret in repo | PASS | Secret scan | Public `EXPO_PUBLIC_RAZORPAY_KEY_ID` only |
| Razorpay success not final | PASS | `POST /payments/razorpay/confirm` | |
| Pay button double-tap | PASS | Payment `busy` disables CTA | |
| Idempotency keys | PASS | Initiate / confirm / checkout | Header + body [CONFIRM] |
| Device payment flow | NOT TESTED | Requires native build, not Expo Go | |

## 6. Notifications

| Check | Status | Evidence | Notes |
|---|---|---|---|
| Permission not on first launch | PASS | Order Confirmation + Inbox cards | |
| Denied not re-prompted | PASS | `requestPushPermission` returns denied | Settings opens OS settings |
| Token not logged | PASS | No console logging | |
| Duplicate register skipped | PASS | `pushTokenCache.ts` | Logout/401 clears cache so next customer can register |
| Token delete on logout | CONFIRM | Not implemented | Backend contract unconfirmed |
| FCM/APNs on device | NOT TESTED | | |

## 7. Support

| Check | Status | Evidence | Notes |
|---|---|---|---|
| Ticket by ID fetch | PASS | `/support/[id]` | Ownership is backend 403/404 |
| Attachments JPG/PNG/WEBP max 3 | PASS | `ImageUploaderSlots` | Server still authoritative |
| Photo permission denial | PASS | Safe explanation (Phase 12) | Does not crash |
| Message content not logged | PASS | No console logging | |

## 8. Logging

| Check | Status | Evidence | Notes |
|---|---|---|---|
| No `console.log/debug/info/warn/error` in app TS | PASS | Repo search | |
| No `debugger` | PASS | | |
| Structured production logger | PARTIAL | `enableLogging` unused | Acceptable; do not add an SDK in Phase 12 |

## 9. Environment

| Check | Status | Evidence | Notes |
|---|---|---|---|
| No localhost in source | PASS | Search | |
| Production API fallback not `.local` | PASS | `env.ts` Phase 12 | Last-resort `https://api.gunuco.com` if env missing |
| `.env` gitignored | PASS | `.gitignore` | Templates committed with empty Maps/Razorpay keys |
| Tracked secrets | PASS | No private keys / `sk_live` in tracked source | Empty public key placeholders in `.env.*` templates |

## 10. Dependencies

| Check | Status | Evidence | Notes |
|---|---|---|---|
| `npm audit` | See Phase 12 report | Run during Phase 12 | Do not blindly upgrade |
| Razorpay vs New Architecture | PARTIAL | `app.json` `newArchEnabled: true`; doctor warns Razorpay unsupported | Do not flip architecture blindly. Native payment **NOT TESTED** |

## 11. Permissions

| Permission | Required | Status | Notes |
|---|---|---|---|
| Notifications | Contextual | PASS | Not first launch |
| Photo library | Support/complaint evidence | PASS | Purpose string in `app.config.js` |
| Camera | No | PASS | `cameraPermission: false` |
| Microphone | No | PASS | Disabled in image-picker plugin |
| Background location | No | PASS | Tracking uses backend rider coordinates |
| Customer location | Address map pin only | PASS | No background location |

## 12. Logout isolation (Customer A → B)

| Check | Status | Evidence | Notes |
|---|---|---|---|
| Explicit logout | PASS | `clearSession` → tokens + in-memory + `resetApiState` | Device A→B **NOT TESTED** |
| 401 session drop | PASS | Phase 12: same teardown as logout | Previously FAIL: cache not reset on 401 |

## 13. Git security

Secret scan of tracked source: **no backend secrets found**. Empty public key placeholders in env templates are not secrets. If a real key is ever committed, rotate it; do not print it.

---

## Results

| Area | Status |
|---|---|
| Code-level auth/storage/navigation | PASS |
| Payment native | NOT TESTED |
| Push native | NOT TESTED |
| Logout A→B on device | NOT TESTED |
| Backend contracts | CONFIRM (OpenAPI) |
| Remaining product policy | See open-questions Q34/Q46/Q50 |

---

*End of security audit.*
