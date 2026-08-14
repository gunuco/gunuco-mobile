# GUNUCO Phase 1–4 Compliance Audit

> Audited against (priority order): `CURSOR_MASTER_INSTRUCTIONS.md` → `GUNUCO_PRODUCT_DECISIONS.md` → `GUNUCO_PLAN/` → `docs/` → existing implementation.
>
> Scope: **existing Phase 1–4 code only**. No Phase 5 work. No implementation changes in this pass.
>
> Date: 14 Aug 2026.

---

## Executive Summary

**Overall compliance: Mostly compliant (~86%).**

Phase 1–4 is aligned with the **final GUNUCO product decisions** for the work that was supposed to exist by now:

- Customer-only Expo app for Android + iOS
- Phone + OTP (no password)
- Guest browsing
- SecureStore access/refresh tokens
- RTK Query for all live APIs (no fetch/axios from screens)
- Aggregated Home feed matching Q15 (no BigBasket-invented sections)
- Generic Category → Subcategory → Product architecture
- Search with approved filters/sorts
- No custom-cake, referral, multi-language, Rider, or Admin modules

There are **no CRITICAL product-decision conflicts** in the shipped Phase 1–4 surface.

There **are HIGH items** that will bite later phases (especially Product Detail, Cart, Checkout) if left unfixed: stale-token 401s on public browse, unpersisted theme preference, pagination contract fragility, and a few UX no-ops that look like broken commerce.

`GUNUCO_PLAN` still describes custom cakes, 50% advance payment, and older subcategory names (`Cakes & Wedding Cakes`). Those are **superseded**. The implementation correctly follows `GUNUCO_PRODUCT_DECISIONS.md`, not the older plan.

---

## Phase 1 Findings

| ID | Finding | Class |
|---|---|---|
| P1-1 | Stack matches master: Expo 57, RN 0.86, React 19.2, Expo Router, RTK + RTK Query, Reanimated, Gesture Handler, FlashList, SecureStore, ESLint, Prettier, TypeScript strict. | **ACCEPTABLE** |
| P1-2 | Folder structure matches the intended `app/` + `src/{components,design-system,store,services,hooks,utils,config,types}` layout. Feature routes for later phases are not pre-created (intentional). | **ACCEPTABLE** |
| P1-3 | Design tokens live in `src/design-system/` (colors, typography, spacing, dimensions, radius, shadows, animations, theme). Light + dark exist. | **ACCEPTABLE** |
| P1-4 | Master asked for z-index/elevation tokens. Elevation is only via `shadows.ts`; no dedicated z-index scale. | **LOW** |
| P1-5 | Env is centralized in `src/config/env.ts` via `EXPO_PUBLIC_*`. Screens do not hard-code API URLs. | **ACCEPTABLE** |
| P1-6 | `app.json` `extra.appEnv` is hard-coded `"development"` and does not follow the env files. | **MEDIUM** |
| P1-7 | Redux holds only `auth` + `settings`. Server data is RTK Query. No duplicated catalogue slices. | **ACCEPTABLE** |
| P1-8 | Empty RTK injectors remain for cart/address/order/payment/notification. Fine as placeholders; do not invent endpoints. | **ACCEPTABLE** |
| P1-9 | No axios. No `fetch(` in app/src. All live calls go through RTK Query. | **ACCEPTABLE** |
| P1-10 | `src/features/` is empty (`.gitkeep` only). Not a problem at this phase. | **ACCEPTABLE** |
| P1-11 | No i18n string map. Q45 is English-only, but decisions asked to avoid scattering strings. Copy is inlined in screens. | **LOW** |
| P1-12 | Jest/tests are a README placeholder. Documented; not a Phase 1–4 blocker. | **ACCEPTABLE** |
| P1-13 | Maps / Razorpay / Push not installed. Correct — those belong to later phases. | **ACCEPTABLE** |
| P1-14 | Profile exposes the design-system gallery in all builds (`/design-system`). Should be `__DEV__`-only before any store build. | **MEDIUM** |

