# GUNUCO UI Wireframe Reference

## Product Scope

GUNUCO launches with one production-house location and one active parent category, `Cakes`, with configurable subcategories `GUNUCO PREMIUM`, `Cakes & Wedding Cakes`, and `Cookies`. The UI has two operational panels:

1. Main Admin Panel
2. Delivery Partner Panel
3. Customer Support Panel

Build the UI on configurable locations, parent categories, and subcategories. Main Admin can add or modify the Cakes subcategories and later add parent categories such as Coffee, Pizza, and Burgers without changing navigation code, order contracts, or reports. Only active categories and subcategories at the selected location are customer-visible. Cake option fields apply to compatible Cakes products only; future category modules render their own configured options. `Pickup-at-Store` means collection from the order's assigned location, which is the production house at launch.

## Global UX Rules

- Keep operational screens compact, clear, and easy to scan.
- Use consistent status colors and labels.
- Make order acceptance and category availability controls prominent.
- Design delivery screens mobile-first with large action targets.
- Clearly distinguish Cakes from Custom Cakes in filters and queues.
- Show validation inline for required choices and delivery lead time.
- Disable repeat submission while a command is pending and reuse the same request idempotency key when retrying after a network failure.
- Show explicit loading, empty, permission-denied, stale-data conflict, external-service failure, retry, and offline states without discarding entered data.
- On an optimistic-concurrency conflict, preserve the user's draft, show that the record changed, and provide `Review Latest` before resubmission. Never silently overwrite newer data.
- Payment UI treats the gateway return page as processing until the server verifies the payment. Do not show a booked order from an unverified client success response.
- Destructive or financial actions require confirmation, reason where applicable, and a clear success/failure result with a correlation/reference ID.

Production-hardening states supplement the existing screens; they do not change approved business functionality, labels, fees, statuses, role hierarchy, or fulfilment behavior.

## Main Admin Panel

### Navigation

```text
Dashboard
Point of Sale
Orders
Locations & Branches
Cake Catalogue
Categories & Subcategories
Add-Ons
Pricing & Weight Configuration
Custom Cakes
Production Queue
Delivery Partners
Delivery & Pickup Settings
Offers & Discounts
Cancel Orders
Refunds
Returns
Reports
Access
Settings
```

Navigation is permission-driven:

- Owner Admin sees every section and every global control.
- Main Admin sees operational sections plus editable Categories & Subcategories, Cake Catalogue, Add-Ons, pricing, and authorized user management. Owner-only branch creation, Global POS, and global-rule actions are hidden or read-only.
- Branch Admin sees Dashboard, Point of Sale, Orders, Production Queue, Delivery Partners, and pickup/delivery operations only for assigned locations. Category, subcategory, add-on, global settings, access-management, and branch-definition actions are hidden.
- Delivery Partner never enters the Main Admin Panel.

### Dashboard

Show:

- Today's orders and revenue
- Parent-category cards and subcategory breakdowns generated from configuration; launch shows Cakes with GUNUCO PREMIUM, Cakes & Wedding Cakes, and Cookies
- Awaiting acceptance, preparing, packed, and ready-for-delivery counts
- Deliveries Pending
- Delivering
- Delivered Today
- Quota usage
- Payment/refund alerts
- POS sales and POS revenue today
- Recent orders table
- Global Accept Orders toggle for Owner Admin; Main Admin and Branch Admin see its effective state read-only
- Active category and subcategory availability generated from location configuration
- Active-category acceptance controls generated from configuration; launch shows Cakes Automatic / Manual
- Delivery assignment segmented control: Automatic / Manual
- Daily limits for All Orders, every active category, and individual products
- Live Current/Limit values, remaining capacity, and 80% alerts
- Custom Cake scheduling controls: minimum 3 days/72 hours and maximum 30 days/720 hours
- Quick actions for New POS Sale, Add Product, and Assign Delivery; category-module actions appear only when that module is active

Order Controls board behavior:

