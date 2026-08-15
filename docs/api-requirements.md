# GUNUCO Customer App — API Requirements (Final)

> Logical endpoints only — **do not invent production URLs**.
> Backend is authoritative for prices, availability, offers/stacking, slots, production-house assignment, tax, payment verification, tracking, and eligibility.
> Amounts: **integer paise**.
> Paths below are contract-discussion names.

**[CONFIRM]** = confirm exact path/shape with backend OpenAPI.

---

## 1. API Domains

| Domain | Planned RTK module | Notes |
|---|---|---|
| Authentication | `authApi` | Phone OTP |
| Customer | `userApi` | Profile, phone change |
| Home | `homeApi` | Aggregated `GET customer/home` |
| Categories | `categoryApi` | Main + sub; config-driven |
| Products | `productApi` | Detail, options schema |
| Search | `productApi` / `searchApi` | Filters + sort |
| Wishlist | `wishlistApi` | Required |
| Reviews | `reviewApi` | Required |
| Cart | `cartApi` | Server-persisted |
| Addresses | `addressApi` | Saved book |
| Fulfilment / Slots | `fulfilmentApi` | Serviceability, ASAP/slots, pickup info. Implemented in Phase 8. |
| Orders | `orderApi` | **Phase 10 implemented.** List tabs, detail, cancel, reorder, invoice |
| Payments | `paymentApi` | Razorpay initiate + confirm. **Phase 9 implemented.** No payment-status GET is documented. |
| Coupons / Offers | `offerApi` | Codes + auto offers |
| Store Credit | `storeCreditApi` | Balance + ledger + apply |
| Tracking | `trackingApi` | Live rider |
| Rider Chat | `chatApi` | Delivery-scoped |
| Notifications | `notificationApi` | Inbox + push token |
| Support Tickets | `supportApi` | CRUD + thread |
| Invoice | `orderApi` | PDF URL |
| App Configuration | `configApi` | Version, force update, maintenance |

**Out of scope APIs for this app:** Admin, Rider assignment tooling, custom-cake quote APIs.

---

## 2. Cross-Cutting

| Concern | Requirement |
|---|---|
| Auth header | Bearer access token when logged in |
| Guest | Public browse endpoints work without token |
| Idempotency | UUID on checkout/payment/cancel/ticket create; reuse on retry |
| Pagination | page/cursor **[CONFIRM]** |
| Errors | Business codes (`PRODUCT_UNAVAILABLE`, …) + safe message; no customer-facing correlation ID |
| Money | Integer paise everywhere for payable amounts |
| Revalidation | Cart/checkout must call backend revalidate before pay |

---

## 3. Authentication

| Method | Logical | Request | Response | Auth |
|---|---|---|---|---|
| POST | `auth/otp/request` | phone | challengeId, expiresIn | No |
| POST | `auth/otp/verify` | challengeId, otp, phone | accessToken, refreshToken, customer, isNewUser | No |
| POST | `auth/token/refresh` | refreshToken | tokens | Refresh |
| POST | `auth/logout` | refreshToken? | ok | Yes |
| POST | `auth/phone/change/request` | newPhone | challengeId, expiresIn, otpLength? **[CONFIRM]**. Challenge in memory, not URL. Phase 11. | Yes |
| POST | `auth/phone/change/verify` | challengeId, otp | customer. Extra required fields **[CONFIRM]**. Phase 11. | Yes |

---

## 4. Customer

| Method | Logical | Notes |
|---|---|---|
| GET | `customers/me` | Profile |
| PATCH | `customers/me` | **Phase 11.** Body `{ name?, email? }`. Profile image upload is **[CONFIRM]** — not implemented (display URL only if returned). |

Referenced by orders, cart, addresses, wishlist, reviews, store credit, notifications, tickets.

---

## 5. Home

| Method | Logical | Response (example composition) |
|---|---|---|
| GET | `customer/home` | Banners, active main categories, subcategories, featured, best sellers, offers, recommended |

Launch: active main category = Cakes. Featured sections admin-controlled.

---

## 6. Categories & Products

