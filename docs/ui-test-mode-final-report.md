# GUNUCO Customer App — UI Test Mode Final Report

Temporary mock transport for frontend/native UI testing. **Not Phase 13.** Backend is not implemented.

## 1. What was implemented

An environment-gated mock API transport behind the existing `baseApi`. When `EXPO_PUBLIC_UI_TEST_MODE=true`, the real GUNUCO screens receive deterministic mock responses through the existing RTK Query hooks.

## 2. Architecture

```
Screens / components (unchanged)
  → existing RTK Query hooks (unchanged)
  → existing API slices + transformResponse (unchanged)
  → baseApi (same createApi, same tagTypes)
  → baseQueryWithReauth (same 401/mutex/SecureStore path)
  → env.uiTestMode ? uiTestBaseQuery : fetchBaseQuery
       → mock repository (in-memory, customer-scoped)
```

## 3. Mock interception point

`src/store/api/baseApi.ts`: only `rawBaseQuery` is swapped when `env.uiTestMode` is true.

```
const rawBaseQuery = env.uiTestMode ? uiTestBaseQuery : networkBaseQuery;
```

No second `createApi()`, no second Redux store, no mock screens, no `useMock*` hooks.

## 4. Files created

- `src/mocks/scenarios.ts`
- `src/mocks/fixtures.ts`
- `src/mocks/repository.ts`
- `src/mocks/handlers.ts`
- `src/mocks/transport.ts`
- `src/mocks/razorpay.ts`
- `src/mocks/session.ts`
- `src/mocks/UiTestBadge.tsx`
- `src/mocks/index.ts`
- `app/ui-test.tsx`
- `docs/ui-test-mode.md`
- `docs/ui-test-mode-final-report.md`

## 5. Files modified

- `src/config/env.ts` — `uiTestMode`; UI-test host `https://ui-test.invalid`
- `src/store/api/baseApi.ts` — transport gate
- `src/services/razorpayCheckout.ts` — UI-test-only branch before the real SDK
- `app/_layout.tsx` — `ui-test` route + gated badge
- `app/settings/index.tsx` — gated “UI Test controls” row
- `src/utils/navigation.ts` / `src/utils/index.ts` — `uiTestHref()`
- `eas.json` — `native-test` profile; other profiles set `EXPO_PUBLIC_UI_TEST_MODE=false`
- `.env.development` / `.env.staging` / `.env.production` — flag default `false`
- `docs/environment-variables.md`
- `docs/eas-native-testing-readiness.md`

## 6. API endpoint inventory

