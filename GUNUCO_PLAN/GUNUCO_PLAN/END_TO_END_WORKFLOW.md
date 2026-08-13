# GUNUCO System - End-to-End Workflow

## System Scope

GUNUCO launches with one production-house location and one active parent category: `Cakes`. Its launch subcategories are `GUNUCO PREMIUM`, `Cakes & Wedding Cakes`, and `Cookies`. `Pickup-at-Store` means collection from the order's assigned location; at launch this is the production house.

The implementation must be multi-location and multi-category ready from the first release. Main Admin can add, edit, activate, deactivate, and order parent categories and subcategories from the Admin Panel. Future parent categories can include `Coffee`, `Pizza`, and `Burgers`; they must not require code or navigation changes. Category and subcategory names must be database configuration, not hard-coded application enums. Category-specific options belong to configurable product schemas or category modules; cake-only fields must not be required for non-cake products.

Branches are disabled at launch. The production house is the initial location and uses the same location contract that future branches use. Every product availability record, staff assignment, order, POS sale, pickup, delivery origin, quota, and report must carry a location identifier. This prevents future branches from requiring a migration from location-less records.

## Main Panels

1. Main Admin Panel (web/desktop)
2. Delivery Partner Panel (mobile)
3. Customer Support Panel (web/desktop, separate support subdomain)

The Main Admin manages the production house, catalogue, orders, production, delivery, payments, cancellations, refunds, returns, users, and reports.

## Roles And Access

### Owner Admin

- Full access to all system features.
- Creates and manages Main Admins, Branch Admins, and delivery partners.
- Creates branches and controls global order acceptance, category activation, catalogue availability, quotas, POS, and settings.
- Has all Main Admin capabilities and final authority over every category, subcategory, product, and add-on.
- Owner Admin access cannot be created, modified, or removed by any lower role.

### Main Admin

- Manages authorized operations across all authorized locations, including categories, subcategories, catalogue, add-ons, custom-cake options, orders, production, delivery, offers, refunds, returns, Branch Admins, delivery partners, and reports.
- Can add, edit, activate, deactivate, and reorder categories, subcategories, products, and add-ons from the Admin Panel.
- Can validate pickup Order IDs and complete store handover at any authorized location.
- Cannot manage Owner Admin access, create another Owner Admin or Main Admin, create branches, or change owner-only global controls.

### Branch Admin

- Assigned to one or more locations by Main Admin.
- Manages orders, production, pickup, local delivery operations, and assisted POS only for assigned locations.
- Can validate pickup Order IDs and complete store handover only for orders assigned to an authorized location.
- Can create an assisted POS order only when POS is enabled for that location and the customer cannot reasonably use the application.
- Cannot manage Owner Admin or Main Admin access, enable POS, create branches, activate categories, or change global business rules.
- Sees only assigned-location operations.

### Delivery Partner

- Sees only assigned deliveries.
- Accepts assignments and updates pickup and delivery statuses.
- Cannot access admin, catalogue, pricing, or production controls.

### Customer Support Agent

- Uses the separate Customer Support Panel and sees only support tickets and the minimum read-only order information needed to answer them.
- Can review, assign, reply to, escalate, and resolve tickets according to predefined support rules.
- Cannot change orders, payments, prices, production, delivery, refunds, categories, users, or administrative settings.
- Cannot bypass cancellation eligibility. Requests outside the configured cancellation window can only be explained or escalated to Main Admin for review; escalation does not guarantee cancellation or refund.

## Setup And Configuration

### Locations And Branches

Owner Admin configures the production house and future branches with name, code, address, contact details, operating hours, service area, order acceptance status, active categories, admin access, and POS ON/OFF. Branch creation is unavailable to customers, Main Admins, and Branch Admins. Disabling a branch or its POS prevents new activity but preserves all historical orders and audit records.

The order location is selected server-side from the customer's service/pickup choice or the authenticated Branch Admin's assigned location. It cannot be trusted from an unrestricted client value.

