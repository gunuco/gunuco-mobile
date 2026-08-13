# GUNUCO Customer App — Product Decisions & Open Questions

## Final End-to-End Requirements

**Document status:** Recommended baseline for product/backend/mobile implementation

---

# 1. Product Catalogue Structure

## 1.1 Main Categories

GUNUCO has four main product categories:

1. **Cakes** — current launch scope
2. **Coffee** — future
3. **Pizza** — future
4. **Burgers** — future

For the current launch, only **Cakes** is active.

The architecture should still support enabling the other main categories later without redesigning the core catalogue/cart/order system.

## 1.2 Current Cakes Subcategories

Under the **Cakes** main category:

1. **GUNUCO Premium**
2. **Cakes**
3. **Cookies**
4. **Wedding Cakes**
5. **Birthday Cakes**

## 1.3 Important Product Rule

There is **NO custom-cake request/quotation workflow**.

Wedding Cakes and Birthday Cakes are normal catalogue products.

All products follow the same flow:

```text
Main Category
    ↓
Subcategory
    ↓
Product
    ↓
Select available options/variants
    ↓
Add to Cart
    ↓
Common Cart
    ↓
Checkout
    ↓
Payment
    ↓
Order
```

For example:

```text
Cakes
  ↓
Birthday Cakes
  ↓
Kids Birthday Cake
  ↓
Select available options
  ↓
Add to Cart
```

There is no:

- Custom cake request
- Reference image upload
- Admin quotation
- Quote approval
- Custom cake clarification thread
- Custom cake pending-review state
- Custom cake advance/balance payment workflow

---

# 2. Customer Identity & Authentication

## Q1 — Customer identity model

### Decision

Create a dedicated `Customers` table/entity.

Recommended fields:

```text
customerId
name
phone
email
profileImage
status
createdAt
updatedAt
```

Customer identity should be referenced by:

- Orders
- Cart
- Addresses
- Wishlist
- Reviews
- Store Credit
- Notifications
- Support Tickets

---

## Q2 — Authentication method

### Decision

Use **Phone Number + OTP**.

No password is required initially.

Flow:

```text
Enter Phone Number
        ↓
Send OTP
        ↓
Enter OTP
        ↓
Verify OTP
        ↓
Login / Register
```

---

## Q3 — Guest browsing and checkout

### Decision

- Guest browsing: **YES**
- Guest checkout: **NO**

Customers can browse the app without signing in.

Authentication is required before checkout.

```text
Browse Products
      ↓
Add to Cart
      ↓
Checkout
      ↓
Login / Register
      ↓
Payment
```

---

## Q4 — Change phone number

### Decision

Customers can change their registered phone number.

The new phone number must be verified through OTP.

---

## Q5 — Customer session

### Decision

Use:

- Access token
- Refresh token

Customer should remain logged in until logout.

Multiple concurrent devices can be supported initially.

---

# 3. Cart Persistence

## Q6 — Cart storage

### Decision

Use a **server-persisted cart** for logged-in customers.

The cart belongs to the customer account rather than only the local device.

This allows the customer to retain the cart across sessions/devices.

---

## Q7 — Cart product types

### Decision

Use **one common cart for all catalogue products**.

Current launch products:

```text
Cakes
├── GUNUCO Premium
├── Cakes
├── Cookies
├── Wedding Cakes
└── Birthday Cakes
```

All can be mixed in the same cart.

Example:

```text
GUNUCO Premium Cake
Chocolate Cookies
Wedding Cake
Birthday Cake
```

All go through one normal checkout.

There is no separate custom-cake cart.

---

## Q8 — Multiple products in one checkout

### Decision

YES.

Customers can purchase multiple products in one order.

Example:

```text
Birthday Cake
+
Cookies
+
GUNUCO Premium Cake
```

One cart → one checkout → one order.

The backend must validate whether all selected items can be fulfilled together.

---

## Q9 — Product availability or price changes

### Decision

At checkout, the backend must revalidate:

- Product availability
- Current price
- Quantity
- Selected variants/options
- Applicable offers
- Fulfilment availability

If an item is unavailable or its price changed, the customer must be informed before payment.

Example:

```text
Cart Updated

Birthday Cake price changed
from ₹800 to ₹850.

Please review your cart.
```

---

# 4. Customer Addresses

## Q10 — Saved address book

### Decision

YES.

Create a customer address table/API.

Customers can save multiple addresses.

---

## Q11 — Address fields

Recommended fields:

