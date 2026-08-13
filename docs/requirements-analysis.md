# GUNUCO Customer Mobile App — Requirements Analysis

> **Authority order:** (1) `CURSOR_MASTER_INSTRUCTIONS.md` → (2) `GUNUCO_PRODUCT_DECISIONS.md` → (3) `GUNUCO_PLAN/` → (4) this docs set.
>
> Final product decisions **override** earlier GUNUCO_PLAN custom-cake / advance-payment assumptions where they conflict.

---

## 1. Complete Understanding of GUNUCO

GUNUCO is a multi-category commerce system. This repository builds only the **Customer App**:

| Dimension | Decision |
|---|---|
| App | React Native + Expo **customer-only** |
| Platforms | **Android + iOS** |
| Rider App | Separate React Native **Android-only** app — **out of scope** |
| Admin Panel | Separate **web** app — **out of scope** |
| Launch category | **Cakes** only |
| Future categories | Coffee, Pizza, Burgers (architecture-ready, inactive) |
| Cart | One **common cart** for all catalogue products |
| Payment | **Full payment at checkout** via **Razorpay** |
| Custom cakes | **Explicitly not required** — no request/quote/advance workflow |

**Frontend nature:** API-driven. Backend is authoritative for prices, availability, offers, stacking, slots, production-house assignment, tax, payment verification, tracking, and eligibility.

**Currency:** INR displayed in rupees; monetary amounts exchanged with backend/payment as **integer paise**.

**UX benchmark:** BigBasket patterns; distinct GUNUCO branding (no copied assets).

---

## 2. Catalogue Structure

### Required at launch — Main category: Cakes

Subcategories:

1. **GUNUCO Premium**
2. **Cakes**
3. **Cookies**
4. **Wedding Cakes**
5. **Birthday Cakes**

### Product rule (critical)

```text
Main Category → Subcategory → Product → Options/Variants → Add to Cart
→ Common Cart → Checkout → Payment → Order
```

- Wedding Cakes and Birthday Cakes are **normal catalogue products**.
- Cookies are a Cakes subcategory and are **normal catalogue products** (pack/quantity options via product option schema — **not** cake-specific custom fields).
- Options/variants are **product-schema driven** so Coffee/Pizza/Burgers can plug in later without redesign.

### Future

- Enable Coffee, Pizza, Burgers as main categories via backend config.
- No fundamental redesign of catalogue/cart/checkout/order architecture.

### Explicitly not required

- Custom cake request
- Reference image upload
- Quotation / admin quote approval
- Clarification thread
- Pending-review custom cake state
- Advance / balance payment for cakes

---

## 3. Customer Functionality Overview

### Required at launch

| Area | Summary |
|---|---|
| Auth | Phone + OTP; access + refresh tokens; multi-device |
| Guest | Browse without login; **auth required before checkout** |
| Discovery | Aggregated Home API, search, categories, subcategories |
| Products | Detail + schema-driven options/variants |
| Cart | Server-persisted common cart; multi-item orders |
| Addresses | Saved address book; Google Maps pin; default address |
| Fulfilment | Pickup OR Delivery; ASAP OR Schedule (backend slots) |
| Offers | Auto offers + manual coupon codes; stacking backend-controlled |
| Wishlist | Required |
| Reviews | Rate/review eligible purchased products |
| Checkout | Revalidate availability/price/options/offers before pay |
| Payment | Razorpay: UPI, Cards, Net Banking; optional Store Credit use |
| Orders | Active / Past / Cancelled; detail; reorder; invoice PDF |
| Delivery UX | Live rider tracking, rider chat, rider call (when allowed) |
| Support | Tickets with customer↔support reply thread |
| Notifications | FCM/APNs via Expo; contextual permission prompt |
| Profile | Account, phone change (OTP), store credit, settings |
| Legal | Terms, Privacy, Refund, Cancellation policies |
| Theme | Light + Dark from day one |
| App config | Force update + maintenance mode |

### Future

- Coffee / Pizza / Burgers catalogues
- Additional payment methods
- Automatic popularity-based featured selection
- Multi-language (architecture-friendly strings only for now)

### Explicitly not required

- Custom cake workflows
- Multiple languages at launch
- Referral / Invite / Refer & Earn
- Rider or Admin modules in this app
- Guest checkout
- Advance/balance split payment for catalogue orders

---

## 4. Product Functionality

- Products belong to subcategory under active main category.
- Product detail shows images, name, description, price, rating summary, wishlist, offers badges.
- Options/variants and add-ons (if configured) come from backend product schema.
- Featured / Best Sellers / promotional sections are **admin-controlled**.
- Architecture must not hard-code category names as navigation enums.

---

## 5. Cart

- **Server-persisted** for logged-in customers; survives devices/sessions.
- Guest may build a **local draft cart** until auth, then merge/sync **[CONFIRM merge rules with backend]** — guest can add while browsing; checkout forces login.
- One common cart mixes Premium, Cakes, Cookies, Wedding, Birthday products.
- Multi-product → one checkout → one order (backend validates joint fulfilment).
- At checkout: backend revalidates availability, price, qty, options, offers, fulfilment; surface change messages before payment.