### Cake Catalogue

Each standard cake contains:

- Cake name and description
- Category: Cakes
- Flavour
- Egg preference: Egg or Eggless
- Sugar type
- Flour type: Maida or Wheat Flour
- Size/weight
- Price and optional discount price
- Preparation time
- Product image
- Daily quantity quota
- Same-day delivery availability
- Available/Unavailable toggle

Every product references its most specific configured category. For a subcategory product, the parent category is derived from the category hierarchy. Under the `Cakes` parent, Main Admin initially manages `GUNUCO PREMIUM`, `Cakes & Wedding Cakes`, and `Cookies`, and can add or modify further subcategories. Premium products display a GUNUCO PREMIUM badge. Category changes preserve historical order snapshots.

### Categories And Subcategories

- Owner Admin has full control and final authority; Main Admin performs day-to-day category management from the Admin Panel.
- Main Admin can add, edit, activate, deactivate, and reorder parent categories and subcategories.
- Branch Admin cannot create or modify category definitions, but sees active categories assigned to authorized locations.
- A subcategory has exactly one parent category. Parent categories cannot be deleted while products or subcategories depend on them; deactivate them instead to preserve history.
- Activating a category globally does not automatically expose it at every location. Location availability must also be enabled.
- Future parent categories such as Coffee, Pizza, and Burgers use configurable product option schemas and must not inherit required cake fields.

### Add-Ons

Main Admin manages an `Add-Ons` section in the Admin Panel. Each add-on includes name, description, price, required/optional status, minimum and maximum quantity, availability, display order, and applicable category, subcategory, or product assignments. Owner Admin has full authority over add-ons; Branch Admin can only sell add-ons made available at an authorized location.

Required add-ons are included automatically or must be explicitly confirmed according to configuration. Optional add-ons are customer-selectable. The server validates applicability, quantity, availability, and price, includes add-ons in the quote, and stores add-on name, description, unit price, quantity, and total as immutable order-time snapshots.

### Custom Cake Configuration

Main Admin manages the choices available on custom-cake requests:

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
2. Customer chooses flavour, egg preference, sugar type, flour type, size, and quantity from available options.
3. Customer chooses same-day or a future available slot and selects `Pickup-at-Store` or `Doorstep-Delivery`.
4. For doorstep orders, customer enters a serviceable address; for pickup, the system shows production-house collection details.
5. The system recalculates the payable total. Customer chooses `Full Payment` or `50% Advance + 50% Balance` and pays online.
6. The system checks global order acceptance, product availability, requested quantity, and daily quotas.
7. The order is booked after either full payment or successful capture of the required 50% advance and is sent to the production-house queue.
8. Main Admin accepts the order automatically or manually, according to settings.
9. Production status moves through `Accepted`, `Preparing`, and `Packed`, then to the applicable ready state.
10. A pickup order moves to `Ready for Pickup`; a doorstep order moves to `Ready for Delivery` and enters rider assignment.
11. Before a doorstep order is accepted, delivery status is `Not Started`; after acceptance it moves to `Pending Assignment`. Pickup orders always use delivery status `Not Required`.

### Custom Cake Order

1. Customer opens Custom Cakes.
2. Customer selects flavour, Egg or Eggless, sugar type, flour type, size/weight, and quantity.
3. Customer selects an occasion or theme, uploads a reference image, and enters a cake message or special instructions.
4. Customer chooses `Pickup-at-Store` or `Doorstep-Delivery` and a fulfilment date and time from 3 through 30 days after the request time.
5. The system validates the inclusive 72-to-720-hour scheduling window and daily custom-cake quota.
6. Main Admin reviews feasibility, final price, instructions, and delivery schedule.
7. Main Admin approves the quote, requests clarification, or rejects the unpaid request. Quote approval does not change the order to `Accepted` or enter production.
8. Once Main Admin confirms feasibility and price, the customer approves the quote, reviews the final fulfilment fee, selects a payment plan, and pays.
9. Only after customer quote approval and successful full payment or 50% advance does the server change the order to `Accepted` and enter production.
10. A pickup order enters the store pickup queue; only a doorstep order enters rider assignment.

