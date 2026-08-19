# GUNUCO System - End-to-End Workflow

## System Scope

GUNUCO has four top-level categories: `Cakes`, `Coffee`, `Pizza`, and `Burgers`. Only `Cakes` is active at launch; the other top-level categories are seeded inactive for future implementation. The Cakes launch subcategories are `GUNUCO PREMIUM CAKES`, `GUNUCO CHEESE CAKES`, `GUNUCO BROWNIES`, `GUNUCO NYC COOKIES`, `CASUAL CAKES`, `WEDDING OR ANNIVERSARY CAKES`, and `OCCASIONAL CAKES`. `Pickup-at-Store` means collection from the order's assigned location; at launch this is the production house.

The implementation must be multi-location and multi-category ready from the first release. Admin can add, edit, activate, deactivate, and order parent categories and subcategories from the web Admin Panel. Activating Coffee, Pizza, or Burgers later must not require code or navigation changes. Category and subcategory names must be database configuration, not hard-coded application enums. Category-specific options belong to configurable product schemas or category modules; cake-only fields must not be required for non-cake products.

Branches are disabled at launch. The production house is the initial location and uses the same location contract that future branches use. Every product availability record, staff assignment, order, POS sale, pickup, delivery origin, quota, and report must carry a location identifier. This prevents future branches from requiring a migration from location-less records.

## Main Panels

1. Web Admin Panel (desktop-first responsive web)
2. Delivery Partner Panel (mobile)
3. Customer Support Panel (web/desktop, separate support subdomain)

The web Admin Panel is shared by Owner, Admin, and Branch Manager. Navigation, commands, records, and location scope are resolved from server-side role permissions.

## Roles And Access

### Owner

- Full access to all system features.
- Creates and manages Admins, Branch Managers, and delivery partners.
- Creates branches and controls global order acceptance, category activation, catalogue availability, quotas, POS, and settings.
- Has all Admin capabilities and final authority over every category, subcategory, product, price, and add-on.
- Owner access cannot be created, modified, or removed by any lower role.

### Admin

- Manages authorized operations across all authorized locations, including Menu Management, custom-cake options, orders, production, delivery, offers, refunds, returns, Branch Managers, delivery partners, and reports.
- Has all operational controls for customer support tickets across authorized locations: view, search, assign, reassign, unassign, prioritize, reply, add internal notes, own escalations, change status, reopen, and close.
- Can add, edit, activate, deactivate, and reorder categories, subcategories, products, and add-ons from the Admin Panel.
- Can validate pickup Order IDs and complete store handover at any authorized location.
- Cannot manage Owner access, create another Owner, create branches, or change owner-only global controls.

### Branch Manager

- Assigned to one or more locations by Owner or Admin.
- Manages orders, production, pickup, local delivery operations, and assisted POS only for assigned locations.
- Can validate pickup Order IDs and complete store handover only for orders assigned to an authorized location.
- Can create an assisted POS order only when POS is enabled for that location and the customer cannot reasonably use the application.
- Can view Menu Management and update assigned-location availability, sold-out state, quota, and authorized location price overrides.
- Cannot change global category/product definitions, manage Owner or Admin access, enable POS, create branches, activate categories, or change global business rules.
- Sees only assigned-location operations.

### Delivery Partner

- Sees only assigned deliveries.
- Accepts assignments and updates pickup and delivery statuses.
- Cannot access admin, catalogue, pricing, or production controls.

### Customer Support Agent

- Uses the separate Customer Support Panel and sees only support tickets and the minimum read-only order information needed to answer them.
- Can review, assign, reply to, escalate, and resolve tickets according to predefined support rules.
- Cannot change orders, payments, prices, production, delivery, refunds, categories, users, or administrative settings.
- Cannot bypass cancellation eligibility. Requests outside the configured cancellation window can only be explained or escalated to Admin for review; escalation does not guarantee cancellation or refund.

## Setup And Configuration

### Locations And Branches

Owner configures the production house and future branches with name, code, address, contact details, operating hours, service area, order acceptance status, active categories, admin access, and POS ON/OFF. Branch creation is unavailable to customers, Admins, and Branch Managers. Disabling a branch or its POS prevents new activity but preserves all historical orders and audit records.

The order location is selected server-side from the customer's service/pickup choice or the authenticated Branch Manager's assigned location. It cannot be trusted from an unrestricted client value.

### Menu Management

Owner and Admin maintain the complete customer menu in one Zomato-style web workspace instead of separate catalogue, category, add-on, and pricing routes.

1. Select or create a parent category in the left hierarchy.
2. Select or create a subcategory beneath it.
3. View all products for that category context in the center list/grid.
4. Choose Add Product; the selected parent and subcategory are prefilled.
5. Enter product code, name, short and full descriptions, images, base and discount prices, tax class, preparation time, display order, featured state, same-day state, quota, and availability.
6. Configure only the selected category module's applicable sizes, customization, add-ons, and option prices.
7. Save incomplete work as Draft and preview the exact customer menu card/detail page.
8. Publish only after required content, image, valid pricing, active location, and enabled-option pricing validations pass.
9. Reorder, duplicate, archive, import, export, or bulk-update products without leaving the selected category.

Menu Management contains `Products`, `Categories`, `Add-Ons`, `Customization`, `Pricing & Weights`, and `Location Availability` tabs. Category selection, filters, scroll position, and drafts persist between tabs. Owner and Admin edit global definitions. Branch Manager has read-only definitions and assigned-location overrides only. Every mutation is audited.

When `GUNUCO NYC COOKIES` is selected, show an additional `Delivery Coverage` panel. It is unavailable for every other subcategory. Owner and Admin control Regular City and All-India delivery; Branch Manager sees the effective coverage read-only.

Each standard cake contains:

- Cake name and description
- Category: Cakes
- Any enabled customization options inherited from its subcategory or overridden for the product
- Size/weight
- Price and optional discount price
- Preparation time
- Product image
- Daily quantity quota
- Same-day delivery availability
- Available/Unavailable toggle

Every product references its most specific configured category. For a subcategory product, the parent category is derived from the category hierarchy. Premium products display a GUNUCO PREMIUM badge. Category changes preserve historical order snapshots.

### Categories And Subcategories

