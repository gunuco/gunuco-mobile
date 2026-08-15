# GUNUCO Customer App — Frontend Architecture (Final)

> Aligns with `CURSOR_MASTER_INSTRUCTIONS.md` + `GUNUCO_PRODUCT_DECISIONS.md`.
> Customer-only Expo app for **Android + iOS**. No Rider/Admin modules. No backend implementation.

---

## 1. Technology Stack

| Layer | Choice |
|---|---|
| App | React Native + Expo |
| Language | TypeScript strict |
| Navigation | Expo Router |
| Server state | RTK Query |
| Client state | Minimal Redux slices |
| Motion | Reanimated + Gesture Handler |
| Lists | FlashList |
| Maps | Google Maps (addresses + live tracking) |
| Payments | Razorpay RN-compatible SDK |
| Push | Expo Notifications → FCM/APNs |
| Secrets | SecureStore for tokens |
| Theme | Design-system light/dark |
| Quality | ESLint, Prettier |

Verify Expo compatibility before adding native modules (Maps, Razorpay, SecureStore).

---

## 2. Folder Structure

```text
app/
├── (auth)/                 # phone, otp
├── (tabs)/                 # home, search, categories, cart, profile
├── product/
├── wishlist/
├── checkout/
├── payment/
├── order-confirmation/
├── orders/                 # list, [id], tracking — later phase
├── addresses/
├── offers/
├── store-credit/
├── notifications/
├── support/
├── legal/
├── settings/
└── _layout.tsx             # auth gate, theme, force-update/maintenance

src/
├── components/{ui,layout,business,tracking,support}/
├── design-system/          # light + dark tokens
├── store/{store.ts,slices,api}/
├── services/               # secureStorage, razorpay, maps, notifications
├── hooks/
├── utils/                  # money (paise), errorCode maps
├── constants/
├── config/                 # EXPO_PUBLIC_API_BASE_URL, env
├── types/
├── theme/                  # ThemeProvider
├── i18n/                   # English strings map (future-ready)
└── features/               # feature-local only when needed

assets/{images,icons,fonts}/
tests/
docs/
```

---

## 3. Component Architecture

1. Primitive UI  
2. Composite UI  
3. Business / Tracking / Support  

**Generic catalogue model:** `ProductOptionRenderer` driven by backend option schema so Cakes → Coffee/Pizza/Burgers need no cake-specific architecture. Cookies use normal options (e.g. pack size), not cake ingredient matrices.

Screens compose shared components only.

---

## 4. State Management

| Concern | Store |
|---|---|
| UI local | component state |
| Server | RTK Query |
| Auth session | `authSlice` + SecureStore |
| Theme preference | `settingsSlice` / SecureStore or AsyncStorage |
| Guest cart draft | Not implemented. Guest cart mutations go to phone auth. `POST /cart/merge` remains **[CONFIRM]**. |
| Cart (logged-in) | RTK Query `cartApi` |
| Checkout UI | Local component state (fulfilment, addressId, slot, schedule). Address pick handoff is in-memory, not persisted. |

Do not duplicate API payloads into slices.

---

## 5. RTK Query Modules

```text
baseApi.ts
authApi.ts
homeApi.ts
categoryApi.ts
productApi.ts
wishlistApi.ts
reviewApi.ts
cartApi.ts
addressApi.ts
fulfilmentApi.ts
checkoutApi.ts
storeCreditApi.ts
orderApi.ts
paymentApi.ts
trackingApi.ts
chatApi.ts
supportApi.ts
offerApi.ts
notificationApi.ts
configApi.ts
```

`baseApi`: env base URL, auth header, 401 refresh mutex, tag invalidation.

---

## 6. Navigation Architecture

- Public browse: Home, Search, Categories, Product (guest OK)
- Auth stack: Phone → OTP
- Checkout requires auth (redirect + return URL)
- Orders: Active / Past / Cancelled
- Tracking + Rider Chat as stack routes gated by order status
- Deep links from push notifications