- Automatic mode accepts a valid order immediately after all availability, payment, delivery-time, and daily-limit checks pass.
- Manual mode creates the order as Not Accepted and adds it to Awaiting Acceptance.
- Global Accept Orders OFF overrides both modes.
- Block acceptance when the requested quantity would exceed a global, category, or product limit.
- Daily usage resets at midnight in the configured production house timezone.
- Allow Custom Cakes only from 72 through 720 hours after order time; disable and reject dates outside that inclusive window.
- Automatic delivery assignment selects an eligible online rider by workload, schedule, service area, distance, and rating.
- Rejection or timeout tries the next eligible rider; no match alerts Main Admin and remains Pending Assignment.
- Dashboard and order rows show delivery status and assigned delivery partner.
- Show fulfilment method, verified distance, and delivery fee; pickup orders show no assigned rider.
- Show application/POS channel percentages and flag when application orders fall below the 99 percent operational target.
- Show Global POS ON/OFF and each location's effective POS state. Owner Admin controls Global POS and location-level POS; Main Admin and Branch Admin see the effective state read-only.

Recent orders columns:

```text
Order ID | Channel | Parent Category | Subcategory | Customer | Delivery Time | Amount | Production Status | Delivery Status
```

### Point of Sale

Provide a compact assisted-order workspace for Owner Admin, Main Admin, or authorized Branch Admins at their assigned location. Display a persistent notice: `Use only when the customer cannot order through the application.`

- Resolve the operator's location from the authenticated assignment; do not provide an unrestricted location selector
- Block New Sale when Global POS or that location's POS is OFF
- Required exception reason, including `No mobile device`, `Device unavailable`, `Application unavailable`, and `Accessibility assistance`
- Catalogue search and cascading parent-category/subcategory filters generated from configuration active at that location
- Product results with image, availability, starting price, same-day eligibility, and remaining daily quota
- Product controls generated from the selected product schema; cake products include flavour, Egg/Eggless, sugar type, flour type, weight, and quantity
- Required and optional add-ons generated from active product/category assignments
- Cart with edit, remove, clear, add-ons, discount/offer, itemized option pricing, subtotal, tax, and payable total
- Customer name, mobile number, required pickup time, and optional email; mobile may be omitted only for `No mobile device`, which requires a printed receipt
- Fixed fulfilment method `Pickup-at-Store`; POS does not create doorstep-delivery orders
- Required payment-plan selector: Full Payment or 50% Advance + 50% Balance
- Cashless payment methods only: Card, UPI, Net Banking, Wallet, and Store Credit
- `Collect Online Payment` action; no Cash, COD, `Record Cash`, or manual `Mark Paid` action
- Payment pending, success, failure, retry, and payment-hold states
- Receipt preview with Order ID, items, pricing, payment references, balance/deadline, pickup details, and cashier
- Print Receipt, Share Receipt, New Sale, and View Order actions after successful booking

The server recalculates every POS quote, including add-ons, and applies location/category/subcategory/product/add-on availability, quotas, scheduling, pricing, offer, payment, production, cancellation, refund, and audit rules. After successful booking payment and all checks pass, set the ordinary order directly to `Accepted`; POS never enters Awaiting Acceptance and requires no separate Main Admin approval. Record channel `POS`, location, operator, and exception reason. Do not maintain a separate POS inventory or order-status model.

### Locations & Branches

Owner Admin-only screen. Show the production house as the initial location and support future branch creation behind the branch feature flag. Fields include location name/code/type, address/map pin, operating hours, service area, active categories, fulfilment methods, order acceptance, admin assignments, and POS ON/OFF. Global POS OFF overrides every location. Disabling a branch or POS blocks new activity while retaining history. Main Admins and Branch Admins cannot access owner-only branch and global-control actions.

### Orders

Filters:

- Date
- Parent category and subcategory populated from active configuration
- Flavour
- Egg or Eggless
- Sugar Type
- Flour Type
- Order status
- Payment status
- Sales channel: Online or POS
- Delivery partner

Actions:

- View details
- Accept or reject
- Update production status
- Assign delivery partner
- Cancel where eligible

Order rows/details show parent category, subcategory, product options, add-ons, Payment Plan, Amount Paid, Balance Due, Balance Deadline, and Payment Hold. Add-ons show the saved name, description, unit price, quantity, required status, and total snapshot. Provide `Send Balance Reminder` and `Pay Balance Online` link actions; never provide a Record Cash action.

### Cake Catalogue

The product form includes:

- Cake name
- Description
- Product image
- Parent category fixed to Cakes and configurable subcategory selector, initially GUNUCO PREMIUM, Cakes & Wedding Cakes, or Cookies
- Available flavours
- Egg options
- Sugar type options
- Flour type options
- Available sizes/weights
- Base price and option-based prices
- Applicable required and optional add-ons with assignment preview
- Preparation time
- Allow Same-Day Delivery toggle
- Daily quantity quota
- Featured toggle
- Available toggle