- Owner has full control and final authority; Admin performs day-to-day category management from the Admin Panel.
- Admin can add, edit, activate, deactivate, and reorder parent categories and subcategories.
- Branch Manager cannot create or modify category definitions, but sees active categories assigned to authorized locations.
- A subcategory has exactly one parent category. Parent categories cannot be deleted while products or subcategories depend on them; deactivate them instead to preserve history.
- Activating a category globally does not automatically expose it at every location. Location availability must also be enabled.
- Coffee, Pizza, and Burgers remain inactive until their catalogue, option schema, pricing, and operational rules are configured and approved.

### Category And Product Customization Controls

Owner and Admin control customer customization only from `Menu Management > Customization` in the web Admin Panel. Controls are independent for `Flavour Type`, `Egg or Eggless`, `Sweetener Type`, `Flour Type`, and `Size or Weight`.

There is no blanket `Enable Customization` action that turns on every group. Admin selects only the groups needed for each main category, subcategory, or product. `ON` means the group applies and a valid selection is required, with its configured default preselected; `OFF` means the group is hidden and rejected if submitted; `Inherit` uses the nearest explicit parent setting.

- Each main category has an explicit ON/OFF root switch for every customization type; a main category cannot inherit.
- Each subcategory has `Inherit`, `ON`, or `OFF` for every customization type. `Inherit` uses its parent main-category value.
- Each product has `Inherit`, `ON`, or `OFF` for every customization type. `Inherit` uses its subcategory effective value, or its main-category value when the product belongs directly to a main category.
- Effective configuration is resolved as `product explicit ON/OFF`, then `subcategory explicit ON/OFF`, then `main-category ON/OFF`, otherwise OFF.
- Every customization type resolves independently. Enabling Sweetener Type never enables Egg/Eggless, Flour Type, Flavour Type, or Size/Weight. A product may set only Sweetener Type to `ON` and the other groups to `OFF`; customer and POS forms then show only Sweetener Type plus Quantity.
- Menu Management shows configured and effective state together, plus the source level that supplied the effective value.
- Launch defaults are OFF for GUNUCO PREMIUM CAKES, GUNUCO CHEESE CAKES, GUNUCO BROWNIES, and GUNUCO NYC COOKIES.
- Launch defaults are ON for CASUAL CAKES, WEDDING OR ANNIVERSARY CAKES, and OCCASIONAL CAKES.
- Owner or Admin may change a main category, subcategory, or product control without a deployment or schema change. Branch Manager sees effective values read-only.
- Quantity remains available for every sellable product and cannot be turned OFF. Admin controls Minimum Quantity, Maximum Quantity, and Default Quantity separately: main categories use explicit `Override`, while subcategories and products use `Inherit` or `Override`.
- Effective quantity resolves Product → Subcategory → Main Category → system default minimum `1`, maximum `99`, default `1`. Default must be within the effective range; customer/POS steppers and the server enforce the boundaries.
- Disabled customization controls are not rendered in customer checkout or POS and are rejected if submitted by a client.
- Enabling Flavour, Egg/Eggless, Sweetener, or Flour requires at least one available value, a default selection, and one 1kg price contribution for every active value. Enabling Size/Weight requires at least one active weight with its separate weight base price.
- Before saving a parent-level change, show affected subcategories/products and inherited counts. Explicit child overrides remain unchanged.
- Disabling an option affects new quotes and orders, emits a catalogue-change event, and requotes affected customer/POS carts. Completed order snapshots remain unchanged.

### Add-Ons

Admin manages an `Add-Ons` section in the Admin Panel. Each add-on includes name, description, price, required/optional status, minimum and maximum quantity, availability, display order, and applicable category, subcategory, or product assignments. Owner has full authority over add-ons; Branch Manager can only sell add-ons made available at an authorized location.

Required add-ons are included automatically or must be explicitly confirmed according to configuration. Optional add-ons are customer-selectable. The server validates applicability, quantity, availability, and price, includes add-ons in the quote, and stores add-on name, description, unit price, quantity, and total as immutable order-time snapshots.

### Custom Cake Configuration

Admin manages the choices available on custom-cake requests:

- Flavours, such as Chocolate, Vanilla, Red Velvet, and Butterscotch
- Egg preference: Egg or Eggless
- Sugar types, such as Regular Sugar, Less Sugar, Jaggery, and Sugar-Free
- Flour types: Maida and Wheat Flour
- Quantity
- Size/weight
- Cake theme or occasion
- Reference image upload
- Cake message and special instructions
- Minimum lead time
- Daily request quota

Custom Cakes are their own category and are always prepared by the production house.

## Order Flow

### Standard Cake Order

1. Customer selects a cake.
2. The server resolves every category/product customization group independently plus the effective quantity range. The customer chooses only enabled options and a quantity inside that range.
3. For regular-city catalogue fulfilment, the customer chooses same-day or a future available slot and selects `Pickup-at-Store` or `Doorstep-Delivery`. NYC Cookies may instead expose the separately configured Nationwide-Delivery method and delivery-day range.
4. For doorstep orders, customer enters a serviceable address; for pickup, the system shows production-house collection details.
5. The system recalculates the payable total. Customer pays the full amount online.
6. The system checks global order acceptance, product availability, requested quantity, and daily quotas.
7. The order is booked only after verified full payment and is sent to the production-house queue.
8. Admin accepts the order automatically or manually, according to settings.
9. Production status moves through `Accepted`, `Preparing`, and `Packed`, then to the applicable ready state.
10. A pickup order moves to `Ready for Pickup`; a doorstep order moves to `Ready for Delivery` and enters rider assignment.
11. Before a doorstep order is accepted, delivery status is `Not Started`; after acceptance it moves to `Pending Assignment`. Pickup orders always use delivery status `Not Required`.

#### Wedding Or Anniversary Cake Scheduling

- For `WEDDING OR ANNIVERSARY CAKES` only, requested fulfilment must be from exactly 72 hours through exactly 720 hours after immutable server order-creation time.
- Times below 72 hours and above 720 hours are unavailable in customer and POS date/time pickers and are rejected by the server before payment and again during atomic booking.
- Exactly 72 hours and exactly 720 hours are valid boundaries.
- The subcategory is never same-day eligible. Changing global, parent-category, product, or location same-day settings cannot override this minimum.
- No other Cakes subcategory or Custom Cake request inherits this fixed window.
- Existing paid order snapshots retain their booking-time requested fulfilment time; rescheduling must remain inside the original order-created-time window.