## Order Statuses

```text
Not Accepted -> Accepted -> Preparing -> Packed -> Ready for Delivery
    -> Delivery Partner Assigning -> Assigned -> Picked Up
    -> Out for Delivery -> Delivered

Before delivery: Cancelled
After delivery: Return Requested -> Return Approved/Rejected -> Resolved
```

## Delivery Flow

1. Before payment, customer chooses `Pickup-at-Store` or `Doorstep-Delivery`.
2. Pickup orders receive pickup instructions and never enter rider assignment.
3. For `Doorstep-Delivery`, the server validates the address, calculates road distance, and applies the configured fee.
4. The checkout immediately recalculates and displays `Subtotal - Discount + Delivery Fee = Payable Total` whenever the option or delivery address changes.
5. Customer reviews the selected option, fee, and final payable total before payment. Catalogue orders are booked after successful full payment or 50% advance; Custom Cake requests may be saved before payment for clarification, feasibility review, and quoting, but cannot enter production until accepted and the required booking payment is captured.
6. When a doorstep order is accepted, the configured Automatic or Manual delivery-assignment mode is applied.
7. In Automatic mode, the system offers the order to an eligible delivery partner; in Manual mode, Main Admin selects one.
8. At the doorstep, the rider enters the customer's Order ID. Only an exact server-validated match enables `Delivered`.

All pickup locations are the production house. There is no branch assignment or branch pickup.

### Fulfilment Methods And Fees

- `Pickup-at-Store` is always free and requires no rider or delivery address.
- Customer-facing Order IDs use `YY-N` with a minimum two-digit sequence, for example `26-01` and `26-888`; numbering restarts from `01` each calendar year.
- Pickup status moves through `Pickup Scheduled`, `Ready for Pickup`, and `Collected`. Admin must enter the customer's Order ID and receive an exact server match before marking `Collected`.
- Initialize every newly booked pickup order with `Pickup Scheduled`; doorstep orders use `Not Applicable`. These values are set explicitly in the order-creation transaction.
- No OTP or separate pickup code is used. The same Order ID validation rule applies at the store and at the doorstep.
- Every validation attempt records the order, fulfilment option, validator, timestamp, submitted Order ID, and success or failure result.
- Generate the annual sequence atomically inside the order-creation transaction so concurrent checkouts cannot receive the same Order ID.
- Only an authenticated Owner Admin, Main Admin, or Branch Admin authorized for the order's location can validate at the store, and only the rider assigned to that order can validate at the doorstep.
- Fulfilment validation uses the exact customer-facing Order ID only. No OTP, separate pickup code, phone number, or client-submitted success flag can substitute for the server comparison.
- Save the successful validation and change the order to `Collected` or `Delivered` in one server transaction. Never trust a client-submitted success flag.
- For both fulfilment methods, the customer provides the same Order ID received at booking. `Collected` or `Delivered` remains disabled until the submitted value exactly matches that order's server-stored Order ID.
- Rate-limit repeated failed attempts and alert Main Admin when unusual validation failures occur.
- Cakes and GUNUCO PREMIUM `Doorstep-Delivery` uses road distance from the production house:
    - Up to and including 5 km: free.
    - Over 5 km through 8 km: Rs 39.
    - Over 8 km through 10 km: Rs 59.
    - Over 10 km through 15 km: Rs 159.
    - Beyond 15 km: unavailable by default; offer `Pickup-at-Store`.
