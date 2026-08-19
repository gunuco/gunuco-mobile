# GUNUCO Customer App — UI Test Mode

Temporary, environment-gated mock API transport so the **real** customer app can be exercised on device while the backend is not ready.

This is **not** Phase 13. It does not implement backend functionality and does not change production behavior.

---

## 1. Purpose

Install and navigate the existing GUNUCO screens, hooks, and flows without `EXPO_PUBLIC_API_BASE_URL` pointing at a live API.

## 2. Why it exists

Phases 1–12 are complete. The real backend URL is not ready. UI, navigation, loading/empty/error states, and native-test APKs still need to run.

## 3. How to enable

Set **only**:

```
EXPO_PUBLIC_UI_TEST_MODE=true
```

Local Expo:

```
EXPO_PUBLIC_UI_TEST_MODE=true npx expo start
```

Or put that line in a gitignored `.env.local`.

Native APK:

```
eas build --profile native-test --platform android
```

OTP for the real login screens: **`123456`**.

Phones:

- Customer A: `9000000001`
- Customer B: `9000000002`
- Any other valid Indian mobile signs in as Customer A

## 4. How to disable

```
EXPO_PUBLIC_UI_TEST_MODE=false
```

Omit the variable (default is off). Production, preview, and development EAS profiles already set `false`.

## 5. Mock architecture

```
Screens (unchanged)
  → existing RTK Query hooks (unchanged)
  → existing API slices (unchanged)
  → baseApi
  → baseQueryWithReauth (unchanged)
  → env.uiTestMode ? uiTestBaseQuery : fetchBaseQuery
```

Interception point: `src/store/api/baseApi.ts` replaces **only** the fetch transport.

Mock repository (`src/mocks/repository.ts`) is the server-like source of truth. RTK Query remains the client cache. Mutations update the repository first, then return the envelope the existing `transformResponse` / normalizers expect.

## 6. Test customers

| Id | Name | Phone | Notes |
|---|---|---|---|
| `ui-test-customer-a` | GUNUCO Test Customer A | 9000000001 | Wishlist, store credit, full order set |
| `ui-test-customer-b` | GUNUCO Test Customer B | 9000000002 | Isolated cart / orders / tickets |

Switch from **Settings → UI Test controls** or the **UI Test** badge (visible only when the flag is true).

Tokens are synthetic (`ui-test-access-…` / `ui-test-refresh-…`). They are not JWTs and are not real credentials.

## 7. Scenarios

Opened from the UI Test screen:

| Scenario | Effect |
|---|---|
| Success | Happy path |
| Loading | Extra latency |
| Empty | Empty lists (home sections, cart, wishlist, orders, …) |
| Network error | `FETCH_ERROR` |
| Timeout | `TIMEOUT_ERROR` |
| 401 / 403 / 404 / 422 / 500 | Matching HTTP errors (`getErrorMessage` unchanged) |
| Not serviceable | Fulfilment check fails |
| Coupon failed | Apply coupon fails |
| Payment * | Hosted-UI stand-in + mock confirm (not a real Razorpay charge) |
| Maintenance / Force update | `GET /app/config` drives existing gate screens |

Network: Online / Slow / Offline.

On a maintenance or force-update gate, the badge reads **UI Test · reset** and returns the app to Success.

## 8. Supported endpoints

Every endpoint in `src/store/api/*.ts` is handled. See `docs/ui-test-mode-final-report.md` for the inventory.

Not mocked (not called by the app): `POST /products/quote`, `POST /cart/merge`, `GET /payments/status`, `POST /notifications/read-all`, push-token unbind.

## 9. Production safety

- Flag must be the string `true`. Missing URL, 404, timeout, or `__DEV__` do **not** enable mocks.
- `EXPO_PUBLIC_UI_TEST_MODE=false` uses the existing `fetchBaseQuery` + reauth mutex + SecureStore + real API URL.
- development / preview / production EAS profiles set the flag to `false`.
- No real secrets, OTPs, Razorpay secrets, or personal data in fixtures.

## 10. How to remove when the backend is ready

1. Keep `EXPO_PUBLIC_UI_TEST_MODE=false` (already the default).
2. Point `EXPO_PUBLIC_API_BASE_URL` at the real API.
3. Optionally delete `src/mocks/`, `app/ui-test.tsx`, the `native-test` EAS profile, and the `env.uiTestMode` branch in `baseApi.ts` / `razorpayCheckout.ts` / `env.ts`.

The UI, RTK slices, and screens do not need to be rewritten.

---

*End of UI test mode.*