Tabs: Home | Search | Categories | Cart | Profile

---

## 7. Authentication / Session

Phone OTP → tokens in SecureStore → stay logged in until logout → multi-device OK.

Phone change: OTP on new number.

Never log tokens; never store card data.

---

## 8. Money Handling

- API/payment: **integer paise**
- Display: format to ₹ via shared `formatPaise()`
- No floating-point business math on client

---

## 9. Payments

Phase 9 is implemented. Phase 8 still owns `POST /checkout`. Payment never creates a second checkout.

```text
Checkout → POST /cart/revalidate → POST /checkout
  → /payment?checkoutId=
  → POST /payments/razorpay/initiate (skipped if checkout already returned Razorpay order + amount)
  → react-native-razorpay hosted UI (UPI / card / net banking)
  → POST /payments/razorpay/confirm (backend verifies signature)
  → only then Order Confirmation + Cart invalidate + GET /cart
```

- Package: `react-native-razorpay` ^3.0.0. Requires a development or production native build. **Not Expo Go.**
- Public key: `EXPO_PUBLIC_RAZORPAY_KEY_ID` via `src/config/env.ts`. Never put Razorpay secret, webhook secret, or verification HMAC in the app.
- Amount: backend integer paise, passed to Razorpay as-is (no ₹ × 100).
- Uncertain payment: UNKNOWN UI. No `GET /payments/status` (not documented).
- Full payment only. Store credit applied server-side before residual Razorpay charge.

---

## 10. Maps & Tracking

- Address form: Google Maps pin via `react-native-maps` + `MapPicker` (Phase 8)
- Live tracking: `RiderMap` on `/orders/[id]/tracking` using `GET /orders/{id}/tracking` (Phase 10). Poll 15s while focused. Stop when delivered/cancelled/unavailable.
- Call/Chat: backend-gated on Order Detail + Tracking/Chat screens. No Rider/Admin modules.

---

## 11. Notifications

Expo push; register token after contextual permission grant; map payload → routes.

---

## 12. Theme

`ThemeProvider` switches light/dark (and system if desired). All components read tokens. Settings screen toggles preference.

---

## 13. App Config Gate

Root layout fetches `app/config`:

- `forceUpdate` → blocking update screen  
- `maintenanceMode` → blocking maintenance screen  
- else continue  

---

## 14. Performance

RTK cache, FlashList, pagination, image sizing/cache, skeletons, optimistic qty where safe, light animations, measure before memoizing.

---

## 15. Testing Strategy

- Unit: money formatters, error-code maps, idempotency helpers  
- Component: ProductCard, CartSummary, theme snapshots  
- Integration: auth gate at checkout, cart revalidate UI, payment processing wait  
- Later E2E: browse → cart → auth → checkout smoke  

---

## 16. Explicit Architecture Exclusions

- No custom-cake feature module  
- No advance/balance payment state machine  
- No referral module  
- No Rider/Admin navigators  
- No hard-coded category enums or slot lists  
- No frontend-authoritative pricing/tax  

---

## 17. Phase Readiness

Phase 1 (foundation + design system + dual theme) is **implemented**. Do not begin Phase 2 until explicitly requested.

Suggested later phase order remains master-aligned, with additions:

- Wishlist/Reviews with product/profile phases  
- Tracking/Chat with orders phase  
- Store credit + coupons with checkout phase  
- Force update/maintenance screens (config API already reserved in RTK tags)

---

## 18. Phase 1 As-Built Decisions