---

## Phase 2 Findings

| ID | Finding | Class |
|---|---|---|
| P2-1 | Auth is Phone + OTP only. No password UI, no password storage. | **ACCEPTABLE** |
| P2-2 | Endpoints match docs: `/auth/otp/request`, `/auth/otp/verify`, `/auth/token/refresh`, `/auth/logout`, `/customers/me`. | **ACCEPTABLE** |
| P2-3 | Tokens stored only in `expo-secure-store` (`src/services/secureStorage.ts`). No AsyncStorage for secrets. | **ACCEPTABLE** |
| P2-4 | Guest can use tabs without login. Profile offers Sign in / Continue as guest. Cart placeholder already states checkout will require sign-in. | **ACCEPTABLE** |
| P2-5 | Cold start: refresh token → `/auth/token/refresh` → `/customers/me`. Stay logged in until logout. | **ACCEPTABLE** |
| P2-6 | Logout calls logout API then clears SecureStore + RTK cache. | **ACCEPTABLE** |
| P2-7 | 401 refresh uses a mutex and `rawBaseQuery` for the refresh call (avoids a refresh loop on that path). | **ACCEPTABLE** |
| P2-8 | **Stale/invalid access tokens are still attached to every request**, including public Home/Categories/Search. A 401 on a public endpoint triggers refresh; failure shows Session Expired even for browse. This fights Q3 guest browsing. | **HIGH** |
| P2-9 | After a failed refresh, waiters retry the original request with the same dead token (`baseApi.ts` else branch). Can cause a burst of 401s. | **HIGH** |
| P2-10 | OTP `challengeId` (and phone) travel in Expo Router params. Not a token, but it can leak via logs/screenshots. Prefer memory/store for challenge. | **MEDIUM** |
| P2-11 | OTP length is hard-coded to 6. Backend may differ. Fine until OpenAPI confirms. | **LOW** |
| P2-12 | India +91 phone helpers are client UX only. Backend remains authoritative. | **ACCEPTABLE** |
| P2-13 | After OTP success the app always `replace('/(tabs)')`. Return-to-checkout is not implemented. Correct for now; **must exist before Checkout**. | **HIGH** (future-phase, not a Phase 2 defect vs current scope) |
| P2-14 | Session Expired modal allows Continue browsing — correct for guest-browse product. | **ACCEPTABLE** |
| P2-15 | Phone-change OTP (Q4) is not built. Out of Phase 2–4 scope. | **ACCEPTABLE** |
| P2-16 | Copy says “one-time password” meaning OTP, not password auth. | **ACCEPTABLE** |

---

## Phase 3 Findings

| ID | Finding | Class |
|---|---|---|
| P3-1 | Home uses `GET /customer/home` via `useGetHomeQuery` only. | **ACCEPTABLE** |
| P3-2 | Sections match Q15: banners, active main categories, subcategories, featured, best sellers, offers, recommended. | **ACCEPTABLE** |
| P3-3 | No recently viewed / buy again / grocery aisles / BigBasket-only modules. | **ACCEPTABLE** |
| P3-4 | Extra Home fields `deliveryContext` and `unreadNotificationCount` support location + notification entry required by screen inventory. Not invented commerce sections. | **ACCEPTABLE** |
| P3-5 | States exist: skeleton, loaded, empty + retry, error + retry, pull-to-refresh. | **ACCEPTABLE** |
| P3-6 | Images use `GImage` + `expo-image` `memory-disk` cache. | **ACCEPTABLE** |
| P3-7 | Horizontal FlashLists for banners/categories/offers/products. | **ACCEPTABLE** |
| P3-8 | Home wraps several FlashLists in a vertical `ScrollView` (nested virtualization). Acceptable for a short feed; watch jank. | **MEDIUM** |
| P3-9 | Featured/Best sellers/Recommended show **Add** with a no-op handler. Looks like a broken CTA. Wishlist hidden (deferred). | **MEDIUM** |
| P3-10 | Location, notifications, offer press are stubs. Correct for phase scope. | **ACCEPTABLE** |
| P3-11 | Home does not locally filter `isActive`. Relies on Home API to return only active mains. Matches “backend authoritative”. | **ACCEPTABLE** |
| P3-12 | Category/product navigation from Home is wired to `/category/[id]` and `/product/[id]`. | **ACCEPTABLE** |