```text
addressId
customerId
addressType
name
phone
house/building
street
area
landmark
city
state
pincode
latitude
longitude
isDefault
createdAt
updatedAt
```

Suggested address types:

```text
Home
Office
Other
```

---

## Q12 — Map provider

### Decision

Use **Google Maps** for:

- Location selection
- Pin placement
- Delivery location
- Location validation

---

## Q13 — Default address

### Decision

Customers can save multiple addresses and select one as their default address.

The default address should be preselected during checkout.

---

# 5. Home, Search & Discovery

## Q14 — Search filters and sorting

### Decision

Search should initially work across the active Cakes catalogue.

Examples:

```text
Chocolate Cake
Birthday Cake
Wedding Cake
Cookies
GUNUCO Premium
```

Recommended filters:

- Subcategory
- Price
- Relevant product options

Recommended sorting:

- Popular
- Price Low → High
- Price High → Low
- Newest

The search architecture should support future categories such as Coffee, Pizza and Burgers.

---

## Q15 — Home API

### Decision

Use an aggregated customer Home API.

Example:

```text
GET /customer/home
```

The response can contain:

```text
Banners
Active Main Categories
Subcategories
Featured Products
Best Sellers
Offers
Recommended Products
```

For the current launch, the active main category is Cakes.

---

## Q16 — Featured products

### Decision

Featured products should be **admin-controlled**.

Admin can select products to appear in:

- Featured
- Best Sellers
- Promotional sections
- Other home-page merchandising sections

Automatic popularity-based selection can be added later.

---

## Q17 — Cookies

### Decision

Cookies are a **subcategory under Cakes** for the current GUNUCO catalogue structure.

They should be normal catalogue products.

They should not use cake-specific/custom-cake fields.

Example:

```text
Cakes
  ↓
Cookies
  ↓
Chocolate Chip Cookies
  ↓
Select available pack/quantity options
  ↓
Add to Cart
```

---

# 6. Offers & Coupons

## Q18 — Coupon codes

### Decision

YES.

Customers can manually enter coupon codes.

Example:

```text
Coupon Code
[GUNUCO50]

[Apply]
```

Automatically applied offers are also supported.

---

## Q19 — Offer stacking

### Decision

Offer stacking is controlled by the backend.

Do not allow unlimited stacking.

The backend determines which offers are eligible and whether they can be combined.

---

## Q20 — Offer scopes

### Decision

Launch with:

- Order-level offers
- Product-level offers
- Subcategory-level offers

Example:

```text
Birthday Cakes → 10% OFF
```

The offer engine should be designed so additional scopes can be added later.

---

# 7. Wishlist & Ratings

## Q21 — Wishlist

### Decision

**YES — required.**

Customers can add catalogue products to Wishlist.

Example:

```text
Product
   ↓
❤️ Add to Wishlist
```

Wishlist should be available from the customer's account/profile area.

---

## Q22 — Ratings and reviews

### Decision

**YES — required.**

Customers can rate and review products they have purchased.

Example:

```text
How was your Birthday Cake?

⭐⭐⭐⭐⭐

Write a Review
```

Recommended rule:

- Customer can review only eligible purchased products.
- Backend controls whether a review is allowed for a particular order/item.
- Admin should have moderation capability.

---

# 8. Fulfilment & Slots

## Q23 — Pickup and delivery slot UX

### Decision

Support:

```text
ASAP
```

and:

```text
Schedule for Later
```

For scheduled orders, the backend provides available slots.

Example:

```text
Today

6:00 PM – 6:30 PM
6:30 PM – 7:00 PM
7:00 PM – 7:30 PM
```

The app should not hard-code available slots.

---

## Q24 — Same-day cutoff

### Decision

Recommended customer-facing message:

> Same-day orders are no longer available. Please select another date.

Backend determines the actual cutoff time.

---

## Q25 — Live rider location / ETA

### Decision

**YES — required.**

Customers should be able to see live rider tracking when the order is out for delivery.

Example:

```text
Order Status
    ↓
Out for Delivery
    ↓
Live Tracking

Rider Location
ETA
Map
```

---

## Q26 — Production house selection

### Decision

The customer does **not** select the production house.

Backend automatically assigns the appropriate production house based on factors such as:

- Customer location
- Product availability
- Production capacity
- Delivery/serviceability
- Business rules

---

# 9. Payment

## Q27 — Payment gateway

### Decision

Use **Razorpay** initially.

The mobile app should use the appropriate supported React Native/mobile integration.

The backend must remain responsible for secure payment verification and order confirmation.

---