| Area | Decision |
|---|---|
| Expo SDK | **57** with React Native **0.86** / React **19.2** |
| Entry | `expo-router/entry` |
| Env files | `.env.development`, `.env.staging`, `.env.production` via `EXPO_PUBLIC_*` |
| Config | `src/config/env.ts` — only place for API base URL |
| Secure storage | `expo-secure-store` wrapper in `src/services/secureStorage.ts` |
| Redux | `auth` + `settings` slices only; server state via `baseApi` |
| RTK Query | `baseApi` + empty injectors for auth/product/category/cart/address/order/payment/notification — **no invented endpoints** |
| Navigation | Root stack + `(auth)` shell + `(tabs)` shell + Phase 1 gallery at `/` |
| Images | `expo-image` in `GImage` with memory-disk cache |
| Lists | `@shopify/flash-list` installed for later product/order lists |
| Maps / Razorpay / Push | **Not installed in Phase 1** (deferred to feature phases) |
| Path alias | `@/*` → project root |
| Quality scripts | `npm run typecheck`, `lint`, `format`, `format:check` |

### Divergence from earlier docs

1. Feature route folders (`product/`, `checkout/`, etc.) are **not** created yet — only navigation shells — to avoid empty Expo Router screens.
2. `@gorhom/bottom-sheet` not added; Modal-based `BottomSheet` used instead.
3. Brand fonts not bundled — typography tokens use platform fonts until Q46 assets arrive.
4. Jest not configured yet; `tests/` holds a README placeholder only.

---

## 19. Phase 2 As-Built (Authentication + Shell)

| Area | Decision |
|---|---|
| Auth method | Phone + OTP only (no password) |
| Endpoints | `/auth/otp/request`, `/auth/otp/verify`, `/auth/token/refresh`, `/auth/logout`, `/customers/me` |
| Tokens | Access + refresh in SecureStore only |
| Guest browsing | Tabs accessible without login |
| Auth UI | `/(auth)/phone`, `/(auth)/otp` (modal presentation) |
| Tabs | Home / Search / Categories / Cart / Profile (feature placeholders except Profile session actions) |
| Session restore | Cold start refresh → `customers/me` |
| 401 handling | Public catalogue GETs retry as guest after a failed refresh; private 401s refresh once then clear session. Waiters never replay a dead token. |
| Logout | Calls logout API then clears SecureStore + RTK cache |
| Entry | `/` redirects to `/(tabs)` |
| Design gallery | Moved to `/design-system` (dev validation) |

---

## 20. Phase 3 As-Built (Home Experience)

| Area | Decision |
|---|---|
| Screen | `app/(tabs)/index.tsx` — full Home (replaces Phase 2 placeholder) |
| API | `homeApi.getHome` → `GET /customer/home` via `useGetHomeQuery` |
| Types | `src/types/home.ts` — banners, mainCategories, subcategories, featured, bestSellers, offers, recommended, deliveryContext, unreadNotificationCount |
| Header | `HomeHeader` — brand + location label, notification bell (+ unread badge), SearchBar entry → Search tab |
| Sections (API-driven only) | Banners → Shop by category → Explore (subcategories) → Offers → Featured → Best sellers → Recommended |
| Not built | Recently viewed / Buy again — **not** in Home API contract; deferred until backend provides them |
| States | Initial skeleton (`HomeSkeleton`), error + retry, empty + retry, pull-to-refresh |
| Lists | Horizontal `@shopify/flash-list` (v2; no `estimatedItemSize`) for banners, categories, offers, products |
| Images | `GImage` / `expo-image` memory-disk cache |
| Memoization | `ProductCard`, `CategoryCard`, section carousels memoized |
| Navigation | Category → `/category/[id]`; Product → `/product/[id]` |
| Pagination | Not applicable — Home is a single aggregated payload |
| Guest | Home loads without auth (token attached only when present) |

### Divergence from earlier analysis

1. No inventing “recently viewed / buy again” sections despite UX inspiration — sections come only from `GET customer/home`.
2. FlashList v2 dropped `estimatedItemSize`; sizing relies on bounded parent heights + item layout.

---

## 21. Phase 4 As-Built (Categories + Search)