| Method | Logical | Query / notes |
|---|---|---|
| GET | `categories` | Customer-visible **active-only** tree. Inactive / future mains (Coffee, Pizza, Burgers) are omitted until backend activates them. If a node includes `isActive`, the app requires `true`; if the flag is omitted, the payload is trusted as already filtered. |
| GET | `categories/{id}/products` | page, sort, filters |
| GET | `products/{id}` | Detail, rating summary, wishlist flag, starting price (paise). Public browse GET. Envelope `{ product }` / `{ data }` / bare object is normalized. |
| GET | `products/{id}/options` | Schema-driven option groups/values and optional variants. Public browse GET. 404 is treated as “no options”. |
| POST | `products/quote` or cart preview | Selected options → line price **[CONFIRM]** — **not called** in Phase 5. Displayed price uses detail starting price, a matching variant, or a single backend-provided option `pricePaise`. No frontend price math or discount %. |

Cookies and all cake subcategories use generic option schema — not cake-hardcoded fields. Add-ons, if present on the options payload, are mapped into the same option-group renderer.

---

## 7. Search

| Method | Logical | Query |
|---|---|---|
| GET | `products/search` | `q`, subcategory, priceMin/Max, option filters, sort=`popular|price_asc|price_desc|newest`, page |

Architecture must accept future category filters without redesign.

---

## 8. Wishlist

| Method | Logical | Notes |
|---|---|---|
| GET | `wishlist` | Auth required. Normalized to `{ items: ProductSummary[] }`. |
| POST | `wishlist/{productId}` | Auth required. Invalidates Wishlist + Product tags. |
| DELETE | `wishlist/{productId}` | Auth required. Invalidates Wishlist + Product tags. |

No local guest wishlist. Guest heart/open-wishlist → phone auth. After OTP, pending add is dispatched and the previous screen is restored when possible.

---

## 9. Reviews

| Method | Logical | Notes |
|---|---|---|
| GET | `products/{id}/reviews` | Paginated public browse. Customer app shows backend-approved reviews only. |
| GET | `orders/{id}/reviewable-items` | Eligibility. Hook implemented for the future Orders phase. No fake order UI. |
| POST | `reviews` | Body: `{ orderItemId, rating, text }` only. Optional `productId` is cache invalidation, not sent. If response `status` is pending/submitted, UI shows a moderation message and does not treat the review as publicly approved. |

---

## 10. Cart

| Method | Logical | Notes |
|---|---|---|
| GET | `cart` | Auth required. Normalized envelopes `{ cart }` / `{ data }` / bare object. Server-persisted common cart. |
| POST | `cart/items` | productId, quantity, options (`{ groupId, valueIds }[]`). Wired from Product Details and Wishlist (when options are known to be safe). Guests are sent to phone auth — no local cart. Success UI only after a real 2xx. Invalidates Cart `LIST`. |
| PATCH | `cart/items/{id}` | Body `{ quantity }`. Option edits go through Product Details, not a Cart option selector. |
| DELETE | `cart/items/{id}` | Remove one cart line. |
| POST | `cart/revalidate` | Called from Checkout immediately before `POST /checkout`. Not called from the Cart screen. If the payload includes cart changes / invalid flags, Checkout stays and shows `CartChangeBanner`. |
| POST | `cart/apply-coupon` | Body `{ code }`. Backend stacking. Cart totals update from the mutation/GET response. |
| DELETE | `cart/coupon` | Remove applied coupon. |
| POST | `cart/merge` | Guest draft → server after login **[CONFIRM]** — **not called**. |

Common cart; multi-item; no custom-cake cart. No guest local cart.

---

## 11. Addresses

| Method | Logical | Body fields |
|---|---|---|
| GET/POST/PATCH/DELETE | `addresses` | **Phase 8 implemented.** Body: addressType, name, phone, house, street, area, landmark, city, state, pincode, lat, lng, isDefault. `PATCH/DELETE addresses/{id}`. Envelope `{ addresses }` / `{ items }` / `{ data }` is normalized. |

Google Maps used client-side for pin; backend validates serviceability separately.

---

## 12. Fulfilment / Slots / Serviceability

| Method | Logical | Notes |
|---|---|---|
| POST | `fulfilment/serviceability` | **Phase 8.** Body `{ lat, lng }` → `serviceable`, `fee`/`feePaise`, `message`. Fee is integer paise. Not calculated on the client. |
| GET | `fulfilment/slots` | **Phase 8.** Query `date`, `fulfilmentType`. Response ASAP flag + slot list + optional `availableDates` + cutoff message. **[CONFIRM]** whether cart/location is implied by session or extra query params. Slots never hard-coded. |
| GET | `fulfilment/pickup-info` | **Phase 8.** Assigned production-house public pickup details. Customer cannot select a production house. |