## Q28 — Payment methods

Launch with:

- UPI
- Credit/Debit Card
- Net Banking

Additional methods can be added later.

---

## Q29 — Store Credit

### Decision

**YES — required.**

Customers can receive Store Credit through:

- Refunds
- Compensation
- Promotional credits
- Admin adjustments
- Other approved business rules

Example:

```text
GUNUCO Store Credit

Available Balance: ₹350

[Use Store Credit]
```

The backend should maintain the credit ledger and transaction history.

---

## Q30 — Payment deadline

### Decision

There is no custom-cake quotation/advance-payment system.

For normal catalogue orders:

**Full payment is required at checkout.**

Flow:

```text
Cart
 ↓
Checkout
 ↓
Payment
 ↓
Order Confirmed
```

No advance/balance payment workflow is required for the current catalogue.

---

## Q31 — Amount serialization

### Decision

Use **integer paise** for backend/payment processing.

Example:

```text
₹500.50
   ↓
50050 paise
```

Do not rely on floating-point decimal values for monetary calculations.

---

# 10. Orders & Post-Purchase

## Q32 — Reorder

### Decision

**YES — required.**

Customer can reorder products from a previous order.

The system must revalidate:

- Current product availability
- Current price
- Current options
- Current offers

before adding products to the new cart.

---

## Q33 — Order list

### Decision

Use:

```text
Active
Past
Cancelled
```

Suggested customer navigation:

```text
Orders
├── Active
├── Past
└── Cancelled
```

---

## Q34 — Return/refund window

### Decision

Do not blindly use the schema's 24-hour default.

GUNUCO should define its actual food/cake refund and complaint policy.

For food and cake products, the policy may focus on issues such as:

- Wrong product
- Missing product
- Damaged product
- Quality issue
- Other approved fulfilment problems

Once the business policy is finalized, backend should enforce it.

---

## Q35 — Evidence photos

### Decision

Maximum **3 evidence photos** for a return/refund/complaint case.

Recommended supported formats:

```text
JPG
PNG
WEBP
```

A suitable file-size limit should be enforced by backend.

---

## Q36 — Support ticket replies

### Decision

**YES.**

Customers can continue communicating through a support ticket.

Example:

```text
Customer
    ↓
Creates Support Ticket
    ↓
Support Replies
    ↓
Customer Replies
    ↓
Support Replies
```

---

## Q37 — Cancellation reasons

### Decision

Use predefined reasons plus `Other`.

Example:

```text
Why are you cancelling?

○ Ordered by mistake
○ Changed my mind
○ Delivery taking too long
○ Other
```

If `Other` is selected, allow optional text.

Backend should determine whether cancellation is allowed based on order status.

---

# 11. Custom Cakes

## Q38 — Reference image

### Decision

**NOT APPLICABLE.**

There is no custom-cake reference-image upload feature.

---

## Q39 — Custom cake clarification thread

### Decision

**NOT APPLICABLE.**

There is no custom-cake clarification conversation.

---

## Q40 — Edit pending custom cake request

### Decision

**NOT APPLICABLE.**

There is no custom-cake request.

---

## Q41 — Edit after custom cake quote approval

### Decision

**NOT APPLICABLE.**

There is no custom-cake quotation/approval workflow.

---

## Final Cake Product Rule

Wedding Cakes and Birthday Cakes are normal catalogue products.

Example:

```text
Cakes
  ↓
Wedding Cakes
  ↓
Wedding Cake Product
  ↓
Select available options
  ↓
Add to Cart
```

and:

```text
Cakes
  ↓
Birthday Cakes
  ↓
Kids Birthday Cake
  ↓
Select available options
  ↓
Add to Cart
```

No quotation, admin approval, reference image, or custom request process.

---

# 12. Notifications & Permissions

## Q42 — Push provider

### Decision

Customer App:

- Android → FCM
- iOS → APNs
- Expo-compatible React Native notification architecture

Notifications should deep-link to the relevant screen.

Example:

```text
Notification:
Your order is out for delivery.

Tap
 ↓
Order Details
 ↓
Live Tracking
```

---

## Q43 — Push vs SMS vs email

Recommended initial model:

| Event | Channel |
|---|---|
| OTP | SMS |
| Order Confirmed | Push |
| Payment Success | Push |
| Order Preparing | Push |
| Order Ready | Push |
| Out for Delivery | Push |
| Rider Nearby | Push |
| Delivered | Push |
| Support Update | Push |
| Review Reminder | Push |
| Important security/account messages | Push/SMS as appropriate |