---

## 6. Checkout & Fulfilment

1. Auth gate if guest.
2. Select/confirm address (delivery) or show pickup info (pickup).
3. Choose **Pickup** or **Delivery**.
4. Choose **ASAP** or **Schedule for Later**; slots from backend only.
5. Apply coupon / review offers.
6. Optional Store Credit application (backend ledger).
7. Review totals: subtotal, discount, tax (separate line), delivery fee (if any), total.
8. Production house is **backend-assigned** — customer never selects it.
9. Same-day unavailable message (recommended): *“Same-day orders are no longer available. Please select another date.”*

---

## 7. Payment

- **Full payment required** at checkout to confirm order.
- Gateway: **Razorpay** (supported RN/Expo integration).
- Launch methods: UPI, Credit/Debit Card, Net Banking.
- Backend verifies payment and confirms order; client success screen only after backend confirmation.
- Amounts in **integer paise**.
- Never store card PANs; never trust client-only payment success.

---

## 8. Pickup

- Customer chooses Pickup at checkout.
- Backend provides pickup location details / instructions for the assigned production house.
- Scheduling: ASAP or backend slots.
- No OTP/pickup-code invention on client beyond what API returns.

---

## 9. Delivery

- Address from saved book or new address (Google Maps).
- Serviceability and fees from backend.
- When **Out for Delivery**: live map, rider location, ETA.
- Rider **Chat** and **Call** when backend status rules allow.
- After Delivered: prompt review of eligible items.

---

## 10. Orders

Tabs: **Active | Past | Cancelled**.

- Order detail: items, options, fulfilment, payment, timeline, invoice download.
- **Reorder**: revalidate current availability/price/options/offers → cart.
- **Cancel**: predefined reasons + Other; eligibility from backend/status.
- Complaint/return/refund: evidence ≤3 photos (JPG/PNG/WEBP); policy enforced by backend (food/cake-oriented — exact window **still open** with business).

---

## 11. Notifications

| Event | Channel (launch model) |
|---|---|
| OTP | SMS |
| Order/payment/status/rider/support/review reminder | Push |
| Security/account | Push/SMS as appropriate |

- Do not SMS every order event.
- Deep-link to order detail / tracking / ticket / etc.
- Ask notification permission **contextually**, not on first launch.

---

## 12. Profile & Account

- Name, phone, email, profile image (as API provides).
- Change phone via OTP on new number.
- Wishlist, addresses, orders, store credit, notifications, support, legal, settings (including dark mode preference), logout.
- Session: remain logged in until logout; access + refresh tokens in secure storage.

---

## 13. Addresses

Saved multi-address book with types Home / Office / Other; default preselected at checkout. Google Maps for pin/selection/validation.

---

## 14. Offers & Coupons

- Manual coupon entry + automatic offers.
- Scopes at launch: order-level, product-level, subcategory-level.
- Stacking decided by backend.

---

## 15. Search & Categories

- Search across active Cakes catalogue; filters: subcategory, price, relevant options; sorts: Popular, Price↑↓, Newest.
- Categories/subcategories from API; only active ones visible.

---

## 16. Wishlist

Required. Add/remove from product surfaces; manage from profile/account.

---

## 17. Ratings & Reviews

Required for eligible purchased products. Backend controls eligibility and moderation.

---

## 18. Store Credit

Required. Sources: refunds, compensation, promos, admin adjustments. Ledger + history on backend. Customer can view balance and apply at checkout when allowed.

---

## 19. Support

Create ticket (order-linked where applicable); support replies; customer replies; resolution. Evidence photos where applicable (max 3).

---

## 20. Legal, Theme, App Lifecycle

- Legal: Terms, Privacy, Refund, Cancellation.
- English only at launch; avoid hard-coded string sprawl for future i18n.
- Light + Dark themes in design system from the start.
- App config: min version, latest version, force update, maintenance mode.

---

## 21. Tax & Invoice

- Show applicable tax as a **separate line** (rates from backend/business rules).
- Download invoice/receipt PDF from Order Details (backend-generated).

---

## 22. Error Handling

Map backend business codes to friendly copy, e.g.:

`ORDERS_NOT_ACCEPTING`, `PRODUCT_UNAVAILABLE`, `ADDRESS_NOT_SERVICEABLE`, `SLOT_UNAVAILABLE`, `PAYMENT_FAILED`, `CART_PRICE_CHANGED`, `CART_ITEM_UNAVAILABLE`, `STORE_CLOSED`, `ORDER_CANCELLATION_NOT_ALLOWED`.

Do **not** normally expose correlation IDs to customers.

---

## 23. Consistency Notes

| Topic | Resolution |
|---|---|
| Custom cakes in GUNUCO_PLAN | **Superseded** — not in customer app scope |
| 50% advance payment in plan | **Superseded** — full payment only |
| Wishlist/ratings in master | **Confirmed required** by product decisions |
| Dark mode | **Required** |
| Customer vs Rider/Admin | Strict separation |

---

*End of requirements analysis (post product-decisions integration).*