### Custom Cake Order

1. Customer opens Custom Cakes.
2. Customer selects flavour, Egg or Eggless, sugar type, flour type, size/weight, and quantity.
3. Customer selects an occasion or theme, uploads a reference image, and enters a cake message or special instructions.
4. Customer chooses `Pickup-at-Store` or `Doorstep-Delivery` and a fulfilment date/time from separately configured Custom Cake availability. Custom Cakes do not use the NYC Cookies-only Nationwide-Delivery method.
5. The system validates production feasibility, configured availability, and daily custom-cake quota. Custom Cakes do not inherit the Wedding or Anniversary Cakes fixed window.
6. Admin reviews feasibility, final price, instructions, and delivery schedule.
7. Admin approves the quote, requests clarification, or rejects the unpaid request. Quote approval does not change the order to `Accepted` or enter production.
8. Once Admin confirms feasibility and price, the customer approves the quote, reviews the final fulfilment fee, and pays the full amount.
9. Only after customer quote approval and verified full payment does the server change the order to `Accepted` and enter production.
10. Persist the Admin who sent the quote, Admin quote timestamp, customer response timestamp, quoted amount, and each status transition separately.
11. A pickup order enters the store pickup queue; only a doorstep order enters rider assignment.

## Order Statuses

```text
Not Accepted -> Accepted -> Preparing -> Packed -> Ready for Delivery
    -> Delivery Partner Assigning -> Assigned -> Picked Up
    -> Out for Delivery -> Delivered

Before delivery: Cancelled
After delivery: Return Requested -> Return Approved/Rejected -> Resolved
```

## Delivery Flow

1. Before payment, the customer chooses one eligible method: `Pickup-at-Store`, local `Doorstep-Delivery`, or NYC Cookies-only `Nationwide-Delivery` when enabled for the verified destination state/UT.
2. Pickup orders receive pickup instructions and never enter rider assignment.
3. For `Doorstep-Delivery`, the server validates the address, calculates road distance, and applies the configured fee.
4. The checkout immediately recalculates and displays `Subtotal - Discount + Delivery Fee = Payable Total` whenever the option or delivery address changes.
5. Customer reviews the selected option, fee, and final payable total before payment. Catalogue orders are booked only after verified full payment. Custom Cake requests may be saved before payment for clarification, feasibility review, and quoting, but cannot enter production until the quote is approved and full payment is captured.
6. When a doorstep order is accepted, the configured Automatic or Manual delivery-assignment mode is applied.
7. In Automatic mode, the system offers the order to an eligible delivery partner; in Manual mode, Admin selects one.
8. The rider sees the assigned order's fulfilment details, customer call action, address, items, quantity, notes, and payment-clearance state, but never sees the customer-facing Order ID or internal OrderID in any rider screen, notification, API response, log, or error.
9. At the doorstep, the rider calls or asks the customer for the Order ID, enters the customer-provided value against the opaque delivery assignment, and receives only success or failure. Only an exact server-validated match for that rider's assigned order enables `Mark Delivered`.

All pickup locations are the production house. There is no branch assignment or branch pickup.

### Fulfilment Methods And Fees

- `Pickup-at-Store` is always free and requires no rider or delivery address.
- Customer-facing Order IDs use `YY-N` with a minimum two-digit sequence, for example `26-01` and `26-888`; numbering restarts from `01` each calendar year.
- Pickup status moves through `Pickup Scheduled`, `Ready for Pickup`, and `Collected`. Authorized Owner, Admin, Branch Manager, and POS order screens may display the Order ID for store operations, but the pickup-validation field is never prefilled. Staff must ask the customer to state the Order ID, enter it, and receive an exact server match before `Confirm Collection` or `Mark Collected` is enabled.
- Initialize every newly booked pickup order with `Pickup Scheduled`; doorstep orders use `Not Applicable`. These values are set explicitly in the order-creation transaction.
- No OTP or separate pickup code is used. The same Order ID validation rule applies at the store and at the doorstep.
- Every validation attempt records the order, fulfilment option, validator, timestamp, submitted Order ID, and success or failure result.
- Generate the annual sequence atomically inside the order-creation transaction so concurrent checkouts cannot receive the same Order ID.
- Only an authenticated Owner, Admin, or Branch Manager authorized for the order's location can validate at the store, and only the rider assigned to that order can validate at the doorstep.
- Delivery-partner endpoints are assignment-based and use an opaque Delivery Assignment ID. They read from a rider-safe projection that excludes both the internal OrderID and customer-facing Order ID. Delivery partners never receive either identifier before or after validation.
- Fulfilment validation uses the exact customer-facing Order ID only. No OTP, separate pickup code, phone number, or client-submitted success flag can substitute for the server comparison.
- Save the successful validation and change the order to `Collected` or `Delivered` in one server transaction. Never trust a client-submitted success flag.
- For Pickup-at-Store and local Doorstep-Delivery, the customer provides the same Order ID received at booking. `Collected` or rider-completed `Delivered` remains disabled until the submitted value exactly matches that order's server-stored Order ID. Nationwide courier delivery instead uses its shipment tracking lifecycle.
- Validation responses reveal only success/failure and the next permitted action. They never echo the submitted value, expected Order ID, matched Order ID, or provide a partial-match hint.
- Rate-limit repeated failed attempts and alert Admin when unusual validation failures occur.
- All Cakes subcategories use the configured road-distance fee rules for `Doorstep-Delivery` unless a category is explicitly fee-exempt:
    - Up to and including 5 km: free.
    - Over 5 km through 8 km: Rs 39.
    - Over 8 km through 10 km: Rs 59.
    - Over 10 km through 15 km: Rs 159.
    - Beyond 15 km: unavailable by default; offer `Pickup-at-Store`.
- Custom Cakes can use `Pickup-at-Store` or `Doorstep-Delivery` with no delivery fee. Doorstep serviceability and scheduling validation still apply.

### GUNUCO NYC Cookies Delivery Coverage