- Custom Cakes can use `Pickup-at-Store` or `Doorstep-Delivery` with no delivery fee. Doorstep serviceability and scheduling validation still apply.
- Main Admin can dynamically add, edit, activate, deactivate, and schedule distance bands; change each minimum distance, maximum distance, and fee; control the maximum service range; manage pickup details; and retain the Custom Cake fee exemption.
- Distance bands must not overlap or leave ambiguous boundaries. The server uses the unrounded road distance and the active rule effective at quote time.
- The server calculates distance and fee, and saves the applied rule as an order snapshot.
- `Pickup-at-Store` always means collection at the configured production house; it does not introduce a separate store or branch entity.

### Automatic Delivery Assignment

- Main Admin controls Automatic/Manual assignment from the dashboard.
- Automatic assignment considers only Active, Online riders with Accept Deliveries ON, no schedule conflict, and matching service area.
- Lowest active workload is preferred; distance and rating break ties.
- The rider must accept within the configured timeout.
- Rejection or timeout offers the order to the next eligible rider.
- If nobody accepts, delivery remains `Pending Assignment` and Main Admin is alerted.
- Main Admin can assign or reassign before pickup, with every attempt retained in history.
- Admin sees `Deliveries Pending`, `Delivering`, and `Delivered Today`, plus the assigned rider for each order.

## Order Controls And Quotas

Controls are evaluated in this order:

1. Global Accept Orders ON/OFF
2. Category acceptance mode: Automatic or Manual
3. Category availability at the selected location; only Cakes is active at launch
4. Product availability
5. Custom Cakes scheduling window: minimum 3 days (72 hours), maximum 30 days (720 hours)
6. Daily global order limit
7. Daily category order limit
8. Daily product or custom-cake limit

If any applicable control blocks the request, the order is not accepted. Daily quota usage resets at midnight in the production house's configured timezone.

### Acceptance Modes

- `Automatic`: after all validation and limit checks pass, the order immediately becomes `Accepted` and enters the production queue.
- `Manual`: the order is created as `Not Accepted` and appears in Main Admin's Awaiting Acceptance queue.
- Main Admin can Accept or Reject an order awaiting manual review.
- Acceptance mode is configurable for each active parent category or subcategory, including Cakes, GUNUCO PREMIUM, Cakes & Wedding Cakes, Cookies, and Custom Cakes where applicable.
- Global Accept Orders OFF overrides both modes.
- A mode change applies only to new orders.

### Admin Order Controls Board

The Main Admin dashboard provides:

- Global Accept Orders ON/OFF
- Cakes Automatic/Manual acceptance selector
- GUNUCO PREMIUM Automatic/Manual acceptance selector
- Custom Cakes Automatic/Manual acceptance selector
- Global orders-per-day limit
- Cakes orders-per-day limit
- GUNUCO PREMIUM orders-per-day limit
- Custom Cakes orders-per-day limit
- Product-specific daily quantity limits
- Current usage, remaining capacity, and utilization percentage
- 80 percent utilization alerts
- Custom Cake scheduling window from 3 days/72 hours through 30 days/720 hours

An order is blocked if accepting its requested quantity would exceed any applicable limit. Counts reset at midnight in the production house timezone.

### Same-Day Delivery

- Same-day delivery is available only for Cakes and GUNUCO PREMIUM.
- Main Admin independently enables or disables same-day delivery for each eligible Cakes subcategory.
- Main Admin controls cutoff time, minimum preparation lead time, delivery slots, slot capacity, service area, and per-cake eligibility.
- Same-day is shown only when timing, production capacity, quota, product availability, delivery capacity, and address checks all pass.
- Custom Cakes never use same-day delivery and remain limited to 3 through 30 days.
- Same-day customers may choose `Full Payment` or `50% Advance + 50% Balance`.
- A same-day slot is booked only after the full amount or required 50% advance is captured online.
- For split payment, the remaining 50% must be captured online before rider dispatch or store handover. There is no cash collection at the doorstep or store.

### Cashless Payment Plans