| Area | Decision |
|---|---|
| Categories tab | `app/(tabs)/categories.tsx` — active main categories from `GET /categories` |
| Main category | `app/category/[id]/index.tsx` — subcategory grid; leaf categories auto-`replace` to products |
| Product listing | `app/category/[id]/products.tsx` — filters, sort, pagination, pull-to-refresh |
| Search tab | `app/(tabs)/search.tsx` — debounced `GET /products/search` (350ms, min 2 chars) |
| Product route | `app/product/[id].tsx` — Product Details implemented in Phase 5 |
| APIs | `categoryApi` (`getCategories`, `getCategoryProducts`), `productApi.searchProducts` |
| Shared chrome | `CatalogToolbar`, `SortSheet`, `FilterSheet`, `ProductGridList`, `GChip` |
| Filter source | Backend `availableFilters` / subcategory list from category tree; price min/max as paise query params |
| Sort source | Backend `availableSorts` when present; else approved defaults Popular / Price↑↓ / Newest |
| Pagination | RTK Query page merge via `serializeQueryArgs` + `merge` (no invented infinite helpers) |
| Hard-coding avoided | No fixed Cakes-only tree; inactive mains (Coffee/Pizza/Burgers) stay hidden unless API marks active |
| Recent searches | Not implemented — not required by approved UX docs |

### Divergence from earlier analysis

1. Option filter keys are passed through from backend filter group ids (not cake-specific query param names).
2. Add/Wishlist actions hidden on listing cards until Cart/Wishlist phases.
3. Categories response normalizer accepts `{ categories }`, `{ data }`, or bare array to tolerate backend envelope variance without inventing endpoints.

---

## 22. Phase 5 As-Built (Product Details + Product Options)

| Area | Decision |
|---|---|
| Screen | `app/product/[id]/index.tsx` — generic PDP for all catalogue products |
| Route | `/product/[id]` with product id only (Home / Category / Search already `productHref`) |
| APIs | `GET /products/{id}`, `GET /products/{id}/options`, `POST /cart/items` |
| Not called | `POST /products/quote` remains **[CONFIRM]** |
| Options | `ProductOptionRenderer` from backend groups/values; add-ons mapped into the same groups; no cake-specific fields |
| Price | Backend starting price, matching variant, or a single option `pricePaise`. No frontend totals or discount %. |
| Availability | Backend `isAvailable` / labels; unavailable PDP stays visible with disabled CTA |
| Quantity | Shared `QuantitySelector`; min/max from API when present |
| Add to Cart | Signed-in customers call `POST /cart/items`. Success copy only after 2xx. Guests are sent to phone auth. No local guest cart. Cart tab is the Phase 7 common cart. |
| Wishlist / reviews | Phase 6: `WishlistButton` in header; Reviews link → `/product/[id]/reviews` |
| Images | `ProductImageGallery` on `GImage` / expo-image memory-disk cache, swipe + count + preview |
| States | `ProductDetailSkeleton`, `ErrorState` + retry + continue shopping, 404 `EmptyState` |
| Guest | PDP is public browse (including `/products/{id}/options`). Auth is not required to open the screen. |
| Custom cake | Not implemented. Wedding/Birthday cakes use this same catalogue PDP. |

### Divergence from earlier analysis

1. Product options live on the Product Details screen (D4 is not a separate route).
2. Quote/preview API is not used while it remains **[CONFIRM]**.
3. Guest add-to-cart does not create a local draft cart (`cart/merge` still **[CONFIRM]**).

---

## 23. Phase 6 As-Built (Wishlist + Ratings & Reviews)