The list supports search, status filtering, edit, duplicate, and availability toggle.

Default customer selection:

- Preselect 500g, Mishri, Egg, Maida, quantity 1, and the cake's default flavour.
- Show the calculated default-combination amount as `Starting Price`.
- Changing any option recalculates immediately; Reset to Default restores all configured defaults.
- Main Admin can change defaults, but publishing requires active selections and validates that the default combination is the lowest available starting-price combination.

GUNUCO PREMIUM cakes use all normal cake option and pricing controls. Show a premium badge throughout customer, admin, order, and production views. Owner Admin and Main Admin can classify or reclassify a catalogue cake; Branch Admin cannot.

### Categories & Subcategories

Owner Admin has full authority. Main Admin uses this screen to add, edit, activate, deactivate, and reorder parent categories and subcategories. Show hierarchy, code, name, parent, category module/type, status, display order, active locations, product count, and modified audit details. Prevent circular parent selection and destructive deletion when dependent products or child categories exist. Branch Admin has no edit access.

Seed the active `Cakes` parent with `GUNUCO PREMIUM`, `Cakes & Wedding Cakes`, and `Cookies`. Coffee, Pizza, and Burgers are examples Main Admin may create later; do not render them until configured and activated.

Use a hierarchy table with expandable parent rows and these actions: Add Parent Category, Add Subcategory, Edit, Activate/Deactivate, Reorder, View Products, and Configure Locations. The create/edit drawer includes code, display name, optional parent, category module/type, description, image, display order, acceptance mode, quota, same-day eligibility, and status. Selecting a parent filters eligible modules and prevents selecting the current category or any descendant as its parent.

Show confirmation and dependency impact before deactivation. Deactivating a parent hides all descendants from new customer and POS activity but preserves products and historical orders. Reactivation does not automatically enable every location; location availability remains explicit.

### Add-Ons

Main Admin manages add-on name, description, price, required/optional status, minimum quantity, maximum quantity, availability, display order, and assignments to parent categories, subcategories, or individual products. Include search, status and assignment filters, add, edit, duplicate, activate/deactivate, and price preview. Owner Admin has full authority; Branch Admin can view and sell only add-ons available for products at assigned locations.

Customer and POS product forms show applicable add-ons after product options. Required add-ons are automatically included or require explicit confirmation according to configuration; optional add-ons use quantity controls. Every price summary shows add-on unit price, quantity, and total, and the server requotes when an add-on changes.

The add-on list columns are:

```text
Add-On | Description | Price | Required/Optional | Quantity Range | Assignments | Active Locations | Status | Actions
```

The add/edit drawer provides category, subcategory, and product assignment selectors plus location availability and optional location price overrides. Require at least one assignment. Required add-ons must have a minimum quantity of at least 1. Reject a maximum quantity below the minimum, negative prices, duplicate codes, and assignments to inactive or incompatible products.

Show inherited applicability clearly: product assignment overrides category-level applicability only when an explicit product rule exists. Checkout and POS show unavailable add-ons disabled with the reason, remove stale selections after a server re-quote, and require the operator/customer to review the changed total before payment.

Option control and pricing rules:

- Main Admin selects available flavours, Egg/Eggless options, sugar types, flour types, and sizes per cake.
- Main Admin manages a weight-based Ingredient Pricing Matrix. Cakes and GUNUCO PREMIUM have separate 500g, 1kg, 2kg, and 3kg columns for every ingredient option.
- Flour Type master includes Maida and Wheat Flour.
- Customer price and itemized ingredient breakdown update immediately as any ingredient or quantity changes.
- Server recalculates base/discounted price plus all option adjustments, multiplied by quantity, before payment.
- Checkout rejects stale or client-modified quotes.
- Store ingredient IDs, labels, contributions, pricing version, calculation time, unit price, and total as an order-time snapshot.
- Admin can preview the exact customer price breakdown while editing the matrix.
- Custom Cakes use 1kg ingredient prices as the basis and multiply them by requested weight through 10kg, with a documented Admin override when needed.

### Pricing & Weight Configuration