---

## Phase 4 Findings

| ID | Finding | Class |
|---|---|---|
| P4-1 | Categories come from `GET /categories`. No hard-coded Cakes-only tree, and no hard-coded Coffee/Pizza/Burgers as launch tiles. | **ACCEPTABLE** |
| P4-2 | UI shows a category only when `isActive !== false`. Combined with API “only active for customer”, launch future categories stay hidden **if the backend omits or flags them**. If the backend sends a full tree **without** `isActive`, unmarked future mains would appear. | **HIGH** |
| P4-3 | Main → subcategory grid → `/category/[id]/products` is generic. Leaf categories auto-replace to the product list. Matches D1/D2. | **ACCEPTABLE** |
| P4-4 | Same product-list screen serves main or subcategory IDs. Good for future categories. | **ACCEPTABLE** |
| P4-5 | Search is `GET /products/search` with debounce 350ms, min 2 chars, skip until then. RTK Query cache + in-flight replacement. | **ACCEPTABLE** |
| P4-6 | Filters: subcategory (search), price min/max (paise), backend `availableFilters`. Sort: backend `availableSorts` or approved defaults Popular / Price↑↓ / Newest. | **ACCEPTABLE** |
| P4-7 | Shared `CatalogToolbar` / `FilterSheet` / `SortSheet` used by Category listing **and** Search. No duplicate filter systems. | **ACCEPTABLE** |
| P4-8 | Pagination uses RTK `serializeQueryArgs` (strip page) + `merge`. If the backend omits `page` on the response, `newItems.page <= 1` is false (`undefined <= 1`), so page 1 can be concatenated repeatedly. `hasMore` missing is treated as false (safer). | **HIGH** |
| P4-9 | Pull-to-refresh + retry + skeleton + empty + error exist on category tree, product listing, and search. | **ACCEPTABLE** |
| P4-10 | Product listing/search hide Add and Wishlist (Phase 5/cart/wishlist). Home still shows Add. Inconsistent but not a product-rule break. | **MEDIUM** |
| P4-11 | `/product/[id]` is a placeholder only. Required by Phase 4 (“prepare navigation, do not build PDP”). | **ACCEPTABLE** |
| P4-12 | Search empty copy uses cake examples (Chocolate Cake, Birthday Cake, …). Catalogue-driven, not grocery search. | **ACCEPTABLE** |
| P4-13 | Search does not hard-limit to a Cakes category id. Backend must restrict inactive catalogues. Matches “do not duplicate backend catalogue rules”. | **ACCEPTABLE** |
| P4-14 | Expo `typedRoutes` did not pick up new routes; href helpers use `as unknown as Href`. Works, but typed navigation is weakened. | **LOW** |
| P4-15 | Filter price input uses `Math.round(rupees * 100)` (float). Q31 wants integer paise. Risk is small for UX input; still not the money helper we want long-term. | **MEDIUM** |
| P4-16 | No recent-search storage. Not required by product decisions. | **ACCEPTABLE** |
| P4-17 | `ProductGridList` `loading` prop is largely unused (screens use an external skeleton). Harmless. | **LOW** |

---

## Design System Findings