| Area | Decision |
|---|---|
| Wishlist route | `/wishlist` from Profile. One canonical route. |
| Wishlist APIs | `GET /wishlist`, `POST /wishlist/{productId}`, `DELETE /wishlist/{productId}` via `wishlistApi` |
| WishlistButton | Single heart used by ProductCard overlay, Product Details header, and Wishlist list |
| Cache | `Wishlist` tag (`LIST` + product id) + invalidate matching `Product` id. Shared `useGetWishlistQuery`. Mutations are non-optimistic. |
| Guest | No local wishlist. Heart sets in-memory `authIntent` and opens phone auth. After OTP, pending add is dispatched and the modal is dismissed (or `/wishlist` is restored). |
| Reviews route | `/product/[id]/reviews` |
| Write review | `/review/write` requires `orderItemId`. No fake orders; Orders UI is later. |
| Review APIs | `GET /products/{id}/reviews` (paginated, public GET), `GET /orders/{id}/reviewable-items` (hook only), `POST /reviews` `{ orderItemId, rating, text }` |
| Moderation | Pending/submitted status → confirmation only. Public list is backend-approved reviews. No local average recalculation. |
| Listing hearts | Home / Search / Category show `WishlistButton`. Add on listings stays off except Wishlist. Wishlist Add to Cart posts `POST /cart/items` only when option requirement is already known to be safe (wishlist metadata or cached Product Options). Otherwise it opens canonical Product Details — no N+1 options fetch, no duplicate option UI. |

### Divergence from earlier analysis

1. Guest local wishlist is not implemented.
2. Write Review is architecture-ready without an Orders entry point.

---

## 24. Phase 7 As-Built (Common Cart)

| Area | Decision |
|---|---|
| Screen | `app/(tabs)/cart.tsx` — one common server cart for all catalogue products |
| APIs | `GET /cart`, existing `POST /cart/items`, `PATCH /cart/items/{id}` (quantity), `DELETE /cart/items/{id}`, `POST /cart/apply-coupon`, `DELETE /cart/coupon`. `POST /cart/revalidate` is wired in `cartApi` for the future Checkout phase and is not called from Cart UI. |
| Not called | `POST /cart/merge` **[CONFIRM]**; orders |
| Cache | `Cart` tag (`LIST` + cart line id). Mutations update the GET cache when the response is a cart payload; otherwise they invalidate `LIST`. `POST /cart/items` invalidates `LIST`. Logout `resetApiState()` clears cart. |
| Guest | No local cart. Cart tab shows sign-in. Guest Add to Cart on Product Details still opens phone auth. After OTP, `returnTo` restores `/(tabs)/cart` when the guest opened the tab. |
| Badge | Tab badge from `itemCount`, else `totalQuantity`, else unique line count from `GET /cart`. Shared query with the Cart screen. |
| Options | Option summary from cart payload labels/`optionsSummary`. Invalid options stay on the line; customer is sent to `/product/[id]`. No Cart option selector. |
| Pricing | Backend totals only (subtotal, discount, tax, delivery fee if returned, total). Integer paise via `formatPaise`. No frontend price math. |
| Quantity | Shared `QuantitySelector`; loading on the mutating line; previous quantity kept on failure. Min/max from API when present. |
| Remove | Confirm dialog, then `DELETE`. Item stays until 2xx. |
| Coupon | `CouponInput` → backend validate/stack. Success only after 2xx. |
| Checkout CTA | Enabled when the cart is valid. Navigates to `/checkout`. Guests are sent to phone OTP with `returnTo` `/checkout`. |
| Custom cake | Not implemented. Wedding/Birthday cakes and cookies are normal cart lines. |

### Divergence from earlier analysis

1. Guest local draft cart / merge is not implemented.
2. Notifications, Settings, Legal, and Support Hub remain later phases.
3. `POST /cart/revalidate` is invoked from Checkout immediately before `POST /checkout`.

---

## 25. Phase 8 As-Built (Checkout & Fulfilment)

