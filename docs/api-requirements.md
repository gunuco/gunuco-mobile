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
| Fulfilment / Slots | `deliveryApi` | Serviceability, ASAP/slots |
| Orders | `orderApi` | List tabs, detail, cancel, reorder |
| Payments | `paymentApi` | Razorpay initiate + status |
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
| POST | `auth/phone/change/request` | newPhone | challengeId | Yes |
| POST | `auth/phone/change/verify` | challengeId, otp | customer | Yes |

---

## 4. Customer

| Method | Logical | Notes |
|---|---|---|
| GET | `customers/me` | Profile |
| PATCH | `customers/me` | name, email, profileImage |

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
| GET | `categories` | Tree; only active for customer |
| GET | `categories/{id}/products` | page, sort, filters |
| GET | `products/{id}` | Detail, rating summary, wishlist flag, starting price (paise) |
| GET | `products/{id}/options` | Schema-driven options/variants/add-ons |
| POST | `products/quote` or cart preview | Selected options → line price **[CONFIRM]** |

Cookies and all cake subcategories use generic option schema — not cake-hardcoded fields.

---

## 7. Search

| Method | Logical | Query |
|---|---|---|
| GET | `products/search` | `q`, subcategory, priceMin/Max, option filters, sort=`popular|price_asc|price_desc|newest`, page |

Architecture must accept future category filters without redesign.

---

## 8. Wishlist

| Method | Logical |
|---|---|
| GET | `wishlist` |
| POST | `wishlist/{productId}` |
| DELETE | `wishlist/{productId}` |

Auth required.

---

## 9. Reviews

| Method | Logical | Notes |
|---|---|---|
| GET | `products/{id}/reviews` | Paginated |
| GET | `orders/{id}/reviewable-items` | Eligibility |
| POST | `reviews` | orderItemId, rating, text |
| Backend moderation | Admin-side | Client shows approved reviews |

---

## 10. Cart

| Method | Logical | Notes |
|---|---|---|
| GET | `cart` | Server cart for customer |
| POST | `cart/items` | productId, options, qty |
| PATCH | `cart/items/{id}` | qty/options |
| DELETE | `cart/items/{id}` | |
| POST | `cart/revalidate` | availability/price/options/offers/fulfilment |
| POST | `cart/merge` | Guest draft → server after login **[CONFIRM]** |

Common cart; multi-item; no custom-cake cart.

---

## 11. Addresses

| Method | Logical | Body fields |
|---|---|---|
| GET/POST/PATCH/DELETE | `addresses` | addressType, name, phone, house, street, area, landmark, city, state, pincode, lat, lng, isDefault |

Google Maps used client-side for pin; backend validates serviceability separately.

---

## 12. Fulfilment / Slots / Serviceability

| Method | Logical | Notes |
|---|---|---|
| POST | `fulfilment/serviceability` | lat/lng → serviceable, fee (paise), message |
| GET | `fulfilment/slots` | date, fulfilmentType, cart context → ASAP flag + slot list |
| GET | `fulfilment/pickup-info` | Assigned production-house public pickup details |

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
| GET | `store-credit` | balance (paise) + history |
| POST | `cart/apply-store-credit` | amount or max **[CONFIRM]** |
| DELETE | `cart/store-credit` | |

Ledger maintained by backend (refunds, compensation, promos, admin).

---

## 15. Checkout / Orders / Payments

| Method | Logical | Notes |
|---|---|---|
| POST | `checkout` | idempotency, addressId?, fulfilment, slotId/ASAP, coupon, storeCredit | Creates payment intent / order draft |
| POST | `payments/razorpay/initiate` | order/checkout id, amount paise | Razorpay order id + key payload |
| POST | `payments/razorpay/confirm` or webhook-driven | Client may poll `payments/{id}` / `orders/{id}` | Backend verifies signature |
| GET | `orders` | `statusGroup=active|past|cancelled` |
| GET | `orders/{id}` | Full detail + timeline |
| POST | `orders/{id}/cancel` | reasonCode, otherText?, idempotency |
| GET | `orders/{id}/cancellation-eligibility` | |
| POST | `orders/{id}/reorder` | → cart + revalidation result |
| GET | `orders/{id}/invoice` | PDF URL |

Full payment only. No advance/balance endpoints for catalogue.

---

## 16. Tracking & Rider Communication

| Method | Logical | Notes |
|---|---|---|
| GET | `orders/{id}/tracking` | status, eta, rider lat/lng, polyline? |
| GET | `orders/{id}/rider` | Rider display info + call number/token |
| GET/POST | `orders/{id}/rider-chat/messages` | Thread; only when status allows |
| Backend rules | Gate chat/call | Client must hide when not allowed |

---

## 17. Notifications

| Method | Logical |
|---|---|
| POST | `devices/push-token` | token, platform (ios/android) |
| GET | `notifications` | page |
| POST | `notifications/{id}/read` | |
| POST | `notifications/read-all` | **[CONFIRM]** |

Channels: OTP via SMS; order lifecycle mainly Push (FCM/APNs).

---

## 18. Support Tickets

| Method | Logical |
|---|---|
| GET | `support/tickets` | |
| POST | `support/tickets` | orderId?, message, idempotency, attachments |
| GET | `support/tickets/{id}` | messages |
| POST | `support/tickets/{id}/messages` | customer reply |
| POST | `support/tickets/{id}/attachments` | ≤3 images |

Complaint/return evidence: max 3 JPG/PNG/WEBP; size limit backend-enforced.

---

## 19. App Configuration / Maintenance / Force Update

| Method | Logical | Response |
|---|---|---|
| GET | `app/config` | minVersion, latestVersion, forceUpdate, maintenanceMode, maintenanceMessage, storeUrls |

Client blocks UI accordingly at bootstrap.

---

## 20. Legal Content

| Method | Logical | Notes |
|---|---|---|
| GET | `legal/{type}` | terms, privacy, refund, cancellation — URL or markdown **[CONFIRM]** |

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