Use one dedicated Main Admin screen with Flavour, Egg/Eggless, Flour Type, Sugar Type, Weight, and Price Preview tabs. Catalogue rows expose 500g, 1kg, 2kg, and 3kg price columns. Custom Cake rows expose a 1kg basis price, weight multiplier preview, and manual adjustment with reason.

For an unpaid Custom Cake request, actions are `Approve Quote`, `Request Clarification`, and `Reject`. `Approve Quote` sends the quote to the customer but does not mark the order Accepted. Show `Accept for Production` only as the automatic server result after customer quote approval and successful full payment or 50% advance.

Include default radio controls for flavour, Egg preference, sugar type, flour type, and weight, plus Default Quantity and a Starting Price preview. Initial defaults are 500g, Mishri, Egg, Maida, and quantity 1.

Weight behavior:

- Cakes and GUNUCO PREMIUM: 500g, 1kg, 2kg, and 3kg only.
- Custom Cakes: configurable weights from 500g through 10kg.
- Above 10kg: customer enters requested weight and submits for manual feasibility and price review.
- Above-10kg requests cannot use automatic acceptance or payment until Main Admin sends a quote and the customer approves it.
- Keep Weight per cake and Quantity of cakes as separate controls.
- Admin Price Preview reproduces the customer's itemized dynamic quote before publishing.

Same-day controls:

- Cakes and GUNUCO PREMIUM support same-day delivery independently.
- Main Admin controls category ON/OFF, cutoff, minimum preparation lead time, slots, slot capacity, service area, and per-cake ON/OFF.
- Offer same-day only when all timing, quota, production, slot, product, and address checks pass.
- Custom Cakes remain restricted to 3 through 30 days.
- Same-day orders support both cashless payment plans. Reserve the slot after full payment or the 50% advance, and require online balance payment before store handover or rider dispatch.

### Custom Cakes

The request form and admin detail view must include:

- Customer details and selected fulfilment option
- Delivery address only when `Doorstep-Delivery` is selected
- Flavour selector
- Egg or Eggless segmented control
- Sugar type selector
- Flour type selector: Maida or Wheat Flour
- Size/weight selector
- Quantity stepper
- Above-10kg requested weight input when applicable
- Occasion/theme
- Reference image upload and preview
- Cake message
- Special instructions
- Requested delivery date and time
- Delivery date picker limited to 3 through 30 days from order time
- Server validation for the inclusive 72-to-720-hour window
- Quoted and final price
- Payment status; pre-payment requests remain unpaid until feasibility and final price are confirmed
- Admin notes

Actions:

- Accept
- Request clarification
- Reject with reason
- Confirm price
- Move to production
- Assign delivery partner when ready

### Production Queue

Use one queue for all production-enabled categories and subcategories with clear hierarchy badges:

```text
Order ID | Parent Category | Subcategory | Product | Options & Add-Ons | Quantity | Required By | Status | Actions
```

Supported actions are Start Preparing, Mark Packed, and Mark Ready for Delivery.

The final ready action is fulfilment-aware: use `Mark Ready for Pickup` for `Pickup-at-Store` and `Mark Ready for Delivery` for `Doorstep-Delivery`.

### Delivery Partners

Show partner name, phone, vehicle, online status, current assignment, completed deliveries, and damage incidents. All assignments use the production house as pickup.

### Delivery & Pickup Settings

Main Admin controls `Pickup-at-Store` and `Doorstep-Delivery` independently. Include store pickup address/instructions and a dynamic distance-band table with Add Band, Edit, Activate/Deactivate, effective dates, minimum distance, maximum distance, fee, and maximum service range controls. Validate that active bands do not overlap or have ambiguous boundaries.

Default Cakes parent and eligible Cakes subcategory bands:

- 0 through 5 km inclusive: Rs 0
- Over 5 through 8 km inclusive: Rs 39
- Over 8 through 10 km inclusive: Rs 59
- Over 10 through 15 km inclusive: Rs 159
- Beyond 15 km: `Doorstep-Delivery` unavailable; offer `Pickup-at-Store`

Custom Cakes show `Pickup-at-Store` or `Doorstep-Delivery`, with Rs 0 fee for both. Use server-calculated road distance, preserve the unrounded value for band selection, snapshot the rule on checkout, and never assign a rider to store pickup orders.

### Customer Fulfilment Selection

Checkout places two equal-width options in a required segmented selector before payment:

- `Pickup-at-Store`: show `Free`, the production-house address, map action, operating hours, and pickup instructions. Hide delivery-address and distance fields.
- `Doorstep-Delivery`: show the delivery-address form, `Check Serviceability` action, verified road distance, applied distance band, delivery fee, and estimated delivery slot.

When `Doorstep-Delivery` is selected, display one clear fee result after server validation:

```text
Up to 5 km          Free delivery
Over 5 to 8 km      Rs 39
Over 8 to 10 km     Rs 59
Over 10 to 15 km    Rs 159
Beyond 15 km        Delivery unavailable - choose Pickup-at-Store
```

Show `Calculating distance...` while validating and an inline retry state if route calculation fails. Do not enable payment while distance is pending, the address is unserviceable, or the quote is stale. Changing the fulfilment option or doorstep address immediately requests a fresh server quote and displays Subtotal, Discount, Delivery Fee, and Payable Total. Highlight the selected method and require the customer to review the recalculated total before payment.

After total calculation, show a required payment-plan selector: `Full Payment` or `50% Advance + 50% Balance`. Do not show Cash or Cash on Delivery. For split payment, display Advance Due Now, Balance Due, Balance Deadline, and Pay Balance Online. Keep pickup handover and rider dispatch actions disabled until Balance Due is Rs 0.

Catalogue checkout books the order after successful full payment or 50% advance. A Custom Cake request may be saved before payment for Admin clarification, feasibility review, and quoting; production actions remain disabled until it is accepted and the required booking payment is captured.

Pickup orders use `Pickup Scheduled`, `Ready for Pickup`, and `Collected`. Provide an Admin pickup queue and send the customer Order ID, pickup address, map link, and operating hours. An authorized Owner Admin, Main Admin, or Branch Admin enters the Order ID and must receive an exact server match before `Collected` is enabled.

Initialize pickup status as `Pickup Scheduled` when booking succeeds. Keep handover blocked after a missed balance deadline and show Payment Hold, Send Reminder, Cancel under Policy, and Admin Review; never auto-complete or dispatch an unpaid order.

Display Order IDs as `YY-N` with at least two sequence digits, such as `26-01` and `26-888`. Use this Order ID instead of OTP for both fulfilment options. The customer provides the Order ID at store collection or doorstep delivery. On the rider screen, replace delivery OTP/proof confirmation with `Enter Order ID`, `Validate`, and a disabled `Mark Delivered` button that unlocks only after an exact server match for the assigned order. Keep the Admin `Collected` action disabled under the same exact-match rule.

Order ID validation UI states:

- Admin pickup screen: Order ID input, Validate action, success/failure message, attempt indicator, and disabled `Mark Collected` action until an exact match and zero balance are confirmed.
- Rider doorstep screen: Order ID input, Validate action, success/failure message, attempt indicator, and disabled `Mark Delivered` action until an exact match and zero balance are confirmed.
- Clear the entered value after a failed attempt, rate-limit repeated failures, and never expose the expected Order ID in an error message.
- After successful validation, show the matched Order ID and customer name read-only; complete validation and the final status update in one server transaction.
- Use the exact customer-facing Order ID only; do not request or accept an OTP, pickup code, phone number, or client-side success value as fulfilment proof.
- At store pickup, permit validation only for an Owner Admin, Main Admin, or Branch Admin authorized for the order's location. At the doorstep, permit validation only for the rider assigned to that order.

### Offers And Discounts

Allow offers for a parent category, subcategory, selected products, or selected add-ons. Include discount type, value, schedule, usage limit, status, stacking behavior, and a server-calculated preview. Preserve the applied offer and add-on price snapshots with the order.

### Cancellations, Refunds, And Returns

- Cancellation is time-based from confirmed booking payment and independent of `Preparing`. Default UI states are 0-30 minutes: 100% refund; over 30-60 minutes: 50% refund; after 60 minutes: unavailable with Raise Support Ticket. `Out for Delivery` and `Delivered` are never customer-cancellable.
- Refund: payment method, amount, status, retries, gateway reference, and reconciliation.
- Payment and refund detail drawers show an immutable timeline of attempts, gateway events, status transitions, actor/source, amount, retries, failures, timestamps, and correlation ID. Cancellation detail shows actor, policy snapshot, elapsed time, tier, percentage, deduction, and refund linkage.
- Returns: reason, evidence, severity, proposed resolution, customer response, replacement, escalation, and quality metrics.