| Area | Decision |
|---|---|
| Checkout route | `app/checkout/index.tsx` — one canonical Checkout. Cart CTA → `/checkout`. Back → Cart. |
| Payment boundary | `app/payment/index.tsx` — Phase 9 now owns Razorpay + confirm. Checkout still only `POST /checkout` then navigates. |
| Address routes | `/addresses` (book + `?select=1`), `/addresses/form` (create/edit + map). Profile → Addresses. |
| Auth | Guest checkout blocked. Existing `authIntent.returnTo` → `/checkout` after OTP. No `checkoutAuth.ts`. |
| Server state | RTK Query: `addressApi`, `fulfilmentApi`, `checkoutApi`, `storeCreditApi`; store credit apply/remove on `cartApi`. Temporary fulfilment/address/slot selection is Checkout local state + in-memory `checkoutSelection`. |
| Cart | Checkout loads `GET /cart`. Empty cart → EmptyState + Continue shopping. Compact `CartItem` review; edits return to Cart. |
| Address | CRUD via `/addresses`. Default preselected only when `isDefault === true`. Delete confirms; selected checkout address is cleared if deleted. Google Maps pin → `lat`/`lng`. |
| Fulfilment | `DELIVERY` / `PICKUP` local state. Delivery: address + `POST /fulfilment/serviceability`. Pickup: `GET /fulfilment/pickup-info`. No production-house picker. |
| Scheduling | `GET /fulfilment/slots?date&fulfilmentType`. ASAP only if `asapAvailable`. Dates from backend `availableDates` (fallback: currently queried date). Slot `id` is the identifier. |
| Coupon | Reuses Phase 7 `applyCoupon` / `removeCoupon`. No local discount math. |
| Store credit | `GET /store-credit`. Apply `{ max: true }` **[CONFIRM]**. Remove `DELETE /cart/store-credit`. |
| Totals | `CartSummary` from cart payload (integer paise / `formatPaise`). Checkout hides possibly stale cart delivery fee; serviceability shows backend fee. Tax only if backend returns it. |
| Continue to Payment | Disabled while loading / invalid cart / address required / not serviceable / slot missing. Flow: revalidate → if changes stay → else `POST /checkout` with reused UUID. |
| Idempotency | `expo-crypto` UUID. Same fingerprint retries reuse the key. Sent as `Idempotency-Key` header and body `idempotencyKey` **[CONFIRM]**. |
| Explicitly not implemented | Orders, order history, reorder, tracking, rider chat/call, custom cakes, `POST /products/quote`, `POST /cart/merge`. |

### Divergence from earlier analysis

1. Payment is implemented in Phase 9 (`/payment` + `/order-confirmation`).
2. Store-credit apply uses `{ max: true }` until OpenAPI confirms `amount` vs `max`.
3. Slot list cache is keyed by date, fulfilment, address id, and cart revision without sending undocumented extra query params.

Phase 8 is **implemented**. Phase 9 (Payment + Order Confirmation) is **implemented**.

---

## 26. Phase 9 As-Built (Payment + Order Confirmation)

| Area | Decision |
|---|---|
| Payment route | `app/payment/index.tsx` — summary + Pay Now. Does not call `POST /checkout`. Does not show checkoutId / razorpayOrderId. |
| Confirmation route | `app/order-confirmation/index.tsx` — success only after backend confirm. `gestureEnabled: false`. Android back → Home. |
| Razorpay | `react-native-razorpay` 3.0.0 via `src/services/razorpayCheckout.ts`. Hosted UI only. No card/CVV/UPI PIN collection. |
| Expo | Native module. Needs `npx expo prebuild` / `expo run:android` / `expo run:ios` or EAS. Not Expo Go. iOS `LSApplicationQueriesSchemes`: tez, phonepe, paytmmp. |
| Public key | `EXPO_PUBLIC_RAZORPAY_KEY_ID`. Secret never in client, `app.json`, SecureStore, or logs. |
| Initiate | `POST /payments/razorpay/initiate` only if checkout did not already return Razorpay order + amount. Body `{ checkoutId, idempotencyKey }` **[CONFIRM]**. |
| Confirm | `POST /payments/razorpay/confirm` with Razorpay callback fields. Backend verifies. Frontend does not HMAC. |
| Amount | Backend integer paise. Mismatch vs displayed total → “Your total has changed. Please review your order.” → Checkout. Currency other than INR (when present) → do not open Razorpay. Omitted currency sent as `INR` to the SDK **[CONFIRM]**. |
| State machine | IDLE → PREPARING → RAZORPAY_OPEN → VERIFYING → CONFIRMED / FAILED / CANCELLED / UNKNOWN. Pay Now only from IDLE. Try Again from FAILED/CANCELLED. UNKNOWN retries confirm only. |
| Idempotency | Initiate key reused per checkout attempt. Confirm key reused per Razorpay payment id retry. Checkout UUID remains Phase 8. |
| Cart | On verified confirm: invalidate Cart LIST + StoreCredit, then `GET /cart`. Never `items = []` locally. Never clear cart before confirm. |
| Confirmation data | `orderNumber` if backend returns it (no local `ORD-`). Total/fulfilment/slot from confirm response, with checkout session labels as fallback. |
| Navigation | Cart → Checkout → Payment → `replace` Order Confirmation. View Order → `/orders/[id]` when `orderId` is present. Continue Shopping → `replace /(tabs)`. |
| Recovery | No payment-status GET. App kill clears in-memory session/confirmation — do not assume success/failure on relaunch. Logout clears payment session + confirmation; customer stays logged in after pay. |
| Explicitly not implemented in Phase 9 | Notifications, custom payment UI, Stripe/PayPal/etc. Orders belong to Phase 10. |