Do not send SMS for every order event.

---

## Q44 — Notification permission timing

Do not ask for notification permission immediately on first app launch.

Ask at an appropriate point after explaining the value.

Example:

```text
Get order updates

Allow notifications to know when
your order is ready or out for delivery.

[Allow Notifications]
```

---

# 13. Localization, Legal & Brand

## Q45 — Languages

### Decision

**English only.**

Multiple languages are **NOT required**.

The architecture should avoid hard-coding user-facing strings everywhere so localization can be added later if needed.

---

## Q46 — Brand assets

The development team should receive the final GUNUCO design assets:

- Logo
- Brand colors
- Typography
- Font files/licenses
- Icons
- Images
- Design system
- Component styling guidelines

---

## Q47 — Legal screens

Required:

- Terms & Conditions
- Privacy Policy
- Refund Policy
- Cancellation Policy

Relevant legal/business links should also be available from the appropriate account/footer/settings areas.

---

## Q48 — Dark mode

### Decision

**YES — required.**

Support:

```text
☀️ Light Mode
🌙 Dark Mode
```

The design system should define both themes from the beginning.

---

## Q49 — App store listing / force update / maintenance

### Decision

Backend should support:

- Minimum supported app version
- Latest app version
- Force update
- Maintenance mode

Example:

```text
A new version of GUNUCO is available.

Please update the app to continue.

[Update Now]
```

Maintenance mode example:

```text
GUNUCO is temporarily under maintenance.

Please try again later.
```

---

# 14. Tax & Invoice

## Q50 — Tax display

### Decision

Show applicable tax as a separate line item.

Example:

```text
Subtotal              ₹1,000
GST                      ₹50
Discount                -₹100
────────────────────────────
Total                    ₹950
```

The actual applicable tax treatment/rates should be confirmed by the business/CA and implemented according to the final tax rules.

---

## Q51 — Invoice/receipt

### Decision

**YES — required.**

Customer can download an invoice/receipt PDF from Order Details.

Example:

```text
Order Details

Order #GUNUCO12345

[Download Invoice]
```

The backend should generate/provide the invoice.

---

# 15. Error Copy & Business Messaging

## Q52 — Standard customer-facing messages

### Decision

Backend should define standardized error/business codes.

Examples:

```text
ORDERS_NOT_ACCEPTING
PRODUCT_UNAVAILABLE
ADDRESS_NOT_SERVICEABLE
SLOT_UNAVAILABLE
PAYMENT_FAILED
CART_PRICE_CHANGED
CART_ITEM_UNAVAILABLE
STORE_CLOSED
ORDER_CANCELLATION_NOT_ALLOWED
```

The mobile app should map these to friendly customer-facing messages.

Examples:

```text
Backend:
ADDRESS_NOT_SERVICEABLE

Customer:
Sorry, GUNUCO isn't currently delivering
to this location.
```

```text
Backend:
PRODUCT_UNAVAILABLE

Customer:
Sorry, this product is currently unavailable.
Please remove it from your cart.
```

The canonical business messages should be agreed between product/backend/mobile teams.

---

## Q53 — Correlation ID

### Decision

Do not normally expose correlation IDs to customers.

Keep them available internally for:

- Developers
- Backend logs
- Support
- Troubleshooting

Customer sees:

```text
Something went wrong.
Please try again.
```

Support can access the technical reference internally.

---

# 16. Scope Boundaries

## Q54 — Customer app scope

### Decision

The Expo/React Native app is **Customer-only**.

It does not contain:

- Rider modules
- Admin modules

Customer App:

```text
React Native / Expo
├── Android
└── iOS
```

---

## Q55 — Customer ↔ Rider communication

### Decision

**YES — required.**

During active delivery, the customer can:

```text
🚴 Rider Details

[💬 Chat]
[📞 Call]
```

Rider chat should be available only according to order/delivery status rules defined by backend.

---

## Q56 — Share order / referral

### Decision

**Referral/invite system is NOT required.**

Do not build:

- Refer & Earn
- Invite Friend
- Referral Codes
- Referral Rewards

Order sharing is also not required unless separately added to the product scope.

---

# 17. GUNUCO Rider App

The Rider App is a separate application from the Customer App.

## Technology

**React Native**

## Platform

**Android only**

```text
GUNUCO Rider App
    ↓
React Native
    ↓
Android ✅
iOS ❌
```

## Recommended Rider Flow