- GUNUCO does not accept cash, Cash on Delivery, or cash at `Pickup-at-Store`.
- Customer chooses one plan before booking: `Full Payment` or `50% Advance + 50% Balance`.
- `Full Payment`: capture the complete payable total online when booking.
- `50% Advance + 50% Balance`: capture exactly 50% online to book; show the remaining balance and payment deadline continuously.
- For a total that cannot be split evenly at currency precision, the advance is rounded to two decimals and the balance is `Total Amount - Advance Paid`.
- The remaining balance must be paid online before `Ready for Pickup` handover or before a rider can mark `Picked Up`/begin dispatch.
- Disable `Collected`, `Picked Up`, `Out for Delivery`, and `Delivered` while balance due is greater than zero.
- Order ID validation does not replace payment validation; both successful Order ID validation and zero balance are required for final handover.
- Failed or incomplete balance payment keeps the order on payment hold and alerts the customer and Main Admin.
- A background worker sends reminders before `BalancePaymentDueAt`. At the deadline, the order remains on payment hold for Main Admin review; it is not silently handed over or dispatched. Any cancellation and refund follows the snapshotted cancellation policy or an authorized Admin exception.
- Every payment transaction records whether it is `Full`, `Advance`, or `Balance`, along with gateway reference, amount, status, and time.

### Assisted Point of Sale

- The customer application is the normal and strongly preferred ordering channel. The operational target is at least 99 percent of orders through the application.
- POS is an exception for a customer physically present at a location who cannot use the application, for example because no usable mobile device is available. Staff should direct customers to the application whenever it is usable; POS is not a parallel public ordering channel or a phone-order channel.
- Main Admin can enable or disable POS independently for the production house and every future branch. Global POS OFF overrides every location switch. A disabled location cannot create new POS carts or orders, but existing records remain visible and auditable.
- An authenticated Owner Admin, Main Admin, or Branch Admin may create a POS order only at an authorized location with POS ON.
- POS uses the same location catalogue, availability, pricing, offers, taxes, quotas, annual Order ID sequence, production queue, and audit rules as application checkout.
- Staff records the exception reason, selects configured products/options, records available customer contact details, confirms `Pickup-at-Store`, required time, and payment plan, and reviews the server-calculated total before payment. Mobile number is optional only when the exception reason is `No mobile device`; the receipt must then be printed.
- POS is cashless. Payment is completed by Card, UPI, Net Banking, Wallet, or Store Credit; the screen never provides Cash, COD, or a manual `Record Paid` action.
- A POS order is booked only after successful full payment or capture of the required 50% advance. Any balance remains subject to the normal payment hold before handover.
- After location/category/product availability, quota, schedule, server price, and payment checks pass, a POS order is automatically marked `Accepted` and enters the location's shared production queue. It never enters `Awaiting Acceptance` and needs no separate Main Admin approval. Global/location order shutdown and all other operational controls still block invalid POS orders.
- POS orders are identified by channel `POS`, location, operator, and exception reason in orders and reports.
- On success, the system generates the normal public Order ID and a printable or shareable receipt containing the order, itemized pricing, payment status, pickup details, cashier, and transaction references.
- Failed or abandoned payments do not consume quota or create a paid receipt. Every completed, voided, or refunded POS sale remains auditable.

### Automatic Option Pricing

Main Admin controls an Ingredient Pricing Matrix for every cake. For Cakes and GUNUCO PREMIUM, every flavour, Egg/Eggless choice, sugar type, and flour type has a separate price at 500g, 1kg, 2kg, and 3kg. The selected weight chooses the applicable price row. The system recalculates whenever the customer changes an ingredient, weight, or quantity:

```text
Unit Price = Base Price for Selected Weight
           + Flavour Price for Selected Weight
           + Egg Preference Price for Selected Weight
           + Sugar Type Price for Selected Weight
           + Flour Type Price for Selected Weight

Items Total = Unit Price x Quantity
Order Total = Items Total - Discount + Delivery Fee + Tax
```

The UI previews changes immediately, but the server performs the authoritative calculation before payment and stores the selected-option price snapshot with the order.

