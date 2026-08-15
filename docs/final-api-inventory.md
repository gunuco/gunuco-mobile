# GUNUCO Customer App — Final API Inventory

> Phase 12. Every HTTP call the customer app makes goes through **one** `baseApi` (`src/store/api/baseApi.ts`) via `injectEndpoints`.
> No Axios client. No second fetch wrapper.
> Field names remain **[CONFIRM]** until backend OpenAPI is agreed. Frontend does not invent extra endpoints.

Auth Required: **Yes** = Bearer when session tokens exist (private). **No** = anonymous or public browse (token attached only if present). **Anonymous** = never send Bearer (`isAnonymousEndpointName`).

Backend Confirmation: **CONFIRM** = implemented against `docs/api-requirements.md`; OpenAPI not independently confirmed in this phase.

---

## Auth / Customer

| Domain | Method | Endpoint | Auth Required | Purpose | Implemented | Backend Confirmation | Notes |
|---|---|---|---|---|---|---|---|
| Auth | POST | `/auth/otp/request` | Anonymous | Request login OTP | Yes | CONFIRM | Phone only |
| Auth | POST | `/auth/otp/verify` | Anonymous | Verify OTP, return tokens | Yes | CONFIRM | challengeId in body, not URL |
| Auth | POST | `/auth/token/refresh` | Refresh body | Rotate tokens | Yes | CONFIRM | Mutex; one in-flight refresh |
| Auth | POST | `/auth/logout` | Yes | Invalidate refresh | Yes | CONFIRM | Local clear even if API fails |
| Customer | GET | `/customers/me` | Yes | Profile | Yes | CONFIRM | |
| Customer | PATCH | `/customers/me` | Yes | Name/email | Yes | CONFIRM | Image upload not called |
| Auth | POST | `/auth/phone/change/request` | Yes | OTP to new number | Yes | CONFIRM | Extra fields [CONFIRM] |
| Auth | POST | `/auth/phone/change/verify` | Yes | Confirm phone change | Yes | CONFIRM | OTP length [CONFIRM] |

## Catalogue

| Domain | Method | Endpoint | Auth Required | Purpose | Implemented | Backend Confirmation | Notes |
|---|---|---|---|---|---|---|---|
| Home | GET | `/customer/home` | Public | Aggregated home | Yes | CONFIRM | |
| Category | GET | `/categories` | Public | Category tree | Yes | CONFIRM | |
| Category | GET | `/categories/{id}/products` | Public | Listing | Yes | CONFIRM | Filters/sort/page |
| Product | GET | `/products/search` | Public | Search | Yes | CONFIRM | Debounced 350ms, min 2 chars |
| Product | GET | `/products/{id}` | Public | Detail | Yes | CONFIRM | |
| Product | GET | `/products/{id}/options` | Public | Option schema | Yes | CONFIRM | |
| Product | POST | `/products/quote` | — | Quote preview | **No** | CONFIRM | Not called |

## Wishlist / Reviews

| Domain | Method | Endpoint | Auth Required | Purpose | Implemented | Backend Confirmation | Notes |
|---|---|---|---|---|---|---|---|
| Wishlist | GET | `/wishlist` | Yes | List | Yes | CONFIRM | No guest local wishlist |
| Wishlist | POST | `/wishlist/{productId}` | Yes | Add | Yes | CONFIRM | Non-optimistic |
| Wishlist | DELETE | `/wishlist/{productId}` | Yes | Remove | Yes | CONFIRM | Non-optimistic |
| Review | GET | `/products/{id}/reviews` | Public | Approved list | Yes | CONFIRM | Paginated |
| Review | GET | `/orders/{id}/reviewable-items` | Yes | Eligibility | Yes | CONFIRM | Backend-owned |
| Review | POST | `/reviews` | Yes | Submit | Yes | CONFIRM | Requires real `orderItemId` |

## Cart / Checkout / Fulfilment / Store credit

| Domain | Method | Endpoint | Auth Required | Purpose | Implemented | Backend Confirmation | Notes |
|---|---|---|---|---|---|---|---|
| Cart | GET | `/cart` | Yes | Cart | Yes | CONFIRM | |
| Cart | POST | `/cart/items` | Yes | Add line | Yes | CONFIRM | |
| Cart | PATCH | `/cart/items/{id}` | Yes | Quantity | Yes | CONFIRM | Previous qty until 2xx |
| Cart | DELETE | `/cart/items/{id}` | Yes | Remove | Yes | CONFIRM | |
| Cart | POST | `/cart/revalidate` | Yes | Revalidate before checkout | Yes | CONFIRM | Checkout, not Cart tab |
| Cart | POST | `/cart/apply-coupon` | Yes | Coupon | Yes | CONFIRM | |
| Cart | DELETE | `/cart/coupon` | Yes | Remove coupon | Yes | CONFIRM | |
| Cart | POST | `/cart/apply-store-credit` | Yes | Apply credit | Yes | CONFIRM | Body `{ max: true }` [CONFIRM] |
| Cart | DELETE | `/cart/store-credit` | Yes | Remove credit | Yes | CONFIRM | |
| Cart | POST | `/cart/merge` | — | Guest merge | **No** | CONFIRM | Not implemented |
| Address | GET | `/addresses` | Yes | List | Yes | CONFIRM | |
| Address | POST | `/addresses` | Yes | Create | Yes | CONFIRM | |
| Address | PATCH | `/addresses/{id}` | Yes | Update | Yes | CONFIRM | |
| Address | DELETE | `/addresses/{id}` | Yes | Delete | Yes | CONFIRM | |
| Fulfilment | POST | `/fulfilment/serviceability` | Yes | Delivery check | Yes | CONFIRM | |
| Fulfilment | GET | `/fulfilment/slots` | Yes | Slots | Yes | CONFIRM | Query shape extras [CONFIRM] |
| Fulfilment | GET | `/fulfilment/pickup-info` | Yes | Pickup details | Yes | CONFIRM | No production-house picker |
| Checkout | POST | `/checkout` | Yes | Create checkout | Yes | CONFIRM | Idempotency-Key [CONFIRM] |
| Store credit | GET | `/store-credit` | Yes | Balance + history | Yes | CONFIRM | |