```text
Rider Login
    ↓
Dashboard
    ↓
Assigned Orders
    ↓
Accept / Start Delivery
    ↓
Navigate to Pickup
    ↓
Picked Up
    ↓
Start Delivery
    ↓
Live Location Sharing
    ↓
Customer Chat / Call
    ↓
Arrive at Customer
    ↓
Delivered
```

The Rider App should provide the location updates required for customer live tracking.

---

# 18. GUNUCO Admin Panel

Admin remains a separate **web application**.

```text
Admin Panel
    ↓
Web
```

Recommended responsibilities include:

- Product management
- Main category management
- Subcategory management
- Product options/variants
- Pricing
- Inventory/availability
- Featured products
- Offers
- Coupons
- Orders
- Customers
- Addresses where operationally needed
- Riders
- Rider assignments
- Delivery monitoring
- Store Credit management
- Reviews
- Support tickets
- Notifications
- App configuration
- Maintenance mode
- Version configuration

---

# 19. Overall GUNUCO Application Architecture

```text
                         GUNUCO SYSTEM
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ↓                 ↓                 ↓
      CUSTOMER APP        RIDER APP         ADMIN PANEL
      React Native        React Native          Web
         + Expo
            │                 │
       ┌────┴────┐            │
       ↓         ↓            ↓
    Android     iOS        Android only
       ✅        ✅             ✅
```

All applications communicate with the same backend/API layer.

```text
Customer App ───────┐
                    │
Rider App ──────────┼──→ GUNUCO Backend/API
                    │
Admin Panel ────────┘
                           │
                           ↓
                       Database
                           │
                 ┌─────────┼─────────┐
                 ↓         ↓         ↓
              Payments   Storage   Notifications
```

---

# 20. Current Customer Catalogue

## Active now

```text
CAKES
│
├── GUNUCO Premium
├── Cakes
├── Cookies
├── Wedding Cakes
└── Birthday Cakes
```

## Future categories

```text
COFFEE
PIZZA
BURGERS
```

These should be supported architecturally but do not need to be active in the current launch.

---

# 21. Customer Shopping Flow

```text
                         GUNUCO CUSTOMER APP
                                  │
                                  ↓
                                HOME
                                  │
                    ┌─────────────┴─────────────┐
                    ↓                           ↓
                 CAKES                        OFFERS
                    │
          ┌─────────┼─────────┬─────────┬──────────────┐
          ↓         ↓         ↓         ↓              ↓
      GUNUCO      Cakes    Cookies   Wedding       Birthday
      Premium                         Cakes           Cakes
          │         │         │         │              │
          └─────────┴─────────┴─────────┴──────────────┘
                                  │
                                  ↓
                          PRODUCT DETAILS
                                  │
                          Select Options
                                  │
                                  ↓
                            ADD TO CART
                                  │
                                  ↓
                            COMMON CART
                                  │
                                  ↓
                              CHECKOUT
                                  │
                    ┌─────────────┼─────────────┐
                    ↓             ↓             ↓
                 Address         Slot         Coupon
                    │             │             │
                    └─────────────┼─────────────┘
                                  ↓
                              PAYMENT
                                  │
                                  ↓
                           ORDER CONFIRMED
                                  │
                                  ↓
                              PREPARING
                                  │
                                  ↓
                                READY
                                  │
                                  ↓
                         OUT FOR DELIVERY
                                  │
                    ┌─────────────┼─────────────┐
                    ↓             ↓             ↓
                Live Map        Chat          Call
                    │
                    ↓
                              DELIVERED
                                  │
                                  ↓
                            ⭐ REVIEW
```

---

# 22. Current Required Customer App Features

## Required

```text
👤 Phone OTP Login
🏠 Home
🔎 Search
📂 Main Category
📂 Subcategories
🛍️ Product Catalogue
🎂 Birthday Cakes
🎂 Wedding Cakes
🍪 Cookies
🍰 GUNUCO Premium
🍰 Cakes
🛒 Common Cart
📍 Saved Addresses
🚚 Delivery
🏪 Pickup
🕐 Scheduling
💳 Online Payment
🎟️ Coupons
🎁 Offers
❤️ Wishlist
⭐ Ratings & Reviews
📦 Order History
🔄 Reorder
🚴 Live Rider Tracking
💬 Rider Chat
📞 Rider Call
🔔 Push Notifications
💰 Store Credit
🧾 Invoice PDF
🎫 Support Tickets
🌙 Dark Mode
⚖️ Legal Pages
```

---

# 23. Explicitly Not Required