The customer sees an itemized breakdown showing the base price and contribution from every selected ingredient. Checkout requests a fresh server quote; stale or client-modified totals are rejected. The saved order retains ingredient IDs, labels, individual contributions, pricing rule version, calculation timestamp, unit price, and total price.

### Default Cake Configuration

Every Cakes and GUNUCO PREMIUM menu item opens with these initial selections:

- Weight: 500g
- Sugar Type: Mishri
- Egg Preference: Egg
- Flour Type: Maida
- Quantity: 1
- Flavour: the cake's Main Admin-selected default flavour

The catalogue Starting Price is calculated from this exact combination. Mishri, Egg, and Maida are intended to be the lowest-price options; publishing is blocked when an available alternative in the same ingredient group is cheaper. Main Admin can later change defaults and prices. Customers can change any available selection, and each change produces a fresh dynamic quote. Reset to Default restores the configured combination.

### Pricing And Weight Configuration

Main Admin has one dedicated section with tabs for Flavour, Egg/Eggless, Flour Type, Sugar Type, Weight, and Price Preview. Admin can enter availability and price contribution per cake or apply values to all applicable cakes.

- Cakes and GUNUCO PREMIUM support 500g, 1kg, 2kg, and 3kg, with 3kg as the maximum.
- Custom Cakes support configured weights from 500g through 10kg.
- Requests above 10kg remain possible through `Above 10kg` and a required custom-weight entry.
- Above-10kg requests always use manual feasibility review and a manual quote; they cannot be automatically accepted or charged.
- Customer approval of the manual quote is required before payment and production.
- Weight is per cake; quantity is the number of cakes. Price is calculated per selected weight and then multiplied by quantity.
- Each catalogue pricing row contains separate 500g, 1kg, 2kg, and 3kg values.
- Custom Cake pricing is entered on a 1kg basis. For weights through 10kg, each ingredient contribution defaults to `1kg contribution x requested weight in kg`.
- Main Admin can apply a documented manual adjustment for design complexity or special handling.
- A request above 10kg always requires a manual quote. A request at or below 10kg may also require one when Main Admin records a design-complexity or special-handling reason.

## Main Admin Dashboard

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
- Recent orders
- Quick actions: New POS Sale, Add Cake, Review Custom Cake, Assign Delivery Partner, and Create Offer

## Cancellation And Refunds

### Cancellation

- Customer cancellation is based only on elapsed server time from successful booking payment, not on the `Preparing` production status.
- Default policy: from 0 through 30 minutes, cancellation is allowed with a 100 percent refund of the captured amount.
- Default policy: after 30 minutes through 60 minutes, cancellation is allowed with a 50 percent refund of the captured amount.
- After 60 minutes, customer cancellation is unavailable and the application offers `Raise Support Ticket`.
- Main Admin can configure the full-refund window, final partial-refund deadline, and partial-refund percentage globally or for a location/category. Owner Admin has full override authority. Branch Admin sees the effective policy read-only.
- The policy active at booking is snapshotted on the order. Later policy changes affect new orders only.
- `Preparing` remains an internal production status and does not shorten or extend the cancellation deadline.
- Refund is calculated against the amount actually captured. Any uncaptured balance is removed; it is not included in the refund base. Delivery fee is refunded when delivery has not started.
- `Out for Delivery` or `Delivered`: cancellation is unavailable even if a misconfigured time window would otherwise remain; use the returns workflow where eligible.
- Authorized Admin cancellation for GUNUCO fulfilment failure remains separate and may use `Admin Exception` with a required reason and approved refund.
- Every cancellation records reason, actor, timestamp, deductions, notifications, and audit details.

## Customer Support

### Guided Support

- Guided Support is a normal application menu backed by predefined SQL rules and response text. It does not use an LLM, AI service, generated replies, or autonomous agent.
- Rules cover cancellation eligibility, payment status, balance payment, pickup and delivery status, delivery serviceability, refunds, returns, custom-cake timelines, and common order questions.
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