| ID | Finding | Class |
|---|---|---|
| DS-1 | Screens consume `useTheme()` tokens for canvas, text, spacing, radius, brand. Changing `colors.ts` / `spacing.ts` flows through shared primitives. | **ACCEPTABLE** |
| DS-2 | No second Home/Search/Category design system. | **ACCEPTABLE** |
| DS-3 | Hard-coded layout numbers remain inside shared components (`CategoryCard` width 120, `OfferCard` 200/148/72, carousel heights 160/280, `GChip` minHeight 32, `OtpInput` 44). Not screen-level duplication, but not tokenized. | **MEDIUM** |
| DS-4 | `app/+html.tsx` uses raw `#fff` / `#000` (web-only Expo shell). Customer app is Android + iOS. | **LOW** |
| DS-5 | Brand hex values are provisional cocoa/cream until Q46 assets. Documented. | **ACCEPTABLE** |
| DS-6 | Dark mode tokens exist and Profile can switch Light/Dark/System. **Preference is not persisted** — restart returns to `system`. Architecture said SecureStore or AsyncStorage. | **HIGH** |
| DS-7 | Missing inventory primitives (`GSwitch`, `GCheckbox`, `ListRow`, etc.) are later-phase. Not a Phase 1–4 fail. | **ACCEPTABLE** |
| DS-8 | `BottomSheet` is Modal-based, not `@gorhom/bottom-sheet`. Documented; fine until gesture sheets are required. | **ACCEPTABLE** |

**Duplication check:** one `ProductCard`, one `CategoryCard`, one `SearchBar`, one `Header`, one `EmptyState` / `ErrorState`. No HomeProductCard / SearchProductCard forks.

---

## API Findings

### Live endpoints (Phase 1–4)

| Module | Calls | Used by |
|---|---|---|
| `authApi` | OTP request/verify, refresh, logout, `customers/me` | Auth screens, session service, `baseApi` |
| `homeApi` | `GET /customer/home` | Home tab |
| `categoryApi` | `GET /categories`, `GET /categories/{id}/products` | Categories tab, category screens, search subcategory chips |
| `productApi` | `GET /products/search` | Search tab |

### Architecture

| ID | Finding | Class |
|---|---|---|
| API-1 | UI → RTK Query hooks → `baseApi` `fetchBaseQuery`. No presentation-layer fetch/axios. | **ACCEPTABLE** |
| API-2 | `prepareHeaders` attaches Bearer whenever an access token exists, including guest-public GETs. See P2-8. | **HIGH** |
| API-3 | Categories `transformResponse` accepts `{categories}`, `{data}`, or a raw array. Does not invent URLs; it does invent envelope tolerance. | **ACCEPTABLE** (pragmatic) |
| API-4 | Pagination/filter query param names (`page`, `sort`, `priceMin`, `priceMax`, plus backend filter ids) match `docs/api-requirements.md`. Exact OpenAPI still **[CONFIRM]**. | **ACCEPTABLE** |
| API-5 | Product detail / options / wishlist / cart APIs are not implemented. Correct. | **ACCEPTABLE** |
| API-6 | `configApi` (force update / maintenance) is reserved in tag types only. Root layout does not gate on app config. Out of Phase 1–4 screen scope; **needed before store release**, not before Phase 5 PDP. | **MEDIUM** |
| API-7 | Error mapper covers CATEGORY_* / PRODUCT_* / SEARCH_INVALID plus HTTP classes. Q52 codes (CART_*, PAYMENT_*, SLOT_*, etc.) are not mapped yet. Fine until those phases; unmapped `message` is shown raw. | **MEDIUM** |

---

## Security Findings

| ID | Finding | Class |
|---|---|---|
| SEC-1 | Tokens in SecureStore, never logged (`console.*` unused in src/app). | **ACCEPTABLE** |
| SEC-2 | No Razorpay keys, API secrets, or card storage in the client. | **ACCEPTABLE** |
| SEC-3 | `.env.development/.staging/.production` are committed. They contain only `EXPO_PUBLIC_*` placeholder base URLs (not secrets). Gitignore ignores `.env` and `.env*.local`. | **ACCEPTABLE** |
| SEC-4 | Production placeholder `https://api.gunuco.com` is public by Expo design. Confirm it stays a placeholder until real infra exists. | **LOW** |
| SEC-5 | No extra Android/iOS permissions requested yet (location, camera, notifications). Good. | **ACCEPTABLE** |
| SEC-6 | `getErrorMessage` may surface backend `message` when `code` is unmapped. Risk of leaking internal wording (not correlation-id extraction, which is absent — good for Q53). | **MEDIUM** |
| SEC-7 | Challenge id in route params (P2-10). | **MEDIUM** |
| SEC-8 | Untrusted client: prices come from API types as integer paise; no client-side pricing engine. | **ACCEPTABLE** |

