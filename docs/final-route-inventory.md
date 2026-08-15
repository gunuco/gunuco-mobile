# GUNUCO Customer App — Final Route Inventory

> Phase 12. Routes that exist in `app/`. Do not document screens that are not implemented.
> Auth: **Public** = guest OK. **Auth** = signed-in; guests see sign-in / are sent to `/(auth)/phone`.
> Deep links use IDs only. Backend remains authoritative for ownership.

---

| Route | Authentication | Purpose | Deep-link capable | Backend data |
|---|---|---|---|---|
| `/` | Public | Redirects into tabs after bootstrap | No | Config + session restore (bootstrap) |
| `/(tabs)` | Public | Tab shell: Home, Search, Categories, Cart, Profile | No | — |
| `/(tabs)/` (Home) | Public | Aggregated Home | No | `GET /customer/home` |
| `/(tabs)/search` | Public | Catalogue search | No | `GET /products/search` |
| `/(tabs)/categories` | Public | Main categories | No | `GET /categories` |
| `/(tabs)/cart` | Auth to load cart | Common cart | No | `GET /cart` + cart mutations |
| `/(tabs)/profile` | Public hub; private rows gated | Account hub | No | `GET /customers/me` when signed in |
| `/(auth)/phone` | Public | Phone login | No | `POST /auth/otp/request` |
| `/(auth)/otp` | Public | OTP verify | No | `POST /auth/otp/verify` |
| `/category/[id]` | Public | Main category / subcategories | ID only | Categories tree |
| `/category/[id]/products` | Public | Product listing | ID only | `GET /categories/{id}/products` |
| `/product/[id]` | Public | Product Details + options | ID only | `GET /products/{id}`, `/options` |
| `/product/[id]/reviews` | Public | Approved reviews | ID only | `GET /products/{id}/reviews` |
| `/review/write` | Auth (`orderItemId` query) | Write review | `orderItemId` (+ optional productId) | `POST /reviews`; eligibility via order |
| `/wishlist` | Auth to load | Wishlist | No | `GET/POST/DELETE /wishlist/...` |
| `/checkout` | Auth | Checkout + fulfilment | No | Cart, addresses, fulfilment, store credit, `POST /checkout` |
| `/addresses` | Auth | Address book (`?select=1` from Checkout) | No | `GET/PATCH/DELETE /addresses` |
| `/addresses/form` | Auth | Create/edit address + map | No | `POST/PATCH /addresses` |
| `/payment` | Auth (`checkoutId` query) | Razorpay pay + backend confirm | No | `POST /payments/razorpay/initiate`, `/confirm` |
| `/order-confirmation` | Auth (in-memory confirm) | Success after backend verify | No | Confirm payload in memory only |
| `/orders` | Auth | Active / Past / Cancelled | Possible via notification `returnTo` | `GET /orders` |
| `/orders/[id]` | Auth | Order detail | Yes | `GET /orders/{id}` |
| `/orders/[id]/tracking` | Auth | Live tracking | Yes | `GET /orders/{id}/tracking`, `/rider` |
| `/orders/[id]/rider-chat` | Auth | Rider chat | No (from order/tracking) | Rider chat GET/POST |
| `/orders/[id]/cancel` | Auth | Cancel order | No | Eligibility + `POST /orders/{id}/cancel` |
| `/orders/[id]/complaint` | Auth | Complaint / return request | No | `POST /support/tickets` |
| `/notifications` | Auth | Inbox | Yes (inbox itself) | `GET /notifications` |
| `/support` | Auth | Ticket list | No | `GET /support/tickets` |
| `/support/create` | Auth | Create ticket | No | `POST /support/tickets` |
| `/support/[id]` | Auth | Ticket thread | Yes | `GET /support/tickets/{id}` |
| `/profile/edit` | Auth | Edit name/email | No | `GET/PATCH /customers/me` |
| `/profile/change-phone` | Auth | Request phone-change OTP | No | `POST /auth/phone/change/request` |
| `/profile/change-phone-otp` | Auth | Verify phone-change OTP | No | `POST /auth/phone/change/verify` |
| `/settings` | Public | Theme, OS notification settings, about, logout | No | Local SecureStore theme |
| `/legal` | Public | Legal hub | No | — |
| `/legal/[type]` | Public | Terms / Privacy / Refund / Cancellation | Type only | `GET /legal/{type}` |
| `/store-credit` | Auth | Balance + history | No | `GET /store-credit` |
| `/design-system` | `__DEV__` only | Token gallery | No | — |
| `/+not-found` | Public | Unknown route | No | — |

Maintenance and Force Update are **not routes**. They replace the navigator when `GET /app/config` evaluates to those gates.

---

## Not implemented as routes

| Listed in older inventory | Actual |
|---|---|
| Onboarding carousel | Not implemented |
| Offer List / Offer Detail | Home `OfferSection` only |
| Separate Payment Processing / Payment Failed screens | States on `/payment` |
| Invoice viewer screen | Backend HTTPS URL in system browser |
| Reorder result screen | Cart after backend reorder |
| Custom Cake screens | Not implemented (GUNUCO decision) |

---

## Navigation security

| Rule | Status |
|---|---|
| Tokens / OTP / challengeId not in URLs | PASS (challenge in memory) |
| Payment objects not in route params | PASS (`checkoutId` only) |
| Order / ticket / product fetched by ID | PASS |
| Auth intent in memory, consumed after OTP | PASS (Phase 12 also clears stale intent on Profile sign-in and session-expired sign-in) |

---

*End of route inventory.*
