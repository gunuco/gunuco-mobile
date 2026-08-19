# GUNUCO Customer App — Recommended Decisions

> Recommended launch defaults. Product/backend should approve these decisions before dependent UI and API contracts are locked.
>
> Confirmed: customer authentication uses phone number + OTP only. Customer, OTP, session, and saved-address tables are defined in `tables.sql`.

---

## 1. Customer Identity & Authentication

| ID | Recommended answer |
|---|---|
| Q1 | Yes. Use a `Customers` account identified by unique E.164 phone number. |
| Q2 | Yes. Phone number + OTP only; no password, email, or social login. |
| Q3 | Yes for browsing; no for checkout. Require OTP login before checkout. |
| Q4 | Yes. Verify OTPs on both the old and new phone numbers; support handles loss of the old number. |
| Q5 | Access token: 15 minutes; rotating refresh session: 30 days; maximum 3 active devices; revoke the token family on refresh-token reuse. |

---

## 2. Cart Persistence

| ID | Recommended answer |
|---|---|
| Q6 | Hybrid: local cart for guests, merged into a server cart after login. |
| Q7 | No. Custom cakes use a separate request, quote, and checkout path. |
| Q8 | Yes, only when all items share one location, fulfilment method, and compatible slot. |
| Q9 | Revalidate availability and server pricing at cart display and checkout; block unavailable items and require acceptance of price changes. |

---

## 3. Addresses

| ID | Recommended answer |
|---|---|
| Q10 | Yes. Provide saved-address CRUD; `CustomerAddresses` is included in `tables.sql`. |
| Q11 | Recipient name, phone, address line 1, city, state, postal code, latitude, and longitude; line 2, landmark, and label are optional. |
| Q12 | Google Maps for consistent Android/iOS geocoding and pin selection. |
| Q13 | Yes. Keep one default active address per customer and preselect it at checkout. |

---

## 4. Search, Home, Discovery

| ID | Recommended answer |
|---|---|
| Q14 | Filter by category, egg preference, price range, and availability; sort by relevance, price, newest, and popularity. |
| Q15 | Yes. Use one aggregated, cacheable `home` API. |
| Q16 | Admin-curated products first, then available best sellers; exclude unavailable products. |
| Q17 | Yes. Manage every customization group independently from the web Admin Panel at three levels: main category ON/OFF, subcategory Inherit/ON/OFF, and product Inherit/ON/OFF. Resolve Product, then Subcategory, then Main Category, otherwise OFF. A product may expose only Sweetener Type while Egg/Eggless, Flour, Flavour, and Size/Weight remain OFF. Quantity is always present and has separate inherited Minimum/Maximum/Default rules. Branch Manager is read-only. Defaults remain OFF for GUNUCO PREMIUM CAKES, GUNUCO CHEESE CAKES, GUNUCO BROWNIES, and GUNUCO NYC COOKIES; ON for CASUAL CAKES, WEDDING OR ANNIVERSARY CAKES, and OCCASIONAL CAKES. |
| Q17A | All Flavour, Egg/Eggless, Sweetener, and Flour customization prices are entered by Admin once on a 1kg basis. Calculate every weight as `1kg contribution x (selected grams / 1000)` for catalogue and Custom Cakes; 500g is half of the 1kg value. Weight availability and base cake price remain separate. |

---

## 5. Offers

| ID | Recommended answer |
|---|---|
| Q18 | No coupon entry at launch; auto-apply eligible offers. |
| Q19 | No stacking. Apply the single best eligible offer and show why it was selected. |
| Q20 | Launch with order, category, and product scopes; defer add-on scope. |

---

## 6. Wishlist, Feedback & Testimonials

| ID | Recommended answer |
|---|---|
| Q21 | No. Defer wishlist until after launch. |
| Q22 | No product ratings or star reviews. Yes to one message-only feedback submission per completed order, prompted by in-app/push notification. Admin may publish consented, moderated feedback as image-backed testimonials in app and static-website carousels. |

---

## 6A. Web Admin Roles & Menu Management

| ID | Recommended answer |
|---|---|
| Q22A | The web Admin Panel has exactly three roles: Owner, Admin, and Branch Manager. Support agents and delivery partners use separate panels and are not admin roles. |
| Q22B | Use one Zomato-style Menu Management workspace with Products, Categories, Add-Ons, Customization, Pricing & Weights, and Location Availability tabs. Product entry starts from the selected category/subcategory and includes descriptions, images, pricing, options, add-ons, preview, draft, and publish. |
| Q22D | Do not use one blanket customization switch. Owner/Admin enable only the required groups independently at main-category, subcategory, or product level. ON requires a valid selection and configured default; OFF hides and server-rejects the group; Inherit uses the nearest explicit parent setting. |
| Q22C | Owner and Admin manage global menu definitions. Branch Manager has read-only definitions and may update assigned-location availability, sold-out state, quota, and explicitly authorized location price overrides. |

---

## 7. Fulfilment & Slots UX

| ID | Recommended answer |
|---|---|
| Q23 | Show server-provided named slots with start/end times for Pickup-at-Store and local Doorstep-Delivery; capacity is server-controlled. NYC Cookies Nationwide-Delivery instead shows the snapshotted minimum/maximum delivery-day range. |
| Q24 | “Same-day ordering has closed. Choose the next available date.” |
| Q25 | No live location at launch; show status timeline and server-provided ETA. |
| Q26 | No customer location picker. Assign the best serviceable location server-side. |

---

## 8. Payment

| ID | Recommended answer |
|---|---|
| Q27 | Razorpay mobile SDK, with server-created orders and verified webhooks. |
| Q28 | UPI, cards, and net banking at launch; defer wallets and store credit. |
| Q29 | Not applicable at launch. Later, issue store credit only from approved refunds/admin adjustments with a ledger. |
| Q30 | Full payment is required immediately to book every order. No advance, installment, balance deadline, or pay-later option. |
| Q31 | Integer paise in APIs and gateway calls; decimal currency only in SQL/display formatting. |