- Only `GUNUCO NYC COOKIES` may use `Nationwide-Delivery`. Every other subcategory retains its existing Pickup-at-Store and local Doorstep-Delivery rules.
- Admin has independent `Regular City Delivery` and `All-India Delivery` ON/OFF controls. At least one must remain ON. Regular City is ON and All India is OFF by default.
- Regular City Delivery uses existing local address serviceability, road-distance fee bands, delivery slots, and assigned GUNUCO delivery partners.
- When All-India Delivery is ON, Admin chooses `All States & Union Territories` or `Selected States & Union Territories`. Selected mode provides search, multi-select, Select All, Clear All, state/UT ON/OFF rows, enabled count, and unsaved-change protection.
- All-India configuration requires a shipping fee, minimum delivery days, and maximum delivery days. Maximum cannot be below minimum. Selected mode cannot be published without at least one enabled state/UT.
- State availability is checked from the verified delivery address before quote and again during atomic booking. A disabled or inactive destination blocks payment.
- Nationwide orders snapshot destination state, coverage mode, shipping fee, and delivery-day range so later Admin changes do not alter paid orders.
- Nationwide orders use courier shipment tracking, not local delivery-partner assignment. Admin records carrier, tracking number/URL, estimated delivery date, and shipment status. Only a delivered shipment can complete the order.
- POS remains Pickup-at-Store only and cannot create Nationwide-Delivery orders.
- Enabling Regular City or All-India delivery does not enable customization groups. NYC Cookies customization remains independent at main-category, subcategory, and product level; Admin enables only the required Flavour, Egg/Eggless, Sweetener, Flour, or Size/Weight groups using the existing Inherit/ON/OFF rules.

NYC Cookies checkout may show `Pickup-at-Store`, local `Doorstep-Delivery`, and `Nationwide-Delivery` according to the verified address and Admin settings. If both local and nationwide methods qualify, the customer chooses one and reviews its recalculated fee and timing before full payment. Once production marks a nationwide order `Packed`, its shipment starts at `Pending Dispatch`; courier status then provides Booked, Dispatched, In Transit, Out for Delivery, Delivered, Delivery Failed, Returned, or Cancelled progress.
- Admin can dynamically add, edit, activate, deactivate, and schedule distance bands; change each minimum distance, maximum distance, and fee; control the maximum service range; manage pickup details; and retain the Custom Cake fee exemption.
- Distance bands must not overlap or leave ambiguous boundaries. The server uses the unrounded road distance and the active rule effective at quote time.
- The server calculates distance and fee, and saves the applied rule as an order snapshot.
- `Pickup-at-Store` always means collection at the configured production house; it does not introduce a separate store or branch entity.

### Automatic Delivery Assignment

- Admin controls Automatic/Manual assignment from the dashboard.
- Automatic assignment considers only Active, Online riders with Accept Deliveries ON, no schedule conflict, and matching service area.
- Lowest active workload is preferred; distance and rating break ties.
- The rider must accept within the configured timeout.
- Rejection or timeout offers the order to the next eligible rider.
- If nobody accepts, delivery remains `Pending Assignment` and Admin is alerted.
- Admin can assign or reassign before pickup, with every attempt retained in history.
- Admin sees `Deliveries Pending`, `Delivering`, and `Delivered Today`, plus the assigned rider for each order.

## Order Controls And Quotas

Controls are evaluated in this order:

1. Global Accept Orders ON/OFF
2. Category acceptance mode: Automatic or Manual
3. Category availability at the selected location; only Cakes is active at launch
4. Product availability
5. Wedding or Anniversary Cakes scheduling window: minimum 72 hours, maximum 720 hours
6. Daily global order limit
7. Daily category order limit
8. Daily product or custom-cake limit

If any applicable control blocks the request, the order is not accepted. Daily quota usage resets at midnight in the production house's configured timezone.

### Acceptance Modes

- `Automatic`: after all validation and limit checks pass, the order immediately becomes `Accepted` and enters the production queue.
- `Manual`: the order is created as `Not Accepted` and appears in Admin's Awaiting Acceptance queue.
- Admin can Accept or Reject an order awaiting manual review.
- Acceptance mode is configurable for every active parent category or subcategory and for Custom Cakes where applicable.
- Global Accept Orders OFF overrides both modes.
- A mode change applies only to new orders.

### Admin Order Controls Board

The Admin dashboard provides:

- Global Accept Orders ON/OFF
- Cakes Automatic/Manual acceptance selector
- Acceptance selectors for every active Cakes subcategory
- Custom Cakes Automatic/Manual acceptance selector
- Global orders-per-day limit
- Cakes orders-per-day limit
- Independent orders-per-day limits for every active Cakes subcategory
- Custom Cakes orders-per-day limit
- Product-specific daily quantity limits
- Current usage, remaining capacity, and utilization percentage
- 80 percent utilization alerts
- Wedding or Anniversary Orders card and dedicated queue with the 72-to-720-hour window

An order is blocked if accepting its requested quantity would exceed any applicable limit. Counts reset at midnight in the production house timezone.

### Same-Day Delivery

- Same-day delivery is available only for Cakes subcategories explicitly enabled by Admin at both category and product level.
- Admin independently enables or disables same-day delivery for each eligible Cakes subcategory.
- Admin controls cutoff time, minimum preparation lead time, delivery slots, slot capacity, service area, and per-cake eligibility.
- Same-day is shown only when timing, production capacity, quota, product availability, delivery capacity, and address checks all pass.
- Wedding or Anniversary Cakes never use same-day delivery and remain limited to 72 through 720 hours.
- Same-day orders require full online payment.
- A same-day slot is booked only after the full amount is captured online.
- There is no cash collection at the doorstep or store.

### Full Payment

- GUNUCO does not accept cash, Cash on Delivery, or cash at `Pickup-at-Store`.
- Every catalogue, custom-cake, same-day, customer-app, and POS order requires the complete server-calculated payable total.
- No advance, deposit, installment, balance-due, pay-later, Cash, or Cash on Delivery option is available.
- An unpaid custom-cake request may exist for clarification and quoting, but it is not booked and cannot enter production.
- Payment success is trusted only after server verification of the gateway event and captured amount.
- If the captured amount differs from the current payable total, booking fails and the payment is reconciled; the order is not partially booked.
- `Accepted` through `Out for Delivery` require payment status `Completed`. A refunded or partially refunded order cannot enter or remain in active production or handover states; terminal post-fulfilment refund history remains auditable.
- Every payment attempt records gateway reference, full amount, status, correlation ID, and timestamps.

