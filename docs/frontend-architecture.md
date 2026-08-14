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
├── orders/                 # list, [id], tracking, chat, cancel, review
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
| Guest cart draft | ephemeral/local until merge **[CONFIRM]** |
| Cart (logged-in) | RTK Query `cartApi` |

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
deliveryApi.ts
orderApi.ts
paymentApi.ts
offerApi.ts
storeCreditApi.ts
trackingApi.ts
chatApi.ts
notificationApi.ts
supportApi.ts
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

```text
Checkout → payments/razorpay/initiate
  → open Razorpay SDK
  → return → poll/confirm via backend
  → only then Order Confirmation
```

Full payment only. Store credit applied server-side before residual Razorpay charge.

---

## 10. Maps & Tracking

- Address form: Google Maps pin
- Live tracking: rider coordinates from tracking API; map component shared
- Call: use backend-provided number/token
- Chat: RTK Query + polling or socket **[CONFIRM transport]**

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

Phase 6 (Wishlist + Ratings & Reviews) is **implemented**. Do **not** start Phase 7 (Cart screen) until requested.

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
| Add to Cart | Signed-in customers call `POST /cart/items`. Success copy only after 2xx. Guests are sent to phone auth. No local guest cart. Cart tab remains a placeholder. |
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

*End of frontend architecture.*