---

## 9. Orders & Post-Purchase

| ID | Recommended answer |
|---|---|
| Q32 | No at launch. |
| Q33 | Yes: Active, Past, and Cancelled. |
| Q34 | Yes: 24 hours after collection/delivery. |
| Q35 | Maximum 3 images, each JPEG/PNG/WebP up to 5 MB. |
| Q36 | Yes. Allow a message thread until the ticket is closed. |
| Q37 | Predefined reason plus optional free-text details. |
| Q37A | `WEDDING OR ANNIVERSARY CAKES` alone requires fulfilment from exactly 72 through exactly 720 hours after server order creation. Earlier/later times are blocked before payment and on the server. Add a dedicated Admin queue; records also remain in ordinary Orders. Other categories and Custom Cakes do not inherit this fixed window. |
| Q37B | Add Support Tickets to the main web Admin Panel. Owner and Admin see all authorized tickets; Admin has all ticket-operational controls including assignment, priority, replies, notes, escalation, Open/Pending/Closed, Close, and Reopen. Branch Manager is assigned-location scoped with limited reply/note/Open/Pending actions. Ticket actions cannot bypass order, payment, cancellation, or refund authorization. |
| Q37C | For Doorstep Delivery, never expose internal or public Order ID to the delivery partner. Show order details and Call Customer using an opaque assignment reference; the rider asks the customer for the Order ID, enters it, and can mark Delivered only after an exact server match. For Pickup-at-Store, authorized Owner/Admin/Branch Manager/POS order views may display Order ID, but staff still asks the customer and manually validates a blank input before Mark Collected. |
| Q37D | Only `GUNUCO NYC COOKIES` supports optional Nationwide-Delivery. Admin has independent Regular City and All-India ON/OFF controls; All India supports all 28 states plus 8 union territories or a selected subset, with shipping fee and minimum/maximum delivery days. Default is Regular City ON and All India OFF. Nationwide orders use courier shipment tracking, never local riders. Delivery coverage does not enable customization groups; NYC Cookies keeps independent category/product Inherit/ON/OFF customization controls. |

---

## 10. Custom Cakes

| ID | Recommended answer |
|---|---|
| Q38 | Yes. One JPEG/PNG/WebP image up to 5 MB. |
| Q39 | Message thread with timestamps and sender identity. |
| Q40 | Yes, until review starts; editing resets review/quote state. |
| Q41 | No. Changes require requoting to prevent stale fees and feasibility decisions. |

---

## 11. Notifications & Permissions

| ID | Recommended answer |
|---|---|
| Q42 | Expo Notifications backed by FCM/APNs; payload contains versioned event type and entity ID, never a raw arbitrary URL. |
| Q43 | OTP by SMS; order/payment/delivery and feedback prompts in-app + push; critical failures/refunds also by SMS; receipts by email when available. |
| Q44 | Optional. Ask after login or first order, when the benefit is clear. |

---

## 12. Localization, Legal, Brand

| ID | Recommended answer |
|---|---|
| Q45 | English only at launch, but externalize all customer-facing strings. |
| Q46 | Product must supply approved logo, palette, and licensed fonts before visual sign-off. |
| Q47 | Yes: Terms, Privacy, cancellation/refund/return policy, and contact details. Acceptance must be versioned. |
| Q48 | No at launch. |
| Q49 | Yes. Add remote minimum-supported-version and maintenance-mode configuration. |

---

## 13. Tax & Invoice

| ID | Recommended answer |
|---|---|
| Q50 | Yes. Show tax as a separate line when non-zero; show “Taxes included” when prices are tax-inclusive. Server decides tax treatment. |
| Q51 | Yes. Provide downloadable PDF invoice after successful payment, using an immutable order snapshot. |

---

## 14. Error Copy & Business Messaging

| ID | Recommended answer |
|---|---|
| Q52 | Orders off: “We’re not accepting new orders right now.” Quota: “This item is sold out for the selected date.” Address: “Delivery isn’t available at this address.” Stale quote: “Your price has changed. Review the updated total.” Payment confirmation: “Payment is being confirmed. Don’t pay again.” |
| Q53 | Yes, as a short “Reference ID” on unexpected/supportable failures only. |

---

## 15. Scope Boundaries

| ID | Recommended answer |
|---|---|
| Q54 | Yes. Customer-only Expo binary. |
| Q55 | No chat. Allow masked calling only after rider assignment. |
| Q56 | No at launch. |

---

## 16. Confirmed POS Experience

- Yes. Use a real-time, Zepto-style category-driven POS workspace, not a simplified order-entry form.
- Left: dynamic active category/subcategory rail generated for the operator's location.
- Center: products for the selected category with search, availability, live prices, customization, and add-ons.
- Right: persistent server-side cart with customer, pickup, quote, totals, and payment controls.
- Persist active and held carts; restore them after refresh or reconnect.
- Requote on catalogue, price, customization, offer, quota, or availability changes and require review before payment.
- Convert a validated cart into one accepted POS order only after verified cashless payment.
- Keep Coffee, Pizza, and Burgers hidden while inactive; they appear automatically when configured and activated.

---

## 17. Contract Process

Approve or amend Q1–Q56 in a product/backend OpenAPI review before Phase 2–7 implementation locks. Record approved values in versioned API contracts and server configuration.

Until approval:

- Keep Wishlist disabled by a feature flag. Do not implement product star-rating or public review components.
- Isolate mocks behind API modules.
- Prefer server-driven option schemas over hard-coded cake-only screens.

---

*End of open questions.*