### Assisted Point of Sale

- The customer application is the normal and strongly preferred ordering channel. The operational target is at least 99 percent of orders through the application.
- POS is an exception for a customer physically present at a location who cannot use the application, for example because no usable mobile device is available. Staff should direct customers to the application whenever it is usable; POS is not a parallel public ordering channel or a phone-order channel.
- Admin can enable or disable POS independently for the production house and every future branch. Global POS OFF overrides every location switch. A disabled location cannot create new POS carts or orders, but existing records remain visible and auditable.
- An authenticated Owner, Admin, or Branch Manager may create a POS order only at an authorized location with POS ON.
- POS uses the same location catalogue, availability, pricing, offers, taxes, quotas, annual Order ID sequence, production queue, and audit rules as application checkout.
- The POS workspace uses a Zepto-style persistent three-column layout: dynamic category/subcategory navigation on the left, the selected category's products in the center, and the active cart on the right.
- The left rail is generated from active location configuration. It shows top-level categories and expandable subcategories in configured display order, with icon/image, name, and unavailable/disabled state. Cakes and its active subcategories appear at launch; inactive Coffee, Pizza, and Burgers are not rendered.
- Selecting a category or subcategory updates the center product grid without a full page reload. The selected category remains visibly highlighted, and the header shows its name, product count, search, availability filter, and sort control.
- Product cards show image, name, starting/current price, availability, same-day eligibility, and remaining quota state. Selecting a product with no required choices adds one unit immediately. A product with enabled customization or add-ons opens a compact configuration drawer before it is added.
- Search matches product name and product code within the selected category by default, with an `All Active Categories` scope available. Barcode/SKU scanner input may use the same product-code lookup contract.
- The cart remains visible while staff switch categories, search, or configure products. Staff can increment/decrement quantity, edit options, remove a line, clear, hold, resume, or abandon the cart. A held cart belongs to its location and operator unless explicitly transferred by an authorized role.
- POS carts and items are persisted server-side before payment. Refreshing the browser or reconnecting restores the active cart; expired and abandoned carts cannot be converted to orders.
- Catalogue changes are delivered through the server's real-time event channel with polling fallback. Events contain identifiers and versions, not trusted prices. The client refetches affected category, product, availability, quota, customization, or offer data.
- When price, availability, quota, customization, or offer configuration changes, the server requotes affected cart lines. Changed lines are marked `Price Changed`, `Unavailable`, `Quota Exceeded`, or `Configuration Changed`; payment remains disabled until staff reviews and accepts the new quote or removes invalid lines.
- The POS never decrements quota merely because an item is displayed or added to a draft cart. Final quota and availability are locked and consumed only by the atomic booking transaction after payment confirmation.
- Use optimistic concurrency on carts and cart lines. On a stale update, keep the latest server cart, identify the changed line, and require staff to review rather than silently overwriting another session.
- Staff records the exception reason, selects configured products/options, records available customer contact details, confirms `Pickup-at-Store` and required time, and reviews the server-calculated total before payment. Mobile number is optional only when the exception reason is `No mobile device`; the receipt must then be printed.
- POS is cashless. At launch, payment is completed by Card, UPI, or Net Banking; Wallet and Store Credit remain configured but unavailable until a later release. The screen never provides Cash, COD, or a manual `Record Paid` action.
- A POS order is booked only after verified full payment of the current server quote.
- After location/category/product availability, quota, schedule, server price, cart version, and payment checks pass, the server atomically converts the POS cart into an order, snapshots all item/options/prices, marks the cart `Converted`, and sets the order to `Accepted`. It enters the location's shared production queue, never enters `Awaiting Acceptance`, and needs no separate Admin approval. Reusing a converted cart or checkout idempotency key returns the existing result instead of creating a duplicate order.
- POS orders are identified by channel `POS`, location, operator, and exception reason in orders and reports.
- On success, the system generates the normal public Order ID and a printable or shareable receipt containing the order, itemized pricing, payment status, pickup details, cashier, and transaction references.
- Failed or abandoned payments do not consume quota or create a paid receipt. Every completed, voided, or refunded POS sale remains auditable.

### Automatic Option Pricing

Admin controls an Ingredient Pricing Matrix for every applicable cake customization. For each enabled Flavour, Egg/Eggless, Sweetener, and Flour option, Admin enters one price contribution based on 1kg. Every weight is calculated automatically as `1kg contribution x selected weight in kg`; therefore 500g uses a multiplier of `0.5`. Size/Weight availability and base cake prices remain separately configurable. Disabled customization types contribute zero and are omitted from the quote.

```text
Unit Price = Base Price for Selected Weight
           + (Flavour 1kg Contribution x Weight in Kg)
           + (Egg Preference 1kg Contribution x Weight in Kg)
           + (Sweetener 1kg Contribution x Weight in Kg)
           + (Flour Type 1kg Contribution x Weight in Kg)

Weight in Kg = Selected Weight in Grams / 1000

Items Total = Unit Price x Quantity
Order Total = Items Total - Discount + Delivery Fee + Tax
```

The UI previews changes immediately, but the server performs the authoritative calculation before payment and stores the selected-option price snapshot with the order.

The customer sees an itemized breakdown showing the base price and contribution from every selected ingredient. Checkout requests a fresh server quote; stale or client-modified totals are rejected. The saved order retains ingredient IDs, labels, individual contributions, pricing rule version, calculation timestamp, unit price, and total price.

### Default Cake Configuration

Every customizable cake menu item opens with its configured initial selections for enabled options only:

- Weight: 500g
- Sugar Type: Mishri
- Egg Preference: Egg
- Flour Type: Maida
- Quantity: 1
- Flavour: the cake's Admin-selected default flavour

The catalogue Starting Price is calculated from the base product and enabled default options. For enabled sweetener, egg, and flour controls, Mishri, Egg, and Maida are intended to be the lowest-price defaults. Publishing is blocked when an enabled option lacks a valid default or price. Admin can later change switches, defaults, and prices. Reset to Default restores only the currently enabled configuration.