## Payment

| Domain | Method | Endpoint | Auth Required | Purpose | Implemented | Backend Confirmation | Notes |
|---|---|---|---|---|---|---|---|
| Payment | POST | `/payments/razorpay/initiate` | Yes | Razorpay order | Yes | CONFIRM | Skipped if checkout already returned order |
| Payment | POST | `/payments/razorpay/confirm` | Yes | Backend verify | Yes | CONFIRM | Authoritative success |
| Payment | GET | `/payments/status` | — | Poll status | **No** | CONFIRM | Not documented; not called |

## Orders / Tracking / Rider

| Domain | Method | Endpoint | Auth Required | Purpose | Implemented | Backend Confirmation | Notes |
|---|---|---|---|---|---|---|---|
| Order | GET | `/orders` | Yes | List by status group | Yes | CONFIRM | page pagination [CONFIRM] |
| Order | GET | `/orders/{id}` | Yes | Detail | Yes | CONFIRM | 403 treated as not found |
| Order | GET | `/orders/{id}/cancellation-eligibility` | Yes | Cancel gate | Yes | CONFIRM | |
| Order | POST | `/orders/{id}/cancel` | Yes | Cancel | Yes | CONFIRM | Idempotency; reasons [CONFIRM] |
| Order | POST | `/orders/{id}/reorder` | Yes | Rebuild current cart | Yes | CONFIRM | Then review Cart |
| Order | GET | `/orders/{id}/invoice` | Yes | Invoice URL | Yes | CONFIRM | HTTPS only in browser |
| Tracking | GET | `/orders/{id}/tracking` | Yes | Live tracking | Yes | CONFIRM | 15s poll while focused |
| Rider | GET | `/orders/{id}/rider` | Yes | Display-safe rider | Yes | CONFIRM | Call number only if allowed |
| Chat | GET | `/orders/{id}/rider-chat/messages` | Yes | Thread | Yes | CONFIRM | 10s poll while focused |
| Chat | POST | `/orders/{id}/rider-chat/messages` | Yes | Send | Yes | CONFIRM | Pagination [CONFIRM] |

## Notifications / Support / Legal / Config

| Domain | Method | Endpoint | Auth Required | Purpose | Implemented | Backend Confirmation | Notes |
|---|---|---|---|---|---|---|---|
| Push | POST | `/devices/push-token` | Yes | Register FCM/APNs token | Yes | CONFIRM | Duplicate same token skipped |
| Push | DELETE | push token unbind | — | Logout unbind | **No** | CONFIRM | Not assumed |
| Notification | GET | `/notifications` | Yes | Inbox | Yes | CONFIRM | Envelope [CONFIRM] |
| Notification | POST | `/notifications/{id}/read` | Yes | Mark read | Yes | CONFIRM | |
| Notification | POST | `/notifications/read-all` | — | Mark all | **No** | CONFIRM | Not implemented |
| Support | GET | `/support/tickets` | Yes | List | Yes | CONFIRM | Pagination [CONFIRM] |
| Support | POST | `/support/tickets` | Yes | Create | Yes | CONFIRM | Idempotency-Key |
| Support | GET | `/support/tickets/{id}` | Yes | Detail | Yes | CONFIRM | Ownership backend |
| Support | POST | `/support/tickets/{id}/messages` | Yes | Reply | Yes | CONFIRM | |
| Support | POST | `/support/tickets/{id}/attachments` | Yes | Evidence | Yes | CONFIRM | FormData field `file` [CONFIRM] |
| Legal | GET | `/legal/{type}` | Public | Policy | Yes | CONFIRM | URL vs markdown [CONFIRM] |
| Config | GET | `/app/config` | Public | Maintenance / force update | Yes | CONFIRM | Fail-open; `storeUrls` shape [CONFIRM] |

---

## Client behaviour (all calls)

| Topic | Behaviour |
|---|---|
| Timeout | 30s on `fetchBaseQuery` (Phase 12) |
| 401 | Refresh mutex → retry once; failure clears tokens + in-memory customer state + `resetApiState` |
| Mutations | No fake offline success |
| Money | Integer paise from backend; `formatPaise` for display |

---

*End of API inventory.*