- Customer Support uses `https://support.gunuco.com/login`. Administrative entry points are `https://admin.gunuco.com/login` for Main/Branch Admin and `https://owner.gunuco.com/login` for Owner Admin.
- Main Admin creates one individual account per support freelancer, sets access expiry, activates/suspends access, controls the maximum active support users and concurrent sessions, and can revoke sessions immediately. Shared credentials are prohibited.
- Support Agent accounts use separate support authentication and cannot sign in to owner or admin portals.
- The support dashboard shows total tickets and counts for New, Open, Pending, and Closed.
- Ticket columns are Ticket ID, Order ID, Name, Phone Number, Message Preview, Channel, Priority, Status, Assigned Agent, Created At, Last Updated At, and Actions.
- Ticket statuses are `New`, `Open`, `Pending`, and `Closed`.
- New tickets are assigned transactionally to the available active agent with the fewest non-closed tickets; ties use the least recently assigned agent. Thus two or three working agents receive an equal split over time. Expired, suspended, unavailable, or logged-out agents are skipped. Main Admin can reassign a ticket.
- Email is a synchronized notification and reply channel. The database ticket remains the source of truth; inbound email replies are appended to the ticket before appearing in the dashboard.
- Every assignment, status change, internal note, customer reply, email, escalation, and resolution is retained in ticket history.

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
3. Main Admin assesses severity and eligibility.
4. Main Admin proposes refund, replacement, store credit, or rejection.
5. Approved replacements create a priority production-house order.
6. Returned food products never become available for sale again.
7. Record each returned order item and quantity as `Pending Disposal`, then record disposal method, responsible Admin, and disposal time. Returned items never increase sellable inventory.
7. The system records product and delivery quality metrics.

## Reports And Reconciliation

Daily reports include:

- Orders by Cakes, GUNUCO PREMIUM, and Custom Cakes
- Accepted, delivered, cancelled, returned, and in-progress counts
- Gross revenue, discounts, delivery fees, refunds, and net revenue
- Payment-method reconciliation
- Quota utilization
- Product, flavour, egg/eggless, sugar type, flour type, and quantity trends
- Delivery-partner performance

## Notifications

### Main Admin

- New standard or custom-cake request
- Quota threshold reached or quota full
- Custom-cake delivery date approaching
- Order ready for delivery
- Delivery assignment rejected or delayed
- Cancellation, return, refund failure, or payment issue

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

## Production Readiness Requirements

These requirements harden the existing process and do not change any approved role, category, add-on, price, fee, quota, payment plan, status, fulfilment method, or customer-visible business rule.

### Transaction And State Integrity

- All status changes use server-side transition commands. Each command validates the current order, delivery, and pickup states; actor role; location authorization; fulfilment method; payment balance; and rider assignment before writing the new state.
- Booking is atomic: annual Order ID allocation, fresh server quote, product/add-on availability, quota consumption, slot reservation, payment confirmation, order creation, snapshots, audit entry, and outbox events either commit together or roll back together.
- Quota and slot checks use transactional locking or another concurrency-safe reservation mechanism so simultaneous checkouts cannot oversell capacity.
- Order ID validation plus `Collected` or `Delivered` remains one transaction and is idempotent. Repeating a completed request returns the existing result without completing it twice.
- Every order, delivery, and pickup transition is appended to status history with previous/new values, actor, reason, correlation ID, and timestamp.
- Editable operational records use optimistic concurrency. A stale update is rejected with a conflict response instead of overwriting a newer change.

### Payment Integrity