## Guided Customer Support

Use a simple predefined topic menu: Cancel Order, Payment or Balance, Pickup, Delivery, Refund, Return, Custom Cake, and Something Else. This is normal application logic with stored rules and text; it uses no LLM, AI service, generated response, or autonomous agent.

Cancellation UI behavior:

- During the full-refund window, show the exact full-refund deadline, countdown, captured refund base, `100% refund`, calculated refund amount, and Cancel Order.
- During the partial-refund window, show the final cancellation deadline, countdown, configured percentage, calculated refund amount, non-refundable amount, and a required confirmation before Cancel Order.
- After the final deadline, disable cancellation and show `Cancellation window ended` with Raise Support Ticket.
- Production status, including `Preparing`, remains visible but does not alter the countdown.
- `Out for Delivery` and `Delivered` disable cancellation regardless of the countdown.
- Guided Support cannot override rules, modify orders, mark payments, or approve refunds.

### Cancellation Policy Settings

Owner Admin and Main Admin configure policy name, scope (global/location/category), full-refund window in minutes, final partial-refund deadline in minutes, partial-refund percentage, effective dates, and Active status. Defaults are 30 minutes, 60 minutes, and 50 percent. Validate that the final deadline exceeds the full-refund window and percentage is from 0 through 100.

Show a policy preview with example booking time, both deadlines, full/partial refund amounts, and the affected locations/categories. Saving creates a new effective version; it does not rewrite existing order snapshots. Branch Admin sees the effective policy read-only.

From a signed-in order, automatically use the verified Order ID, name, and phone. The customer enters only Message and may add up to three optional photos. Show three fixed image slots with preview/remove controls; accept JPEG, PNG, or WebP up to 5 MB each. On success, show Ticket ID, status, creation time, and `View Ticket`. Email the ticket to `support@gunuco.com` with subject `Ticket {Ticket ID} | Order {Order ID}`.

## Customer Support Panel

Portal: `https://support.gunuco.com/login`. Keep authentication and navigation separate from `https://admin.gunuco.com/login` and `https://owner.gunuco.com/login`.

### Support Dashboard

Summary cards: Total Tickets, New, Open, Pending, and Closed.

Filters: Ticket ID, Order ID, status, priority, assigned agent, channel, and date range.

```text
Ticket ID | Order ID | Subject | Message Preview | Photos | Status | Assigned Agent | Created At | Updated At | Actions
```

Ticket IDs use atomic `YYMM-NN` monthly numbering, for example `2608-01` and `2608-125`.

### Ticket Detail

Show Ticket ID and Order ID first, generated subject, customer message, up to three photos, read-only order summary, conversation, internal notes, assignment, and email state. Actions are Assign to Me, Reassign, Reply, Add Internal Note, Set Open, Set Pending, and Close.

Show inbound/outbound email delivery history, failures, bounces, and received times in the conversation. Mailbox retries must not create duplicate messages.

Main Admin manages individual freelancer accounts, access expiry, active/suspended state, maximum active users, and concurrent sessions. Never share credentials. Assign each new ticket to the available active agent with the fewest non-closed tickets, using least-recent assignment to break ties. Email replies synchronize into the same dashboard ticket; the dashboard database remains authoritative.

Support Agent access is ticket-focused and read-only for linked order data. It cannot change order, payment, cancellation eligibility, production, fulfilment, refund, user, catalogue, or settings data. Every action is audited.

### Reports

Include parent category, subcategory, product, add-on, flavour, Egg/Eggless, sugar type, flour type, quantity, same-day usage, revenue, refund, return, and delivery-partner reports. Category reports support hierarchy roll-up and drill-down; add-on reports include quantity, gross sales, discounts, and location performance.

### Access

Role hierarchy is `Owner Admin` -> `Main Admin` -> `Branch Admin` -> `Delivery Partner`. Owner Admin manages Main Admins, Branch Admins, and delivery partners. Main Admin may manage Branch Admins and delivery partners within authorized operations. Branch Admins require one or more location assignments and explicit POS permission. Branch Admin access checks are server-side and location-scoped; no lower role can create, modify, or remove a higher role.

### Settings