### Pricing And Weight Configuration

Menu Management includes a `Pricing & Weights` tab with Flavour, Egg/Eggless, Flour Type, Sweetener Type, Weight, and Price Preview sub-tabs. Admin can enter availability and price contribution per cake or apply values to all applicable cakes.

- Catalogue cake products support configured sizes from 500g through 3kg where Size or Weight customization is enabled; fixed-size products expose no size selector.
- Custom Cakes support configured weights from 500g through 10kg.
- Requests above 10kg remain possible through `Above 10kg` and a required custom-weight entry.
- Above-10kg requests always use manual feasibility review and a manual quote; they cannot be automatically accepted or charged.
- Customer approval of the manual quote is required before payment and production.
- Weight is per cake; quantity is the number of cakes. Price is calculated per selected weight and then multiplied by quantity.
- Each catalogue and Custom Cake customization row contains one editable `1kg Price Contribution`. The UI shows calculated read-only previews for 500g, 2kg, 3kg, and the selected Custom Cake weight.
- Custom Cake pricing uses the same 1kg basis through 10kg: `1kg contribution x (requested grams / 1000)`.
- Admin can apply a documented manual adjustment for design complexity or special handling.
- A request above 10kg always requires a manual quote. A request at or below 10kg may also require one when Admin records a design-complexity or special-handling reason.

## Admin Dashboard

The dashboard includes:

- Today's orders and revenue
- Cakes orders and Custom Cakes orders
- Orders awaiting acceptance
- Orders in preparation
- Orders ready for delivery
- Deliveries in progress
- Completed and cancelled orders
- Quota utilization
- Payment and refund alerts
- POS sales and POS revenue today
- Wedding & Anniversary Orders summary and At-Risk count
- Recent orders
- Quick actions: New POS Sale, Add Cake, Review Custom Cake, Assign Delivery Partner, and Create Offer

## Wedding & Anniversary Orders Admin Queue

The web Admin Panel provides a dedicated `Wedding & Anniversary Orders` sidebar page. It reads the same Orders records filtered by subcategory code `WEDDING_ANNIVERSARY_CAKES`; it does not create a separate order type, status model, payment flow, production queue, or inventory.

- Owner and Admin see authorized records; Branch Manager sees assigned-location records only.
- Summary cards show Next 3 Days, Next 7 Days, Awaiting Acceptance, Preparing, Ready for Pickup/Delivery, and At Risk.
- Filter by requested fulfilment date, order date, location, product, customer, order/payment/production status, and fulfilment method.
- Default sort is requested fulfilment ascending and order-created time ascending.
- Show order-created time, requested fulfilment time, remaining lead time, configured options, quantity, amount, production, fulfilment, and rider.
- Reuse ordinary Orders actions and permissions for View, Accept/Reject, production updates, rider assignment, and eligible cancellation.
- Create and reschedule commands validate against immutable server `CreatedAt`. Requested fulfilment below 72 hours or above 720 hours is rejected; exactly 72 and 720 hours are accepted.
- Customer, POS, and Admin date/time controls show the first and last valid timestamps in the production-house timezone and disable all invalid values.
- At Risk is an operational warning based on remaining preparation time; it does not alter the fixed order window or lifecycle.

## Cancellation And Refunds

### Cancellation

- Customer cancellation is based only on elapsed server time from successful booking payment, not on the `Preparing` production status.
- Default policy: from 0 through 30 minutes, cancellation is allowed with a 100 percent refund of the captured amount.
- Default policy: after 30 minutes through 60 minutes, cancellation is allowed with a 50 percent refund of the captured amount.
- After 60 minutes, customer cancellation is unavailable and the application offers `Raise Support Ticket`.
- Admin can configure the full-refund window, final partial-refund deadline, and partial-refund percentage globally or for a location/category. Owner has full override authority. Branch Manager sees the effective policy read-only.
- The policy active at booking is snapshotted on the order. Later policy changes affect new orders only.
- `Preparing` remains an internal production status and does not shorten or extend the cancellation deadline.
- Refund is calculated against the full amount captured. Delivery fee is refunded when delivery has not started.
- `Out for Delivery` or `Delivered`: cancellation is unavailable even if a misconfigured time window would otherwise remain; use the returns workflow where eligible.
- Authorized Admin cancellation for GUNUCO fulfilment failure remains separate and may use `Admin Exception` with a required reason and approved refund.
- Every cancellation records reason, actor, timestamp, deductions, notifications, and audit details.

## Customer Support

### Guided Support

- Guided Support is a normal application menu backed by predefined SQL rules and response text. It does not use an LLM, AI service, generated replies, or autonomous agent.
- Rules cover cancellation eligibility, payment status, pickup and delivery status, delivery serviceability, refunds, returns, custom-cake timelines, and common order questions.
- For a signed-in customer raising a ticket from an order, Order ID, name, and phone are populated from the verified account/order and are not re-entered. Outside that flow, verify Order ID and phone before exposing details.
- For cancellation, Guided Support checks server deadlines and fulfilment state and shows the applicable result.
- Guided Support cannot update an order, mark a payment, approve a refund, or override any business rule.
- When predefined guidance does not resolve the issue, show `Raise Support Ticket`.

### Ticket Creation

- The customer enters only Message. Up to three optional photos may be attached. Order ID, name, and phone come from the verified order context.
- Accept only JPEG, PNG, or WebP images, at most 5 MB each. Validate actual content type, scan uploads, remove metadata where practical, store privately, and authorize every download.
- Every ticket receives an atomic unique public ID in `YYMM-NN` format with a minimum two-digit monthly sequence, for example `2608-01` and `2608-125`. The sequence restarts each calendar month.
- Generate the email subject as `Ticket {Ticket ID} | Order {Order ID}` so both identifiers are prominent in the mailbox and dashboard.
- Ticket channels are `Guided Support` and `Application Support Form`.
- Creating a ticket stores the predefined rule context, order status snapshot, customer message, timestamps, and correlation ID.
- The system sends the ticket email from the application service to `support@gunuco.com`; the customer does not need to open an external email client.
- Duplicate submissions with the same idempotency key return the existing ticket.