| Slice | Endpoint | Method | URL | Kind | Normalizer | Mock |
|---|---|---|---|---|---|---|
| authApi | requestOtp | POST | `/auth/otp/request` | mutation | none | Yes |
| authApi | verifyOtp | POST | `/auth/otp/verify` | mutation | none | Yes |
| authApi | refreshToken | POST | `/auth/token/refresh` | mutation | none | Yes |
| authApi | logout | POST | `/auth/logout` | mutation | none | Yes |
| authApi | getMe | GET | `/customers/me` | query | none | Yes |
| authApi | updateMe | PATCH | `/customers/me` | mutation | normalizeCustomer | Yes |
| authApi | requestPhoneChange | POST | `/auth/phone/change/request` | mutation | normalizePhoneChangeRequest | Yes |
| authApi | verifyPhoneChange | POST | `/auth/phone/change/verify` | mutation | normalizeCustomer | Yes |
| configApi | getAppConfig | GET | `/app/config` | query | normalizeAppConfig | Yes |
| homeApi | getHome | GET | `/customer/home` | query | none | Yes |
| categoryApi | getCategories | GET | `/categories` | query | normalizeCategoriesResponse | Yes |
| categoryApi | getCategoryProducts | GET | `/categories/{id}/products` | query | normalizeProductListResponse | Yes |
| productApi | searchProducts | GET | `/products/search` | query | normalizeProductListResponse | Yes |
| productApi | getProduct | GET | `/products/{id}` | query | normalizeProductDetail | Yes |
| productApi | getProductOptions | GET | `/products/{id}/options` | query | normalizeProductOptions | Yes |
| wishlistApi | getWishlist | GET | `/wishlist` | query | normalizeWishlistResponse | Yes |
| wishlistApi | addWishlistItem | POST | `/wishlist/{productId}` | mutation | none | Yes |
| wishlistApi | removeWishlistItem | DELETE | `/wishlist/{productId}` | mutation | none | Yes |
| reviewApi | getProductReviews | GET | `/products/{id}/reviews` | query | normalizeProductReviewsResponse | Yes |
| reviewApi | getReviewableItems | GET | `/orders/{id}/reviewable-items` | query | normalizeReviewableItems | Yes |
| reviewApi | createReview | POST | `/reviews` | mutation | normalizeCreateReviewResponse | Yes |
| cartApi | getCart | GET | `/cart` | query | normalizeCart | Yes |
| cartApi | addCartItem | POST | `/cart/items` | mutation | normalizeAddCartItemResponse | Yes |
| cartApi | updateCartItem | PATCH | `/cart/items/{id}` | mutation | mutationReturnedCart | Yes |
| cartApi | removeCartItem | DELETE | `/cart/items/{id}` | mutation | mutationReturnedCart | Yes |
| cartApi | revalidateCart | POST | `/cart/revalidate` | mutation | mutationReturnedCart | Yes |
| cartApi | applyCoupon | POST | `/cart/apply-coupon` | mutation | mutationReturnedCart | Yes |
| cartApi | removeCoupon | DELETE | `/cart/coupon` | mutation | mutationReturnedCart | Yes |
| cartApi | applyStoreCredit | POST | `/cart/apply-store-credit` | mutation | mutationReturnedCart | Yes |
| cartApi | removeStoreCredit | DELETE | `/cart/store-credit` | mutation | mutationReturnedCart | Yes |
| addressApi | getAddresses | GET | `/addresses` | query | normalizeAddressList | Yes |
| addressApi | createAddress | POST | `/addresses` | mutation | normalizeAddress | Yes |
| addressApi | updateAddress | PATCH | `/addresses/{id}` | mutation | normalizeAddress | Yes |
| addressApi | deleteAddress | DELETE | `/addresses/{id}` | mutation | none | Yes |
| fulfilmentApi | checkServiceability | POST | `/fulfilment/serviceability` | mutation | normalizeServiceability | Yes |
| fulfilmentApi | getFulfilmentSlots | GET | `/fulfilment/slots` | query | normalizeSlots | Yes |
| fulfilmentApi | getPickupInfo | GET | `/fulfilment/pickup-info` | query | normalizePickupInfo | Yes |
| checkoutApi | createCheckout | POST | `/checkout` | mutation | normalizeCheckoutResult | Yes |
| storeCreditApi | getStoreCredit | GET | `/store-credit` | query | normalizeStoreCredit | Yes |
| paymentApi | initiateRazorpayPayment | POST | `/payments/razorpay/initiate` | mutation | normalizeRazorpayInitiation | Yes |
| paymentApi | confirmRazorpayPayment | POST | `/payments/razorpay/confirm` | mutation | normalizePaymentConfirmation | Yes |
| orderApi | getOrders | GET | `/orders` | query | normalizeOrderListResponse | Yes |
| orderApi | getOrder | GET | `/orders/{id}` | query | normalizeOrderDetail | Yes |
| orderApi | getCancellationEligibility | GET | `/orders/{id}/cancellation-eligibility` | query | normalizeCancellationEligibility | Yes |
| orderApi | cancelOrder | POST | `/orders/{id}/cancel` | mutation | normalizeCancelOrderResult | Yes |
| orderApi | reorderOrder | POST | `/orders/{id}/reorder` | mutation | normalizeReorderResult | Yes |
| orderApi | getOrderInvoice | GET | `/orders/{id}/invoice` | query | normalizeInvoiceResult | Yes |
| trackingApi | getOrderTracking | GET | `/orders/{id}/tracking` | query | normalizeOrderTracking | Yes |
| trackingApi | getOrderRider | GET | `/orders/{id}/rider` | query | normalizeOrderRider | Yes |
| chatApi | getRiderChatMessages | GET | `/orders/{id}/rider-chat/messages` | query | normalizeRiderChatThread | Yes |
| chatApi | sendRiderChatMessage | POST | `/orders/{id}/rider-chat/messages` | mutation | normalizeRiderChatMessage | Yes |
| notificationApi | registerPushToken | POST | `/devices/push-token` | mutation | none | Yes (ack only) |
| notificationApi | getNotifications | GET | `/notifications` | query | normalizeNotificationList | Yes |
| notificationApi | markNotificationRead | POST | `/notifications/{id}/read` | mutation | none | Yes |
| supportApi | getSupportTickets | GET | `/support/tickets` | query | normalizeTicketList | Yes |
| supportApi | getSupportTicket | GET | `/support/tickets/{id}` | query | normalizeTicketDetail | Yes |
| supportApi | createSupportTicket | POST | `/support/tickets` + attachments | mutation | normalizeTicketCreateResult | Yes |
| supportApi | sendSupportMessage | POST | `/support/tickets/{id}/messages` | mutation | none | Yes |
| legalApi | getLegalDocument | GET | `/legal/{type}` | query | normalizeLegalDocument | Yes |

Not called by the app (not mocked as live APIs): quote, cart merge, payment status poll, read-all notifications, push unbind.