- Production-house profile and pickup address
- Operating hours and timezone
- Service area
- Global, category, product, and custom-cake quotas, including an independent GUNUCO PREMIUM limit
- Custom-cake minimum lead time (3 days) and maximum scheduling window (30 days)
- Flavour master
- Egg preference master with Egg and Eggless
- Sugar type master
- Flour type master
- Per-cake option price adjustments
- Ingredient Pricing Matrix with availability, effective date, audit details, and customer breakdown preview
- Same-day delivery controls for Cakes and GUNUCO PREMIUM
- Catalogue weight limit: 500g through 3kg
- Custom Cake weights: through 10kg, with larger weights handled by manual quote
- Size/weight master
- Payment and notification settings
- Cashless payments only; Full Payment and 50% Advance + 50% Balance controls
- POS receipt numbering, printing/sharing, supported cashless methods, and payment-terminal settings
- Global POS ON/OFF plus location-level POS ON/OFF; both must be ON for a new assisted order
- Configurable category hierarchy. Seed Cakes as the active parent with GUNUCO PREMIUM, Cakes & Wedding Cakes, and Cookies as active subcategories. Main Admin can later create Coffee, Pizza, Burgers, or any other parent/subcategory; do not hard-code allowed names
- Add-on master, required/optional rules, quantity ranges, category/subcategory/product assignments, location availability, and location price overrides
- Branch feature flag, location configuration, location-category availability, and staff-location assignments
- Same-day balance deadline and payment-hold alerts
- Security controls: Owner Admin MFA status, active sessions, session revocation, password reset, and rate-limit policy status
- Operational health: payment webhook, route provider, notification worker, rider-assignment worker, outbox backlog, and last successful processing time
- Data operations: migration version, backup status, last restore drill, retention policy, and audit export access for Owner Admin

## Delivery Partner Panel

### Bottom Navigation

```text
Orders | Earnings | Profile
```

### Orders

Each assignment shows:

- Production-house pickup address
- Customer address and map
- Order category and quantity
- Order subcategory, product, selected add-ons, and total item quantity
- Fragile/custom-cake indicator
- Customer call action
- Accept Assignment
- Picked Up
- Out for Delivery
- Mark Delivered
- Order ID validation status
- Payment status and Balance Due
- Assignment accept-by time
- Reject assignment with reason

Only `Doorstep-Delivery` orders appear in the rider application. `Pickup-at-Store` orders stay in the Admin production/pickup queue.

Automatic assignments appear immediately in the rider application. Acceptance updates Main Admin in real time; rejection or timeout returns the order to automatic fallback. Riders cannot update orders they have not accepted.

`Picked Up`, `Out for Delivery`, and `Mark Delivered` remain disabled while Balance Due is greater than Rs 0. Riders never collect cash.

### Earnings

Show today's completed orders, today's earnings, weekly earnings, incentives, and payment history.

### Profile

Show delivery-partner details, vehicle, availability toggle, ratings, and support contact. Do not show branch assignment.

## Shared Components

### Product Configuration Summary

```text
Parent Category | Subcategory | Product | Configured Options | Add-Ons | Quantity
```

For cake-module products, expand Configured Options as `Flavour | Egg Preference | Sugar Type | Flour Type | Size/Weight`. Future category modules render their own configured labels without empty cake fields.

### Role Access Summary

```text
Area                           Owner Admin   Main Admin   Branch Admin
All global controls            Full          Read-only    Read-only
Branches and admin assignment  Full          No access    No access
Categories and subcategories   Full          Manage       No access
Products, pricing, add-ons      Full          Manage       View/sell assigned location
Orders and production          Full          Manage       Assigned locations only
POS                            Full          Authorized   Assigned locations when enabled
Pickup Order ID validation     All locations Authorized  Assigned locations only
Reports                        Full          Authorized   Assigned-location reports
```

### Statuses

```text
Not Accepted | Clarification Requested | Rejected | Accepted | Preparing | Packed | Ready for Delivery
Delivery Partner Assigning | Assigned | Picked Up | Out for Delivery | Delivered
Cancelled | Return Requested | Resolved
```

Pickup status is displayed separately as `Pickup Scheduled`, `Ready for Pickup`, `Collected`, or `Cancelled`.

## Suggested Figma Structure

```text
01_Cover
02_User_Flows
03_Low_Fidelity_Wireframes
04_Main_Admin
05_Delivery_Partner
06_Components
07_Design_System
08_Handoff_Notes
```

All flows and labels must use GUNUCO and the production-house-only model.