### Support Portal

- Customer Support uses `https://support.gunuco.com/login`. Owner, Admin, and Branch Manager use the shared web Admin Panel at `https://admin.gunuco.com/login`; post-login authorization determines navigation and location scope.
- The main web Admin Panel includes `Support Tickets`. Owner and Admin see every ticket in their authorized scope and all ticket-operational controls. Branch Manager sees tickets linked to assigned-location orders and may view, reply, add internal notes, and move tickets between Open and Pending.
- Admin creates one individual account per support freelancer, sets access expiry, activates/suspends access, controls the maximum active support users and concurrent sessions, and can revoke sessions immediately. Shared credentials are prohibited.
- Support Agent accounts use separate support authentication and cannot sign in to owner or admin portals.
- The support dashboard shows total tickets and counts for New, Open, Pending, and Closed.
- Ticket columns are Ticket ID, Order ID, Name, Phone Number, Message Preview, Channel, Priority, Status, Assigned Agent, Created At, Last Updated At, and Actions.
- Ticket statuses are `New`, `Open`, `Pending`, and `Closed`.
- Admin ticket actions are View, Assign/Reassign/Unassign, Set Priority, Reply, Add Internal Note, Set Open, Set Pending, Escalate/Take Escalation, Close, and Reopen. Closing requires a resolution note; reopening requires a reason.
- New tickets are assigned transactionally to the available active agent with the fewest non-closed tickets; ties use the least recently assigned agent. Thus two or three working agents receive an equal split over time. Expired, suspended, unavailable, or logged-out agents are skipped. Admin can reassign a ticket.
- Email is a synchronized notification and reply channel. The database ticket remains the source of truth; inbound email replies are appended to the ticket before appearing in the dashboard.
- Every assignment, status change, internal note, customer reply, email, escalation, and resolution is retained in ticket history.
- Ticket controls do not directly alter orders, payments, cancellations, refunds, production, or delivery. Admin uses the authorized domain screen for those changes and the ticket history stores the resulting reference.

### Refund

1. Refund is initiated from a cancellation, approved return, or authorized manual action.
2. The system validates that the refund does not exceed the captured payment.
3. Refund is routed to the original method where possible.
4. Status moves through `Pending`, `Processing`, and `Completed` or `Failed`.
5. Failed gateway refunds may retry up to three times before `Manual Review`.
6. Customer notifications and reconciliation records are maintained.

## Returns

1. Customer requests a return within the configured return window.
2. Customer selects a reason, describes the issue, and uploads evidence.
3. Admin assesses severity and eligibility.
4. Admin proposes refund, replacement, store credit, or rejection.
5. Approved replacements create a priority production-house order.
6. Returned food products never become available for sale again.
7. Record each returned order item and quantity as `Pending Disposal`, then record disposal method, responsible Admin, and disposal time. Returned items never increase sellable inventory.
7. The system records product and delivery quality metrics.

## Reports And Reconciliation

Daily reports include:

- Orders by parent category, each Cakes subcategory, and Custom Cakes
- Accepted, delivered, cancelled, returned, and in-progress counts
- Gross revenue, discounts, delivery fees, refunds, and net revenue
- Payment-method reconciliation
- Quota utilization
- Product, flavour, egg/eggless, sugar type, flour type, and quantity trends
- Delivery-partner performance

## Customer Feedback And Testimonials

- The customer application does not provide product star ratings, numeric scores, per-product review forms, public comments, or rating averages.
- Feedback is order-level and message-only. A completed order can produce at most one feedback request and one customer feedback message.
- After an authenticated customer-app doorstep order becomes `Delivered` or pickup order becomes `Collected`, the server creates an eligible feedback request. Launch defaults are an initial in-app/push prompt after 24 hours, no reminder unless configured, and request expiry after 168 hours. Anonymous assisted-POS orders without a customer account are not eligible.
- The push payload contains a versioned `feedback_request` event and feedback-request ID. It deep-links to a simple message editor; it never links to a star selector or arbitrary URL.
- The feedback screen shows the order reference and one required multiline `Your feedback` field. Feedback is text-only: do not show image upload, stars, emojis as scores, product-by-product questions, title, pros/cons, or public reply fields.
- Customers may dismiss the prompt. Limit prompting to one initial notification and at most one configured reminder for an unsubmitted, unexpired request.
- Submission requires an authenticated customer who owns the completed order. The server stores the message against the order, prevents duplicate submissions, and never changes product ranking or catalogue sort from feedback.
- Include a separate unchecked consent control: `You may use this feedback as a public testimonial.` Feedback can be retained for internal service improvement without public consent, subject to privacy and retention policy.
- New feedback enters `Pending` moderation. Admin may approve, reject, or withdraw it; customer-facing publication is never automatic.
- To create a testimonial, Admin selects approved feedback with testimonial consent, chooses a safe display name, edits a faithful quote snapshot without changing its meaning, supplies an approved/licensed image and alt text, chooses App and/or Static Website, display order, and optional publication dates.
- Never publish the customer's phone number, email, address, Order ID, private image, or unmoderated message. Withdrawal or consent revocation unpublishes the testimonial from every channel.
- The customer app and static website consume the same published-testimonials API. Both render an image-backed carousel/slider ordered by configured display order and publication window.
- Carousel controls include previous/next, pagination indicators, swipe on touch devices, keyboard support, pause while hovered/focused, reduced-motion support, image alt text, and readable message text. Auto-rotation must not prevent manual control.
- Product pages do not display star summaries, rating counts, review tabs, or per-product testimonials. Testimonials are a curated brand-level section.
- Delivery-partner performance ratings are an internal operational concept and remain separate from customer product feedback.

## Notifications

### Admin

- New standard or custom-cake request
- Quota threshold reached or quota full
- Custom-cake delivery date approaching
- Order ready for delivery
- Delivery assignment rejected or delayed
- Cancellation, return, refund failure, or payment issue
- New, urgent, escalated, or reopened support ticket

### Delivery Partner

- New delivery assignment
- Order ready for production-house pickup
- Customer or delivery detail update
- Delivery completion and earnings confirmation

### Customer

- Order accepted or rejected
- Custom-cake clarification or price confirmation
- Preparing, packed, assigned, picked up, out for delivery, and delivered updates
- Cancellation, refund, replacement, or return updates
- Message-only feedback request after an eligible completed order