### Divergence from earlier analysis

1. G3 Payment Processing and G5 Payment Failed are states on Payment, not separate routes.
2. No status polling; uncertain states retry `POST /payments/razorpay/confirm`.
3. Order list/detail/tracking/chat are Phase 10.

Phase 9 is **implemented**. Phase 10 (Orders + post-purchase) is **implemented**.

---

## 27. Phase 10 As-Built (Orders + Post-Purchase)

| Area | Decision |
|---|---|
| Routes | `/orders` list; `/orders/[id]` detail; `/tracking`, `/rider-chat`, `/cancel`, `/complaint` nested. Not a bottom tab. Entry: Profile + Order Confirmation View Order. |
| List | One screen, Active / Past / Cancelled. Fetches only the visible tab. Page pagination like reviews. FlashList + OrderListSkeleton. |
| Detail | `GET /orders/{id}` only. No object in navigation. 403/404 → “Order not found”. Pull-to-refresh. No order-detail polling. |
| Status | `src/utils/orders.ts` maps known codes to Confirmed / Preparing / Ready / Out for Delivery / Delivered / Cancelled. Unknown codes use backend labels. |
| Cancel | Shown only if eligibility `allowed`. Q37 reasons + Other. Refund from backend paise. Same idempotency key on retry. |
| Reorder | `POST /orders/{id}/reorder`. Double-tap protected. Navigate to Cart only after cartUpdated. Current cart prices apply. |
| Invoice | Lazy `GET /orders/{id}/invoice`. System browser. URL not logged or stored. |
| Tracking | Separate cache. 15s poll while focused. Google Maps rider + destination + point polyline. Stale copy only if `updatedAt` exists. |
| Rider | Display-safe fields. Call Rider via `tel:` when a number exists. Chat/Call hidden without backend flags. |
| Chat | FlashList, chronological, 10s poll while focused, send disabled while in flight, draft kept on failure. |
| Reviews | Reuses Phase 6 `GET /orders/{id}/reviewable-items` + `/review/write`. Real `orderItemId`. |
| Complaint | Shown only if `complaintAllowed`. `POST /support/tickets` + ≤3 photos. No Support Hub. Eligibility API **[CONFIRM]**. |
| Auth | Bearer via `baseApi`. `resetApiState()` on logout clears Order/Tracking/RiderChat/Support tags. |
| Explicitly not implemented | Notifications center, push, Support Hub, Settings, Legal, Force Update, Maintenance, Store Credit standalone screen, Rider/Admin apps, custom cake. |

### Divergence from earlier analysis

1. Invoice and reorder results are not separate routes.
2. No WebSocket; conservative polling on Tracking and Chat screens only.
3. Complaint uses documented support ticket create, not an invented return-window API.

Phase 10 is **implemented**. Do **not** start Phase 11 until requested.

---

*End of frontend architecture.*