```text
❌ Custom Cake Request
❌ Custom Cake Quotation
❌ Custom Cake Reference Image
❌ Custom Cake Admin Approval
❌ Custom Cake Clarification Thread
❌ Custom Cake Advance/Balance Payment
❌ Multiple Languages
❌ Referral / Invite / Refer & Earn
```

---

# 24. Future Main Categories

The current launch is only Cakes.

Later:

```text
Cakes       ✅ Current
Coffee      ⏳ Future
Pizza       ⏳ Future
Burgers     ⏳ Future
```

When these are launched, they should plug into the existing:

```text
Catalogue
   ↓
Product Details
   ↓
Cart
   ↓
Checkout
   ↓
Payment
   ↓
Order
   ↓
Delivery/Pickup
```

No fundamental redesign should be required.

---

# 25. Final Q1–Q56 Summary

| ID | Final Decision |
|---|---|
| Q1 | Create Customers table/entity |
| Q2 | Phone + OTP |
| Q3 | Guest browsing YES; guest checkout NO |
| Q4 | Phone change allowed with new-number OTP |
| Q5 | Access + refresh tokens; stay logged in; multiple devices |
| Q6 | Server-persisted cart |
| Q7 | One common cart for all catalogue products |
| Q8 | Multiple products in one checkout |
| Q9 | Revalidate availability/price/options at checkout |
| Q10 | Saved customer address book |
| Q11 | Full address + lat/lng fields |
| Q12 | Google Maps |
| Q13 | Multiple addresses + default address |
| Q14 | Search + category/price/relevant filters + sorting |
| Q15 | Aggregated Home API |
| Q16 | Admin-controlled Featured products |
| Q17 | Cookies are Cakes subcategory; normal product structure |
| Q18 | Coupon codes + automatic offers |
| Q19 | Backend controls offer stacking |
| Q20 | Order/product/subcategory offer scopes |
| Q21 | Wishlist REQUIRED |
| Q22 | Ratings & Reviews REQUIRED |
| Q23 | ASAP + scheduled slots |
| Q24 | Same-day cutoff message |
| Q25 | Live rider tracking REQUIRED |
| Q26 | Backend assigns production house |
| Q27 | Razorpay |
| Q28 | UPI + Cards + Net Banking |
| Q29 | Store Credit REQUIRED |
| Q30 | Full payment at checkout |
| Q31 | Integer paise |
| Q32 | Reorder REQUIRED |
| Q33 | Active / Past / Cancelled |
| Q34 | Define actual GUNUCO food/cake refund policy |
| Q35 | Maximum 3 evidence photos |
| Q36 | Support ticket replies REQUIRED |
| Q37 | Predefined cancellation reasons + Other |
| Q38 | Not applicable — no custom cakes |
| Q39 | Not applicable — no custom cakes |
| Q40 | Not applicable — no custom cakes |
| Q41 | Not applicable — no custom cakes |
| Q42 | FCM Android + APNs iOS + Expo-compatible setup |
| Q43 | Push for order events; SMS mainly OTP |
| Q44 | Request notification permission contextually |
| Q45 | English only |
| Q46 | Final GUNUCO brand assets required |
| Q47 | Terms, Privacy, Refund, Cancellation policies |
| Q48 | Dark Mode REQUIRED |
| Q49 | Version control + force update + maintenance mode |
| Q50 | Show applicable tax separately |
| Q51 | Invoice PDF REQUIRED |
| Q52 | Standard backend error/business codes |
| Q53 | Correlation ID hidden from customers |
| Q54 | Customer-only React Native/Expo app; Android + iOS |
| Q55 | Rider Chat + Call REQUIRED |
| Q56 | Referral/invite system NOT REQUIRED |

---

# 26. Final Scope Statement

The current GUNUCO Customer App should be built as a **Customer-only React Native/Expo application for Android and iOS**.

The current catalogue launch contains only the **Cakes** main category:

```text
Cakes
├── GUNUCO Premium
├── Cakes
├── Cookies
├── Wedding Cakes
└── Birthday Cakes
```

All products are standard catalogue products and use **one common cart and checkout flow**.

There is **no custom cake request or quotation system**.

The application must include Wishlist, Ratings & Reviews, Live Rider Tracking, Rider Chat, Dark Mode, and Store Credit.

The application does **not** require Multiple Languages or Referral/Invite functionality.

The Rider App will be a **separate React Native Android-only application**.

The Admin Panel will be a **separate web application**.

Future main categories — **Coffee, Pizza and Burgers** — should be supported by the architecture but remain inactive until GUNUCO is ready to launch them.