## Production Readiness Requirements

These requirements harden the existing process and do not change any approved role, category, add-on, price, fee, quota, status, fulfilment method, or customer-visible business rule.

### Transaction And State Integrity

- All status changes use server-side transition commands. Each command validates the current order, delivery, and pickup states; actor role; location authorization; fulfilment method; completed payment; and rider assignment before writing the new state.
- Booking is atomic: annual Order ID allocation, fresh server quote, product/add-on availability, quota consumption, slot reservation, payment confirmation, order creation, snapshots, audit entry, and outbox events either commit together or roll back together.
- Quota and slot checks use transactional locking or another concurrency-safe reservation mechanism so simultaneous checkouts cannot oversell capacity.
- Order ID validation plus `Collected` or `Delivered` remains one transaction and is idempotent. Repeating a completed request returns the existing result without completing it twice.
- Every order, delivery, and pickup transition is appended to status history with previous/new values, actor, reason, correlation ID, and timestamp.
- Editable operational records use optimistic concurrency. A stale update is rejected with a conflict response instead of overwriting a newer change.

### Payment Integrity

- Every checkout and payment attempt carries a server-enforced idempotency key. Reusing a key returns the original result and cannot create another order or charge.
- Payment success is accepted only from a signature-verified gateway event or authoritative gateway verification, never from a client success screen.
- Gateway event IDs are unique and duplicate callbacks are recorded and ignored safely.
- Refund processing is idempotent and reconciled against captured gateway amounts.
- `Payments` stores each full-payment attempt. `PaymentGatewayEvents` stores every signed or rejected provider callback, and `PaymentTransactionHistory` stores every payment status transition, including failures and cancellations.
- `Cancellations` stores the Customer, Admin, or System actor, policy snapshot, elapsed minutes, eligibility tier, percentage, deduction, refund amount, notification choices, and correlation ID.
- `Refunds` stores each idempotent refund request, source cancellation/return/payment, amount, method, retries, gateway transaction, failure, actor, and final state. `RefundTransactionHistory` stores every refund status transition and retry.
- Insert the payment/refund/cancellation business change, corresponding history row, order summary update, audit row where an Admin acted, and outbox event in one SQL transaction. A status update without its history row must roll back.
- `AuditLogs` records Admin financial actions with before/after JSON, IP address, user agent, location, and the same correlation ID. Automated and gateway transitions remain attributable through their dedicated histories and gateway event records.
- The client supplies one UUID idempotency key per checkout, payment, refund, or ticket command and reuses it only when retrying that same command. A reused key returns the original result.
- Set `CancellationWindowStartedAt` from the verified full-payment event in the same transaction that snapshots the cancellation policy.
- Set `CompletedAt` when a pickup order becomes `Collected`, a doorstep order becomes `Delivered`, or an order becomes `Cancelled`/`Resolved`; update status history in the same transaction.
- Allocate annual Order IDs and monthly Ticket IDs with `UPDLOCK, HOLDLOCK` on the applicable sequence row inside the creation transaction.
- Validate active delivery-fee bands for overlap before publishing a new or edited rule; reject ambiguous boundaries.
- Ticket assignment locks eligible support users while selecting the fewest non-closed tickets and least-recent assignment tie-breaker, then updates assignment and history in one transaction.
- Outbound and inbound support email attempts are stored with provider message IDs. Duplicate provider messages are ignored; accepted inbound replies append one ticket message.
- Currency is INR and all calculations use fixed decimal arithmetic with documented two-decimal rounding. Floating-point arithmetic is prohibited for money.

### Authorization And Security

- Authorization checks role, active account, assigned location, explicit POS permission, effective feature state, and resource ownership on every server request; hiding a UI action is not authorization.
- Owner requires multi-factor authentication. Sessions support expiration, revocation, secure password reset, and rate limiting.
- Login, password reset, Order ID validation, quote, serviceability, payment, and upload endpoints are rate-limited.
- Reference images and evidence uploads use allowed file types and size limits, malware scanning, private storage, and short-lived signed access URLs.
- Sensitive customer data is encrypted where appropriate, excluded from application logs, and governed by retention and deletion rules.

### Reliable Processing And Operations

- Notifications, rider assignment, payment follow-up, refund retries, and integration events use a transactional outbox and retryable background workers. A failed external call must not roll back an already committed order state.
- Every request carries a correlation ID across application logs, audit records, payment events, and background jobs.
- Alert on payment captured without an order, quota/slot conflicts, stuck orders, exhausted rider assignment, repeated Order ID failures, failed refunds, route-provider failures, outbox backlog, and notification failures.
- Production uses versioned database migrations and separate seed data. Changes are deployed through tested forward migrations; the schema file remains the consolidated reference.
- Encrypted backups, point-in-time recovery, retention, restore drills, and documented recovery objectives are mandatory before launch.

### Production Verification

- Automated tests cover every role, location boundary, state transition, full-payment path, fulfilment method, category module, add-on rule, cancellation, refund, and return path.
- Concurrency tests cover final quota/slot capacity, annual Order ID allocation, duplicate payment callbacks, simultaneous admin updates, and rider reassignment.
- Launch requires security, accessibility, load, payment-reconciliation, route-provider failure, backup-restore, and disaster-recovery testing.

## Current-Scope Rules

- The brand name is GUNUCO.
- Cakes is the active launch parent category. Coffee, Pizza, and Burgers are seeded but inactive. Cakes launches with the seven configured subcategories listed in System Scope.
- All launch orders are accepted and fulfilled by the production-house location; future orders are fulfilled by their assigned branch/location.
- Branch creation and transfer workflows are feature-disabled at launch, but location IDs and authorization boundaries are mandatory in the implementation.
- Cake orders capture quantity plus only the customization fields enabled by the effective product configuration.
- Admin remains the central operational authority.
- POS remains cashless and is available to authorized staff only at assigned locations where both Global POS and Location POS are ON.
- Owner alone controls branch creation, Owner/Admin access, global POS, admin-location access, and owner-only global rules. Admin manages category, subcategory, product, and add-on definitions subject to Owner's full override and final authority. Branch Manager has no definition-level access.