---

## Performance Findings

| ID | Finding | Class |
|---|---|---|
| PERF-1 | Product grids use FlashList `numColumns={2}`. | **ACCEPTABLE** |
| PERF-2 | Search is debounced; queries skipped under 2 characters. | **ACCEPTABLE** |
| PERF-3 | RTK caches Home, category tree, and merged product pages. | **ACCEPTABLE** |
| PERF-4 | `ProductCard` / carousels / `ProductGridList` are memoized with a reason (list cells). Not blanket memo. | **ACCEPTABLE** |
| PERF-5 | Home nested FlashList-in-ScrollView (P3-8). | **MEDIUM** |
| PERF-6 | List images do not pass `recyclingKey`; `GImage` supports it. | **LOW** |
| PERF-7 | Pagination merge does not de-dupe product ids (P4-8 related). | **MEDIUM** |
| PERF-8 | Category products `onRefresh` may `setPage(1)` and `refetch()` (possible double fetch). | **LOW** |
| PERF-9 | `FilterSheet` remount key includes `JSON.stringify(filters)`. Fine at this size. | **LOW** |

Do not prematurely rewrite Home to a single vertical FlashList unless jank is measured.

---

## Reusability Findings

### Implemented reusable components

| Component | Used on | Reusable | Duplicates | Typed | Tokens |
|---|---|---|---|---|---|
| `GText` | Almost every screen | Yes | No | Yes | Yes |
| `GButton` | Auth, Profile, sheets, empty/error | Yes | No | Yes | Yes |
| `GInput` | Phone, FilterSheet | Yes | No | Yes | Yes |
| `GIcon` | Tabs, headers, chips, cards | Yes | No | Yes | Yes |
| `GImage` | Cards, banners, category hero | Yes | No | Yes | Yes |
| `GBadge` | ProductCard, HomeHeader, OfferCard | Yes | No | Yes | Yes |
| `GCard` | Cards, Profile | Yes | No | Yes | Yes |
| `GLoader` | Bootstrap, list footer | Yes | No | Yes | Yes |
| `GChip` | Catalog toolbar/filters | Yes | No | Yes | Partial (`minHeight: 32`) |
| `GDivider` | Gallery / later | Yes | No | Yes | Yes |
| `GModal` | Session expired | Yes | No | Yes | Yes |
| `BottomSheet` | Sort + Filter | Yes | No | Yes | Yes |
| `SearchBar` | Home header, Search tab | Yes | No | Yes | Yes |
| `Skeleton` / `HomeSkeleton` / `ProductListSkeleton` | Home, Categories, Search, listings | Yes | No (variants) | Yes | Yes |
| `EmptyState` / `ErrorState` | Home, Categories, Search, listings | Yes | No | Yes | Yes |
| `Header` | Most stack screens | Yes | No | Yes | Yes |
| `Section` | Home, Categories | Yes | No | Yes | Yes |
| `OtpInput` | OTP screen | Yes | No | Yes | Partial |
| `ProductCard` | Home carousels, ProductGridList | Yes (grid/list/compact) | No | Yes | Yes |
| `CategoryCard` | Home, Categories, category detail | Yes | No | Yes | Partial (width 120) |
| `PriceDisplay` / `RatingView` | ProductCard | Yes | No | Yes | Yes |
| `ProductCarousel` / `CategorySection` / `OfferSection` | Home | Yes | No | Yes | Partial heights |
| `CatalogToolbar` / `FilterSheet` / `SortSheet` / `ProductGridList` | Category products + Search | Yes, shared | No | Yes | Mostly |
| `HomeHeader` / `HomeBannerCarousel` | Home | Screen-specific, inventory-approved | No | Yes | Yes |
| `QuantitySelector` / `AddressCard` / `CartItem` / `OrderCard` | Gallery / future | Built, unused in live flows | No | Yes | Yes |