- Every checkout and payment attempt carries a server-enforced idempotency key. Reusing a key returns the original result and cannot create another order or charge.
- Payment success is accepted only from a signature-verified gateway event or authoritative gateway verification, never from a client success screen.
- Gateway event IDs are unique and duplicate callbacks are recorded and ignored safely.
- Refund and balance-payment processing is idempotent and reconciled against captured gateway amounts.
- `Payments` stores each Full, Advance, and Balance attempt. `PaymentGatewayEvents` stores every signed or rejected provider callback, and `PaymentTransactionHistory` stores every payment status transition, including failures and cancellations.
- `Cancellations` stores the Customer, Admin, or System actor, policy snapshot, elapsed minutes, eligibility tier, percentage, deduction, refund amount, notification choices, and correlation ID.
- `Refunds` stores each idempotent refund request, source cancellation/return/payment, amount, method, retries, gateway transaction, failure, actor, and final state. `RefundTransactionHistory` stores every refund status transition and retry.
- Insert the payment/refund/cancellation business change, corresponding history row, order summary update, audit row where an Admin acted, and outbox event in one SQL transaction. A status update without its history row must roll back.
- `AuditLogs` records Admin financial actions with before/after JSON, IP address, user agent, location, and the same correlation ID. Automated and gateway transitions remain attributable through their dedicated histories and gateway event records.
- The client supplies one UUID idempotency key per checkout, payment, refund, or ticket command and reuses it only when retrying that same command. A reused key returns the original result.
- Set `CancellationWindowStartedAt` from the first successful booking payment event (`Full` or `Advance`) in the same transaction that snapshots the cancellation policy.
- Set `CompletedAt` when a pickup order becomes `Collected`, a doorstep order becomes `Delivered`, or an order becomes `Cancelled`/`Resolved`; update status history in the same transaction.
- Allocate annual Order IDs and monthly Ticket IDs with `UPDLOCK, HOLDLOCK` on the applicable sequence row inside the creation transaction.
- Validate active delivery-fee bands for overlap before publishing a new or edited rule; reject ambiguous boundaries.
- Ticket assignment locks eligible support users while selecting the fewest non-closed tickets and least-recent assignment tie-breaker, then updates assignment and history in one transaction.
- Outbound and inbound support email attempts are stored with provider message IDs. Duplicate provider messages are ignored; accepted inbound replies append one ticket message.
- Currency is INR and all calculations use fixed decimal arithmetic with documented two-decimal rounding. Floating-point arithmetic is prohibited for money.

### Authorization And Security

- Authorization checks role, active account, assigned location, explicit POS permission, effective feature state, and resource ownership on every server request; hiding a UI action is not authorization.
- Owner Admin requires multi-factor authentication. Sessions support expiration, revocation, secure password reset, and rate limiting.
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

- Automated tests cover every role, location boundary, state transition, payment plan, fulfilment method, category module, add-on rule, cancellation, refund, and return path.
- Concurrency tests cover final quota/slot capacity, annual Order ID allocation, duplicate payment callbacks, simultaneous admin updates, rider reassignment, and balance payment during handover.
- Launch requires security, accessibility, load, payment-reconciliation, route-provider failure, backup-restore, and disaster-recovery testing.

## Current-Scope Rules

- The brand name is GUNUCO.
- Cakes is the active launch parent category. GUNUCO PREMIUM, Cakes & Wedding Cakes, and Cookies are its initial active configurable subcategories. Coffee, Pizza, Burgers, and other future parent categories are created and activated by Main Admin when needed.
- All launch orders are accepted and fulfilled by the production-house location; future orders are fulfilled by their assigned branch/location.
- Branch creation and transfer workflows are feature-disabled at launch, but location IDs and authorization boundaries are mandatory in the implementation.
- All cake orders capture flavour, Egg or Eggless, sugar type, flour type, size/weight, and quantity.
- Main Admin remains the central operational authority.
- POS remains cashless and is available to authorized staff only at assigned locations where both Global POS and Location POS are ON.
- Owner Admin alone controls branch creation, Owner/Main Admin access, global POS, admin-location access, and owner-only global rules. Main Admin manages category, subcategory, product, and add-on definitions subject to Owner Admin's full override and final authority. Branch Admin has no definition-level access.