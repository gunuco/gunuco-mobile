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
| 401 handling | Single-flight refresh mutex; failure → `markSessionExpired` modal |
| Logout | Calls logout API then clears SecureStore + RTK cache |
| Entry | `/` redirects to `/(tabs)` |
| Design gallery | Moved to `/design-system` (dev validation) |

Do **not** start Phase 3 (Home) until requested.

---

*End of frontend architecture.*