Slots **never** hard-coded. Production house **never** client-selected.

Same-day cutoff messaging driven by backend codes/messages.

---

## 13. Offers & Coupons

| Method | Logical | Notes |
|---|---|---|
| GET | `offers` | Active offers |
| GET | `offers/{id}` | Detail + products |
| POST | `cart/apply-coupon` | code |
| DELETE | `cart/coupon` | Remove |
| Stacking | Backend only | Client displays result |

Scopes: order / product / subcategory (launch).

---

## 14. Store Credit

| Method | Logical |
|---|---|
| GET | `store-credit` | **Phase 8.** balance (paise) + optional history. `storeCreditApi`. |
| POST | `cart/apply-store-credit` | amount or max **[CONFIRM]**. Phase 8 sends `{ max: true }` for “use available credit”. No amount picker. |
| DELETE | `cart/store-credit` | **Phase 8.** Remove applied store credit; cart totals refresh from the mutation/GET response. |

Ledger maintained by backend (refunds, compensation, promos, admin).

---

## 15. Checkout / Orders / Payments

| Method | Logical | Notes |
|---|---|---|
| POST | `checkout` | **Phase 8 implemented.** Idempotency UUID (`Idempotency-Key` header and body `idempotencyKey` — **[CONFIRM]** which the backend requires). Body also sends fulfilment, asap, addressId?, slotId?, coupon?, storeCredit? `{ max: true }`. Exact request/response field names **[CONFIRM]**. Creates payment intent / order draft. Does **not** open Razorpay. Response may include `checkoutId`, `amountPaise`, `razorpayOrderId`, `keyId`, `currency` **[CONFIRM]**. |
| POST | `payments/razorpay/initiate` | **Phase 9 implemented.** Called from Payment only when checkout did not already return a Razorpay order id + amount. Body: `{ checkoutId, idempotencyKey }`. Amount is **not** sent by the client **[CONFIRM]** if backend requires `amountPaise`. Response normalized: `razorpayOrderId`, `keyId`, `amountPaise`, `currency`. |
| POST | `payments/razorpay/confirm` | **Phase 9 implemented.** Mandatory backend verification. Body: `{ checkoutId, idempotencyKey, razorpay_payment_id, razorpay_order_id?, razorpay_signature? }` **[CONFIRM]** exact names. Signature is forwarded, never verified on device. Success (`verified` / `success` / `alreadyProcessed`) → Order Confirmation + Cart invalidate + `GET /cart`. |
| GET | `payments/status` or `payments/{id}` | **Not documented. Not implemented.** Uncertain payment uses UNKNOWN UI and retries confirm only. Do not invent a status poll. |
| GET | `orders` | **Phase 10 implemented.** Query `statusGroup=active\|past\|cancelled` plus `page` (page-based like reviews; cursor remains **[CONFIRM]**). `orderApi.getOrders`. |
| GET | `orders/{id}` | **Phase 10.** Full detail + timeline + totals + flags. 403/404 shown as “Order not found”. |
| POST | `orders/{id}/cancel` | **Phase 10.** Body `{ reasonCode, otherText? when OTHER, idempotencyKey }` + `Idempotency-Key` header. Codes from GUNUCO Q37: `ORDERED_BY_MISTAKE`, `CHANGED_MIND`, `DELIVERY_TAKING_TOO_LONG`, `OTHER` **[CONFIRM]**. |
| GET | `orders/{id}/cancellation-eligibility` | **Phase 10.** `allowed`, optional `refundPaise`, message, deadline/policy labels. Frontend does not calculate 30/60 minute rules. |
| POST | `orders/{id}/reorder` | **Phase 10.** Idempotency header/body. Backend revalidates; client navigates to Cart only if cart was updated. Changes shown via Cart `CartChangeBanner`. |
| GET | `orders/{id}/invoice` | **Phase 10.** Lazy fetch. Opens backend PDF URL in the system browser (`expo-web-browser`). URL is not stored or logged. |

Full payment only. No advance/balance endpoints for catalogue.

---

## 16. Tracking & Rider Communication