No duplicate ProductCard family. Wishlist is inlined on `ProductCard`, not a separate `WishlistButton` yet — acceptable until Wishlist phase.

---

## Business Rule Findings

| Rule | Status | Class |
|---|---|---|
| No custom-cake request/quote/image/approval/advance | **Not implemented** | **ACCEPTABLE** |
| Wedding/Birthday = normal catalogue | Generic product list; no cake-only option UI in Phase 4 | **ACCEPTABLE** |
| Cookies = Cakes subcategory | Not hard-coded; comes from category tree | **ACCEPTABLE** |
| No referral / invite | **Not implemented** | **ACCEPTABLE** |
| English only | All copy English; no i18n runtime | **ACCEPTABLE** |
| No Rider/Admin in this repo | Customer app only | **ACCEPTABLE** |
| One common cart | Cart is a placeholder; no custom-cake cart | **ACCEPTABLE** |
| Integer paise | Types + `formatPaise`; filter input uses float multiply (P4-15) | **MEDIUM** |
| Guest checkout NO | Not built; placeholder copy states auth at checkout | **ACCEPTABLE** |
| Full payment / Razorpay | Not in Phase 1–4 | **ACCEPTABLE** |

`GUNUCO_PLAN` custom-cake and 50% advance flows were **not** coded. Correct override.

---

## Future Category Architecture

The catalogue path is already generic:

```text
GET /categories (tree, active-only expected)
  → /category/[id]           (subcategory grid if children)
  → /category/[id]/products  (filters/sort/pagination)
  → /product/[id]            (shell)

GET /products/search         (q + subcategory + price + option filters)
```

No TypeScript enum of `Cakes | Coffee | Pizza | Burgers`. Enabling Coffee later is a **backend/admin activation**, not an app rewrite.

**Caveat (P4-2):** frontend treats missing `isActive` as active. That is safe only if the API truly returns active nodes only.

Product options remain future work (Phase 5+). Nothing in Phase 4 hard-codes cake flavour/egg/sugar fields.

---

## Documentation Consistency

| Doc | vs code | Action |
|---|---|---|
| `docs/frontend-architecture.md` Phase 2–4 as-built | Matches | Keep |
| Same file §17 “Do not begin Phase 2” | Stale | Update when docs are next edited — **do not rewrite in this audit pass beyond this report** |
| `docs/design-system-plan.md` Phase 3–4 notes | Matches | Keep |
| `docs/api-requirements.md` | Logical paths match live modules | Keep; OpenAPI still **[CONFIRM]** |
| `docs/screen-inventory.md` | Home/Search/Categories exist; Cart/Profile/PDP still placeholders; wishlist on listings not shown | Expected for phase |
| `docs/component-inventory.md` | Many later components not built | Expected |
| `GUNUCO_PLAN` subcategory names / custom cake / 50% payment | **Conflicts with product decisions** | Plan is **not** implementation truth |

This audit does **not** rewrite those docs except by adding this file.

---

## Critical Fixes

**None.** No Phase 1–4 behavior currently contradicts a finalized launch rule (custom cake, password auth, insecure tokens, Rider/Admin, inventing grocery Home modules, hard-coding future categories as always-on).

---

## Recommended Fixes

Do these **before or at the start of Phase 5** (Product Details will reuse the same `baseApi` + listing navigation):

1. **HIGH — Public browse vs 401**  
   Do not send `Authorization` on public GETs when the session is unauthenticated, **or** skip refresh/session-expired for Home/Categories/Search. After failed refresh, do not retry waiters with a dead token.

2. **HIGH — Persist theme preference**  
   Save `settings.themePreference` in SecureStore or non-sensitive storage and restore on bootstrap (Q48 + architecture).

3. **HIGH — Pagination merge**  
   Treat missing `page` as `1`. De-dupe `items` by id. Do not append when the server replayed page 1.

