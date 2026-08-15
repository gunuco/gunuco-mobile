# GUNUCO Customer App — Phase 12 Performance Audit

> Static review 15 Aug 2026. No React DevTools session and no production bundle size capture in this environment.
> Status: PASS | PARTIAL | FAIL | CONFIRM | NOT TESTED.

---

## 1. Startup

Bootstrap order (unchanged):

```text
Theme restore (SecureStore)
  → GET /app/config (fail-open)
  → Auth restore (refresh + GET /customers/me if tokens)
  → Hide splash
```

| Call | Class | Notes |
|---|---|---|
| Theme restore | Required | Local |
| `GET /app/config` | Required | Lifecycle gate |
| `POST /auth/token/refresh` | Required if tokens | |
| `GET /customers/me` | Required if session | |
| Push token register | Lazy | After auth + permission + gate `none` |
| Home / catalogue | Lazy | First Home paint |
| Config on foreground | Optional | Phase 12 AppState `active` refetch; fail-open |

Splash is hidden when theme + config + auth status are ready. Config failure does not block. Bootstrap failure clears session rather than hanging splash.

Duplicate startup calls: **not observed** in code (single `useSessionBootstrap` ref guard). Device **NOT TESTED**.

## 2. API calls / caching

| Pattern | Status | Notes |
|---|---|---|
| One `baseApi` | PASS | |
| RTK Query tags + invalidation | PASS | Cart, Wishlist, Order, etc. |
| Logout / 401 cache reset | PASS | Phase 12 401 path now resets |
| 30s timeout | PASS | Avoids hung requests |
| No N+1 product-detail from lists | PASS | Listings use list payloads; wishlist add-to-cart opens PDP when options unknown |
| WishlistButton shared query | PASS | One `GET /wishlist` when authenticated |
| Cart badge + Cart tab | PASS | Shared `GET /cart` |
| Tracking poll | PASS | 15s while focused; stopped when delivered/cancelled/unavailable or blur |
| Rider chat poll | PASS | 10s while focused |
| Mutation auto-retry | PASS | Not used for payment/cancel/reorder/support/review |

## 3. Lists

FlashList is used for: Home carousels, product grids, cart lines, orders, reviews, notifications, tickets, rider chat, support messages.

Tracking and Profile use `ScrollView` (short content). **Do not** convert those to FlashList.

## 4. Images

| Check | Status | Notes |
|---|---|---|
| `GImage` / expo-image cache | PASS | Memory-disk |
| Broken image fallback | PASS | GImage |
| Arbitrary URL rendering | PASS | GImage layer |
| Thumbnail vs full-res | CONFIRM | Depends on backend image URLs |

## 5. Rendering

| Check | Status | Notes |
|---|---|---|
| `ProductCard` memo | PASS | Already memoized |
| No blanket useMemo/useCallback | PASS | Phase 12 did not add memo everywhere |
| Tracking `setState` during render | PASS | Moved to `useEffect` (Phase 12) |

## 6. Memory / listeners

| Listener | Cleanup | Status |
|---|---|---|
| AppState config recheck | `remove()` | PASS |
| Push token refresh | `subscription.remove()` | PASS |
| Notification response | `remove()` | PASS |
| Tracking poll | `pollingInterval: 0` when unfocused | PASS |
| Chat poll | same | PASS |
| Splash hide | one-shot | PASS |

Unbounded caches: RTK default cache. Message history is per-thread query. **NOT TESTED** under long sessions.

## 7. Bundle / dependencies

Required native modules: Razorpay, maps, notifications, secure-store, image, image-picker, web-browser.

No new libraries added in Phase 12.

App size / EAS bundle inspect: **NOT TESTED** (no production build in this environment).

## 8. Screen API notes (high traffic)

| Screen | APIs | Cache | Trigger | Duplicate risk |
|---|---|---|---|---|
| Home | `GET /customer/home` | Home tag | Mount / refresh | Low |
| Search | `GET /products/search` | Serialized args | Debounced query | Low |
| Product | detail + options | Product id | Mount | Low |
| Cart | `GET /cart` | Cart LIST | Mount / focus mutations | Shared with badge |
| Checkout | cart + addresses + fulfilment + store credit | Multiple | Mount | Intentional |
| Payment | initiate/confirm | None | Pay tap | Double-tap blocked |
| Orders | `GET /orders` visible tab | Order LIST | Tab change | One tab at a time |
| Tracking | tracking + rider | Isolated tags | Focus + poll | Stops on blur |
| Notifications | `GET /notifications` | Notification LIST | Mount / pages | Skip if guest |
| Support | tickets list | Support LIST | Mount / pages | Skip if guest |

## 9. Results

| Area | Status |
|---|---|
| Architecture | PASS |
| Startup sequence | PASS (code) / NOT TESTED (device) |
| Lists / images | PASS |
| Measured FPS / TTI | NOT TESTED |
| Bundle size | NOT TESTED |

---

*End of performance audit.*