| Method | Logical | Notes |
|---|---|---|
| GET | `orders/{id}/tracking` | **Phase 10.** Isolated `trackingApi`. Poll 15s while the Tracking screen is focused and not delivered/cancelled. Fields: available, status, etaLabel, rider lat/lng, destination, polyline points, updatedAt. Encoded polyline strings are not decoded **[CONFIRM]**. No WebSocket. |
| GET | `orders/{id}/rider` | **Phase 10.** Display name, photo, rating, `callAllowed`/`chatAllowed`, `callNumber`. Call uses `tel:` when a number is present. Call-token-only behavior **[CONFIRM]**. Number/token not logged. |
| GET/POST | `orders/{id}/rider-chat/messages` | **Phase 10.** `chatApi`. GET poll 10s while focused. POST `{ text }`. Messages normalized oldest→newest. Page query for older messages **[CONFIRM]**. Hidden unless backend `available`/order flags allow. |
| Backend rules | Gate chat/call | Client must hide when not allowed |

---

## 17. Notifications

| Method | Logical | Notes |
|---|---|---|
| POST | `devices/push-token` | **Phase 11.** `{ token, platform: ios\|android }`. Native FCM/APNs token via `expo-notifications` `getDevicePushTokenAsync`. No fake token. Device-token delete **[CONFIRM]** — not called on logout. |
| GET | `notifications` | **Phase 11.** Page pagination (same merge/dedupe pattern as orders). Cursor **[CONFIRM]** — not used. Envelope field names **[CONFIRM]**. |
| POST | `notifications/{id}/read` | **Phase 11.** Called when a notification is opened, not when the inbox opens. Invalidates list + Home unread badge. |
| POST | `notifications/read-all` | **[CONFIRM]** — **not implemented**. |

Notification preference API: **[CONFIRM]** — not implemented. Settings shows OS permission only.

Deep-link payload uses identifiers only (`orderId`, `ticketId`, `orderItemId`). Destination screens fetch authoritative data.

Channels: OTP via SMS; order lifecycle mainly Push (FCM/APNs).

---

## 18. Support Tickets

| Method | Logical | Notes |
|---|---|---|
| GET | `support/tickets` | **Phase 11.** Customer tickets only. Page pagination. Envelope **[CONFIRM]**. |
| POST | `support/tickets` | **Phase 11 + Phase 10 complaint.** `{ message, orderId?, reasonCode?, idempotencyKey }`. Same idempotency key on retry. |
| GET | `support/tickets/{id}` | **Phase 11.** Ticket + messages. 403/404 → ticket not found. |
| POST | `support/tickets/{id}/messages` | **Phase 11.** `{ message }`. No optimistic insert. Closed tickets hide composer unless `replyAllowed`/`canReply` is true. |
| POST | `support/tickets/{id}/attachments` | **Phase 10/11.** Up to 3 JPG/PNG/WEBP via FormData after create. Upload mechanics **[CONFIRM]** (`file` field). |

Complaint/return evidence: max 3 JPG/PNG/WEBP; size limit backend-enforced. Complaint success navigates to ticket detail when `ticketId` is returned.

---

## 19. App Configuration / Maintenance / Force Update

| Method | Logical | Response |
|---|---|---|
| GET | `app/config` | **Phase 11.** minVersion, latestVersion, forceUpdate, maintenanceMode, maintenanceMessage, storeUrls. Fetched at bootstrap with `forceRefetch`. `keepUnusedDataFor: 30`. Failure is **fail-open** (does not assume maintenance). |

Version compare is numeric semver (`1.10.0` > `1.9.0`). App version comes from Expo metadata. Optional-update UI is not implemented. Store URLs are backend-provided **[CONFIRM]** shape (`android`/`ios` or `playStore`/`appStore`).

---

## 20. Legal Content

| Method | Logical | Notes |
|---|---|---|
| GET | `legal/{type}` | **Phase 11.** types: terms, privacy, refund, cancellation. URL (https, opened in in-app browser, no auth tokens) or markdown/text **[CONFIRM]**. HTML is displayed as stripped text, not executed. |

---

## 21. Explicitly Not Required (APIs)

- Custom cake request/quote/approve/clarify
- Advance/Balance payment stages
- Referral/invite
- Customer production-house picker
- Admin/Rider panel endpoints inside this app

---

## 22. Backend-Owned Business Rules (do not hard-code in UI)

- Delivery slots & cutoffs
- Production-house assignment
- Offer eligibility & stacking
- Payment verification & order confirmation
- Price/availability revalidation
- Tax calculation/rates
- Rider location stream
- Cancellation/return eligibility
- Review eligibility
- Store credit ledger

---

*End of API requirements.*