## 7. Mock scenarios

Success, Loading, Empty, Network error, Timeout, 401, 403, 404, 422, 500, Not serviceable, Coupon failed, Payment success/cancelled/failed/unknown/verification-failed, Maintenance, Force update. Network: Online / Slow / Offline.

## 8. Test customers

- **CUSTOMER_A** (`ui-test-customer-a`, `9000000001`) — wishlist, ₹250 store credit, active/past/cancelled orders, open ticket
- **CUSTOMER_B** (`ui-test-customer-b`, `9000000002`) — isolated data, delivered order, closed ticket

OTP: `123456`. Synthetic tokens only.

## 9. Authentication behavior

UI test mode still uses `useAuth` / `restoreSession` / SecureStore / logout / `resetApiState`. Mock OTP verify and refresh populate synthetic tokens. Production auth is unchanged when the flag is false.

## 10. Cart behavior

In-memory cart per customer. Add / qty / remove / coupon `GUNUCO10` / store credit `{ max: true }` / revalidate. Totals returned as integer paise from the mock repository.

## 11. Wishlist behavior

Session-scoped per customer. Heart add/remove invalidates existing RTK tags so Home and Wishlist update.

## 12. Checkout behavior

`POST /checkout` after existing UI revalidation. Returns checkoutId, amountPaise, synthetic Razorpay order id, public test key id `rzp_test_ui_mode` (not a secret).

## 13. Payment UI behavior

Real SDK is **not** replaced globally. `openRazorpayCheckout` takes a UI-test branch only when the flag is true, then existing `confirmRazorpayPayment` hits the mock confirm. Production still: initiate → real SDK → confirm.

## 14. Orders behavior

Seeded placed / preparing / ready / out-for-delivery / delivered / cancelled. Cancel, reorder, invoice URL (HTTPS placeholder).

## 15. Tracking behavior

Deterministic Hyderabad coordinates + polyline for the out-for-delivery order. No real GPS. Rider display-safe fields only.

## 16. Notifications behavior

Fixtures for confirmed, payment, preparing, ready, OFD, delivered, support, review reminder, unknown type. Mark-read updates unread count on Home. No FCM/APNs delivery.

## 17. Support behavior

Open + closed tickets, reply, create, attachment POST returns 2xx without uploading.

## 18. Loading / error / empty / offline

Central latency (default ~600ms). Scenario + network controls. Errors are RTK `FetchBaseQueryError` so `getErrorMessage()` is unchanged. Offline returns `FETCH_ERROR`, never fake success.

## 19. Deep-link testing

Notification fixtures include order, tracking, ticket, review, and unknown destinations. Existing `useNotificationDeepLinks` is used. Logged-out private destinations still go through phone auth.

## 20. Production safety verification

| Check | Result |
|---|---|
| Default flag | `false` unless the string `true` |
| Failures do not enable mocks | Yes — no fallback |
| development / preview / production EAS | `EXPO_PUBLIC_UI_TEST_MODE=false` |
| native-test | `true`, no staging/production API URL |
| UI Test badge / Settings row | Rendered only when `env.uiTestMode` |
| Real Razorpay SDK | Used when flag is false |
| Secrets in fixtures | None |

## 21. EAS native-test profile

```
eas build --profile native-test --platform android
```

Internal APK. `EXPO_PUBLIC_UI_TEST_MODE=true`. No `api.dev.gunuco.local` / staging / production API URL. EAS Environment mapping uses `development` so existing EAS env slots are not required.

## 22. TypeScript result

`npm run typecheck` — **pass**

## 23. ESLint result

`npm run lint` — **pass** (0 errors). Existing RiderMap exhaustive-deps warnings unchanged.

## 24. Prettier result

`npm run format:check` — **pass**

## 25. Expo Doctor result

**17/21** — same 4 existing issues as Phase 12 (app.json schema `newArchEnabled`, app.config.js extra merge, razorpay New Architecture directory check, patch version drift). Not changed in this task.

## 26. Remaining backend-dependent tests

These are **not** claimed tested:

- Real HTTPS API against OpenAPI
- Real OTP / SMS
- Real Razorpay capture + webhook
- Real FCM / APNs delivery
- Real Maps key on device
- Real invoice PDF host
- Customer isolation on a real backend
- Production payment verification

---

## Required final status

| Item | Status |
|---|---|
| UI TEST MODE | **IMPLEMENTED** |
| Production behavior | **UNCHANGED** when `EXPO_PUBLIC_UI_TEST_MODE=false` |
| RTK Query architecture | **PRESERVED** |
| API contracts | **PRESERVED** |
| Production mock fallback | **DISABLED** |
| Native-test build | **READY** to run `eas build --profile native-test --platform android` (not executed in this task) |

---

*End of UI test mode final report.*