4. **HIGH — Active category filter**  
   If `isActive` is present, require `true`. If absent, keep trusting “API returns active only”, and document that contract with backend.

5. **MEDIUM — Hide design gallery in production**  
   Gate Profile → Design system with `__DEV__`.

6. **MEDIUM — Home Add CTA**  
   Hide Add (and Wishlist) on Home carousels until cart/wishlist APIs exist, matching listing cards.

7. **MEDIUM — Error copy**  
   Prefer mapped codes; do not show raw backend `message` unless it is already a customer-safe string.

8. **MEDIUM — OTP challenge**  
   Keep `challengeId` out of the URL.

9. **MEDIUM — `app.json` extra.appEnv**  
   Drive from `EXPO_PUBLIC_APP_ENV`.

10. **LOW — Tokenize leftover magic widths/heights** in `CategoryCard` / `OfferCard` / `GChip`.

---

## Acceptable Existing Decisions

- Expo SDK 57 + FlashList v2 (no `estimatedItemSize`)
- Modal `BottomSheet` instead of Gorhom
- Provisional cocoa/cream tokens until Q46 brand assets
- Not pre-creating checkout/orders/wishlist route trees
- Home sections strictly from `GET /customer/home`
- Generic category tree instead of a Cakes-only UI
- Sort fallbacks matching Q14 when API omits `availableSorts`
- Product route shell without PDP
- Envelope normalization for categories
- Guest-accessible tabs
- SecureStore-only tokens
- No mock/fake backend catalogue

---

## Classification roll-up (for the request’s final output)

See the chat summary after this file for the numbered 1–12 report.

---

# Correction Pass Results

Correction pass executed 14 Aug 2026. No Phase 5 features were added.

| ID | Status |
|---|---|
| P2-8 | **Fixed.** Authorization is attached only when both access and refresh tokens exist. Public catalogue GETs that still 401 retry as guest after tokens are cleared. Session Expired is not shown for those public retries. |
| P2-9 | **Fixed.** Waiters after a failed refresh retry only if a new access+refresh pair exists, or as guest on public GETs. Private requests return the original 401 and do not replay the dead token. |
| DS-6 | **Fixed.** Theme preference is written to SecureStore (`gunuco.settings.themePreference`) and restored during bootstrap before splash hide. |
| P4-2 | **Fixed.** `isCustomerVisibleCategory`: explicit `isActive` must be `true`; omitted flag trusts the active-only `GET /categories` contract. No name-based hiding. Documented in `docs/api-requirements.md`. |
| P4-8 | **Fixed.** List responses normalize `page` from the request when the payload omits it. Page ≤ 1 replaces. Later pages append and de-dupe by product id. Applied to category products and search. |
| P1-14 | **Fixed.** Profile gallery button is wrapped in `__DEV__`. Route `/design-system` remains for development. |
| P3-9 | **Fixed.** Home carousels pass `showAddButton={false}` and `showWishlist={false}`. `ProductCarousel` defaults match. |
| SEC-6 | **Fixed.** `getErrorMessage` maps known business codes and HTTP classes only. Raw backend `message` / `SerializedError.message` are not shown. |
| P2-10 | **Fixed.** OTP `challengeId` lives in in-memory `otpChallenge` service. Route params are not used. Cleared on success, back, and continue-as-guest. |
| P1-6 | **Fixed.** Removed hard-coded `extra.appEnv` from `app.json`. App environment is `EXPO_PUBLIC_APP_ENV` via `src/config/env.ts`. |
| P1-4 | **Deferred.** z-index token scale was not in this correction pass (low, unrelated to the dimension tokenization request). |

Shared catalog dimensions (`categoryCard`, `offerCard`, `catalogRowHeight`, `chipMin`, OTP width → `touchMin`) were moved into `src/design-system/dimensions.ts`. Component-unique values (e.g. carousel skeleton height 260) remain local.

*End of Phase 1–4 GUNUCO compliance audit.*
