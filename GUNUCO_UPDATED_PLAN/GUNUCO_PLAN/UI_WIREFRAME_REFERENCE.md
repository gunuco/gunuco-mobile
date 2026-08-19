# GUNUCO UI Wireframe Reference

## Product Scope

GUNUCO has four top-level categories: `Cakes`, `Coffee`, `Pizza`, and `Burgers`. Only `Cakes` is active at launch. Its active subcategories are `GUNUCO PREMIUM CAKES`, `GUNUCO CHEESE CAKES`, `GUNUCO BROWNIES`, `GUNUCO NYC COOKIES`, `CASUAL CAKES`, `WEDDING OR ANNIVERSARY CAKES`, and `OCCASIONAL CAKES`. The UI has three operational panels:

1. Admin Panel
2. Delivery Partner Panel
3. Customer Support Panel

Build the UI on configurable locations, parent categories, and subcategories. Coffee, Pizza, and Burgers remain hidden while inactive and can be implemented later without changing navigation code, order contracts, or reports. Only active categories and subcategories at the selected location are customer-visible. Cake option controls render from effective category/product customization settings. `Pickup-at-Store` means collection from the order's assigned location, which is the production house at launch.

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

## Web Admin Panel

### Navigation

```text
Dashboard
Point of Sale
Orders
Wedding & Anniversary Orders
Support Tickets
Locations & Branches
Menu Management
Custom Cakes
Production Queue
Delivery Partners
Delivery & Pickup Settings
Offers & Discounts
Customer Feedback
Testimonials
Cancel Orders
Refunds
Returns
Reports
Access
Settings
```

Navigation is permission-driven:

- Owner sees every section and every global control.
- Admin sees operational sections plus editable Menu Management and authorized user management. Owner-only branch creation, Global POS, and global-rule actions are hidden or read-only.
- Branch Manager sees Dashboard, Point of Sale, Orders, Menu Management, Production Queue, Delivery Partners, and pickup/delivery operations for assigned locations. Menu definitions are read-only; assigned-location availability, sold-out state, quota, and authorized price overrides are editable.
- Owner and Admin see all authorized Support Tickets and all ticket-operational controls. Branch Manager sees assigned-location tickets with limited reply, note, Open, and Pending actions.
- Delivery Partner never enters the Admin Panel.

### Dashboard

Show:

- Today's orders and revenue
- Parent-category cards and subcategory breakdowns generated from configuration; launch shows Cakes and its seven active subcategories
- Awaiting acceptance, preparing, packed, and ready-for-delivery counts
- Deliveries Pending
- Delivering
- Delivered Today
- Quota usage
- Payment/refund alerts
- POS sales and POS revenue today
- Recent orders table
- Global Accept Orders toggle for Owner; Admin and Branch Manager see its effective state read-only
- Active category and subcategory availability generated from location configuration
- Active-category acceptance controls generated from configuration; launch shows Cakes Automatic / Manual
- Delivery assignment segmented control: Automatic / Manual
- Daily limits for All Orders, every active category, and individual products
- Live Current/Limit values, remaining capacity, and 80% alerts
- Wedding or Anniversary Cakes scheduling controls: fixed minimum 72 hours and maximum 720 hours
- Quick actions for New POS Sale, Add Product, and Assign Delivery; category-module actions appear only when that module is active

Order Controls board behavior:

- Automatic mode accepts a valid order immediately after all availability, payment, delivery-time, and daily-limit checks pass.
- Manual mode creates the order as Not Accepted and adds it to Awaiting Acceptance.
- Global Accept Orders OFF overrides both modes.
- Block acceptance when the requested quantity would exceed a global, category, or product limit.
- Daily usage resets at midnight in the configured production house timezone.
- Allow `WEDDING OR ANNIVERSARY CAKES` only from exactly 72 through exactly 720 hours after immutable server order-creation time. Disable invalid date/times and reject them server-side before payment and booking.
- Do not apply this fixed window to other categories or Custom Cakes.
- Automatic delivery assignment selects an eligible online rider by workload, schedule, service area, distance, and rating.
- Rejection or timeout tries the next eligible rider; no match alerts Admin and remains Pending Assignment.
- Dashboard and order rows show delivery status and assigned delivery partner.
- Show fulfilment method, verified distance, and delivery fee; pickup orders show no assigned rider.
- Show application/POS channel percentages and flag when application orders fall below the 99 percent operational target.
- Show Global POS ON/OFF and each location's effective POS state. Owner controls Global POS and location-level POS; Admin and Branch Manager see the effective state read-only.

Recent orders columns:

```text
Order ID | Channel | Parent Category | Subcategory | Customer | Delivery Time | Amount | Production Status | Delivery Status
```

### Point of Sale

Provide a fast, real-time Zepto-style assisted-order workspace for Owner, Admin, or authorized Branch Managers at their assigned location. Display a persistent notice: `Use only when the customer cannot order through the application.` Resolve location from the authenticated assignment and block `New Sale` when Global POS or Location POS is OFF.

#### Desktop Layout

Use a stable three-column application shell that fills the available viewport below the admin header:

```text
┌──────────────────┬──────────────────────────────────────┬──────────────────────────┐
│ Categories       │ Selected category products           │ Current cart             │
│ 220-260px        │ flexible, minimum 520px              │ 340-420px                │
│                  │                                      │                          │
│ Cakes            │ Category title · Search · Filters    │ Customer / pickup        │
│  Premium Cakes   │ Product grid                         │ Cart lines               │
│  Cheese Cakes    │                                      │ Offers and totals        │
│  Brownies        │                                      │ Full payment action      │
│  NYC Cookies     │                                      │                          │
│  Casual Cakes    │                                      │                          │
│  Wedding/Anniv.  │                                      │                          │
│  Occasional      │                                      │                          │
└──────────────────┴──────────────────────────────────────┴──────────────────────────┘
```

The category rail and cart remain fixed while only the product area scrolls. Do not use floating cards for the three main regions. Use clear separators and compact rows suitable for repeated cashier use.

#### Category Rail

- Generate top-level categories and subcategories from active configuration for the operator's location; never hard-code category names in the component.
- Show icon or image, category name, optional product count, and expand/collapse control. Preserve configured display order.
- Highlight the selected category with a strong left indicator and selected background. Remember the selection during the active cart session.
- Selecting a parent shows products across active descendants; selecting a subcategory shows only its products.
- At launch show Cakes and its seven subcategories. Hide inactive Coffee, Pizza, and Burgers completely.
- Disable a category that becomes unavailable while the screen is open, explain the reason in a tooltip, and move selection to the nearest available category only when the current category can no longer be browsed.

#### Product Workspace

- Header: selected category name, available product count, search field, `Available only` toggle, and sort menu (`Display order`, `Name`, `Price`).
- Search product name and product code in the selected category. Provide an `All Active Categories` search scope. Scanner/SKU input uses the product-code lookup path.
- Render a responsive product grid with stable card dimensions. Each card shows product image, name, starting/current price, availability, same-day indicator when relevant, and compact remaining-quota state.
- Clicking an available fixed-option product adds its effective Default Quantity immediately and briefly confirms the add without shifting layout.
- Clicking a product with enabled customization or add-ons opens a right-side configuration drawer over the product area, not over the cart. Render only effective controls: flavour, Egg/Eggless, sweetener, flour, size/weight, add-ons, and quantity.
- The drawer shows live item price, required choices, defaults, validation, `Cancel`, and `Add to Cart` or `Update Item`. Disable the action until required choices are valid.
- Unavailable products remain visible when `Available only` is OFF, with the reason and disabled add action.
- Use skeleton rows/cards while loading, a scoped retry panel on failure, and an empty state for categories with no configured products.

#### Persistent Cart

- Create the server-side POS cart after the operator records the required exception reason: `No mobile device`, `Device unavailable`, `Application unavailable`, or `Accessibility assistance`.
- Keep the cart visible while category selection, search, filters, and product configuration change.
- Each cart line shows image, product name, selected options/add-ons, unit price, quantity stepper, line total, edit, and remove actions.
- Merge additions only when product, selected options, and add-ons are identical; otherwise create a separate line.
- Provide `Clear`, `Hold`, `Resume`, and `Abandon` commands with confirmation where data would be discarded. Show held carts in a compact operator/location-scoped menu with customer label, item count, total, and last-updated time.
- Persist every cart mutation server-side. Restore the active cart after refresh/reconnect and show a small `Saved`/`Syncing`/`Offline` status without blocking normal scanning.
- Customer section: name, mobile, optional email, and required pickup time. Mobile is optional only for `No mobile device`, which forces receipt printing.
- Summary: itemized option/add-on prices, automatic offer, subtotal, discount, tax, and full payable total.
- Fixed fulfilment method is `Pickup-at-Store`; POS never creates doorstep-delivery orders.

#### Real-Time Behavior

- Subscribe to location-scoped catalogue events for category, product, price, customization, add-on, offer, quota, and POS availability changes. Use short polling as fallback after disconnect.
- Events carry entity ID and version only. Refetch affected data and never trust a pushed price.
- Show a subtle live connection indicator. Reconnect automatically and refresh selected-category data after reconnect.
- Requote affected cart lines on every relevant update. Mark lines as `Price changed`, `Unavailable`, `Quota exceeded`, or `Configuration changed`.
- Preserve changed lines for review; do not silently remove or replace them. Disable payment until staff accepts the refreshed quote or removes invalid lines.
- Use row-version conflict handling for cart edits. When another session changed the cart, retain the server version, identify changed lines, and offer `Review Cart`.

#### Payment And Completion

- Launch cashless methods only: Card, UPI, and Net Banking. Wallet and Store Credit remain hidden and unavailable until a later release. Never show Cash, COD, `Record Cash`, or manual `Mark Paid`.
- Require payment of the complete payable total.
- Before `Collect Online Payment`, require valid customer/pickup details, no invalid cart lines, and acceptance of the latest quote.
- Show payment pending, gateway verification, success, failure, retry, and payment-confirmation states. A client gateway success does not book the order until server verification succeeds.
- After verified payment, atomically convert the cart into an `Accepted` POS order, preserve the cart/order link, consume quota, and enter the shared production queue. POS never enters Awaiting Acceptance.
- Receipt preview includes Order ID, items, itemized pricing, payment references, pickup details, cashier, and exception reason. Provide Print Receipt, Share Receipt, New Sale, and View Order.

The server recalculates every POS quote and applies the same location/category/subcategory/product/add-on availability, customization, quota, scheduling, pricing, offer, payment, production, cancellation, refund, and audit rules as application checkout. Record channel `POS`, location, operator, exception reason, cart identity, and checkout idempotency key. Do not maintain a separate POS inventory or order-status model.

#### Responsive Behavior

- At 1024-1279px, collapse the category rail to icon + short label and keep the cart at least 320px wide.
- Below 1024px, use category tabs/side sheet, full-width product workspace, and a persistent cart button with item count and total; cart opens as a full-height side sheet.
- Keep product card, quantity, and payment controls touch-friendly. Text, prices, badges, and controls must not overlap at any supported width.

### Locations & Branches

Owner-only screen. Show the production house as the initial location and support future branch creation behind the branch feature flag. Fields include location name/code/type, address/map pin, operating hours, service area, active categories, fulfilment methods, order acceptance, admin assignments, and POS ON/OFF. Global POS OFF overrides every location. Disabling a branch or POS blocks new activity while retaining history. Admins and Branch Managers cannot access owner-only branch and global-control actions.

### Orders

Filters:

- Date
- Parent category and subcategory populated from active configuration
- Flavour, Egg or Eggless, Sweetener Type, and Flour Type only when applicable to the selected category
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

Order rows/details show parent category, subcategory, product options, add-ons, full payable amount, amount paid, and payment status. Add-ons show the saved name, description, unit price, quantity, required status, and total snapshot. Never provide a Record Cash action.

### Wedding & Anniversary Orders

This dedicated sidebar page is a filtered view of ordinary Orders where subcategory code is `WEDDING_ANNIVERSARY_CAKES`; it does not create a second order model.

- Summary cards: Next 3 Days, Next 7 Days, Awaiting Acceptance, Preparing, Ready for Pickup/Delivery, and At Risk.
- Filters: requested fulfilment date, order date, location, product, order/payment/production status, fulfilment method, and customer.
- Columns: Order ID, Created At, Requested At, Lead Time Remaining, Customer, Product, Options, Quantity, Amount, Payment, Production, Fulfilment, Rider, and Actions.
- Default sort: requested fulfilment ascending, then created time ascending.
- Owner/Admin see authorized records; Branch Manager sees assigned-location records.
- Actions reuse Orders permissions: View, Accept/Reject, Update Production, Assign/Reassign Rider, and Cancel when eligible.
- Date/time picker disables values below 72 hours and above 720 hours from current server time. Show the first and last valid timestamps and timezone.
- On edit/reschedule, validate against the immutable order-created time, not the current time. Exactly 72 and 720 hours are valid.
- Show inline `Too Early` and `Too Far` states; payment and booking remain disabled until valid.
- Show At Risk when remaining preparation time crosses the configured operational threshold.

### Menu Management

Use one desktop-first workspace with no separate catalogue/category/pricing routes:

```text
+----------------------+--------------------------------------+-------------------------+
| CATEGORY TREE        | PRODUCTS                             | PRODUCT EDITOR          |
| Search               | Cakes > Casual Cakes                | Draft / Published       |
| + Add Category       | Search  Filter  Sort  + Add Product | Name                    |
|   Cakes              | [Image] Name / Description / Price  | Short + full description|
|    Premium Cakes     | [Image] Name / Description / Price  | Images                  |
|    Casual Cakes      | [Image] Name / Description / Price  | Base/discount price     |
|    Wedding Cakes     |                                      | Options/add-ons/weights |
+----------------------+--------------------------------------+-------------------------+
| Products | Categories | Add-Ons | Customization | Pricing & Weights | Locations |
+--------------------------------------------------------------------------------+
```

- Selecting a category/subcategory filters the product area and preselects that hierarchy when adding a product.
- Product rows/cards show image, name, short description, base/discount price, option summary, location availability, publication status, and display order.
- Editor fields include code/SKU, name, short/full description, primary/gallery images, hierarchy, tags, prices, tax class, preparation time, order, featured, same-day, quota, and availability.
- Save Draft allows incomplete entry. Preview renders the exact customer card/detail. Publish validates required content, primary image, valid prices, active location, and all enabled required-option pricing.
- Provide duplicate, archive, reorder, bulk import/export, bulk availability, and customer-menu preview actions.
- Preserve the selected hierarchy, filters, scroll position, and unsaved draft while switching tabs.
- Owner and Admin edit definitions. Branch Manager sees definitions read-only and edits assigned-location availability, sold-out state, quota, and authorized price overrides only.
- Audit every create, edit, publish, reorder, archive, import, and location override.

#### Products Tab

The product form includes:

- Cake name
- Description
- Product image
- Parent category fixed to Cakes and a configurable selector containing its seven launch subcategories
- Subcategory selector containing the seven configured Cakes subcategories
- Effective customization summary showing inherited and overridden controls
- Per-product `Inherit`, `ON`, or `OFF` control for Flavour Type, Egg or Eggless, Sweetener Type, Flour Type, and Size or Weight
- Per-product Quantity rule: `Inherit` or `Override`, with Minimum, Maximum, and Default values when overridden
- Available option values and defaults for each enabled customization
- Base price and option-based prices
- Applicable required and optional add-ons with assignment preview
- Preparation time
- Allow Same-Day Delivery toggle
- Daily quantity quota
- Featured toggle
- Available toggle

The list supports search, status filtering, edit, duplicate, and availability toggle.

Default customer selection for products with enabled customization:

- Preselect only enabled option defaults and the effective Default Quantity; suggested launch defaults are 500g, Mishri, Egg, Maida, quantity 1, and the cake's default flavour where enabled.
- Show the calculated default-combination amount as `Starting Price`.
- Changing any option recalculates immediately; Reset to Default restores all configured defaults.
- Admin can change defaults, but publishing requires active selections and validates that the default combination is the lowest available starting-price combination.

GUNUCO PREMIUM CAKES show a premium badge throughout customer, admin, order, and production views. Their launch customization defaults are OFF, but Admin may enable options for the entire subcategory or override an individual product. Owner and Admin can classify or reclassify a catalogue cake; Branch Manager cannot.

#### Categories Tab

Owner has full authority. Admin uses this screen to add, edit, activate, deactivate, and reorder parent categories and subcategories. Show hierarchy, code, name, parent, category module/type, status, display order, active locations, product count, and modified audit details. Prevent circular parent selection and destructive deletion when dependent products or child categories exist. Branch Manager has no edit access.

Seed top-level `Cakes` as active and `Coffee`, `Pizza`, and `Burgers` as inactive. Seed Cakes with `GUNUCO PREMIUM CAKES`, `GUNUCO CHEESE CAKES`, `GUNUCO BROWNIES`, `GUNUCO NYC COOKIES`, `CASUAL CAKES`, `WEDDING OR ANNIVERSARY CAKES`, and `OCCASIONAL CAKES`.

Use a hierarchy table with expandable parent rows and these actions: Add Parent Category, Add Subcategory, Edit, Activate/Deactivate, Reorder, View Products, Configure Customization, and Configure Locations. The create/edit drawer includes code, display name, optional parent, category module/type, description, image, display order, acceptance mode, quota, same-day eligibility, and status. Selecting a parent filters eligible modules and prevents selecting the current category or any descendant as its parent.

The `Configure Customization` drawer is editable only by Owner and Admin. It presents a hierarchy matrix for Flavour Type, Egg or Eggless, Sweetener Type, Flour Type, and Size or Weight. Main-category rows use ON/OFF; subcategory and product rows use Inherit/ON/OFF. Every cell shows its effective value and source level. Branch Manager sees the matrix read-only. Show inherited descendant counts and explicit override counts before saving. Launch defaults are OFF for GUNUCO PREMIUM CAKES, GUNUCO CHEESE CAKES, GUNUCO BROWNIES, and GUNUCO NYC COOKIES; defaults are ON for CASUAL CAKES, WEDDING OR ANNIVERSARY CAKES, and OCCASIONAL CAKES.

Resolve each customization column independently. A Sweetener-only product explicitly uses Sweetener Type `ON` and Flavour Type, Egg/Eggless, Flour Type, and Size/Weight `OFF`; its customer/POS form shows only Sweetener Type and Quantity. Never infer one option group from another or from the category module.

Do not provide a blanket switch that enables all customization groups. Admin turns on only the groups required for that category or product. `ON` makes that group applicable and requires a valid selection, normally satisfied initially by the configured default. `OFF` hides the group and causes the server to reject a submitted value. `Inherit` resolves from the nearest explicit category setting.

Add Quantity to the hierarchy as a separate rule, not an ON/OFF customization. Main categories use `Override`; subcategories and products use `Inherit/Override`. Override exposes Minimum, Maximum, and Default Quantity. Resolve Product → Subcategory → Main Category → minimum `1`, maximum `99`, default `1`. Quantity is mandatory, cannot be turned OFF, and is enforced by both the stepper boundaries and server validation.

Before turning a category or product option ON, require at least one active value, a default value, and one 1kg price contribution for each active Flavour, Egg/Eggless, Sweetener, or Flour value. Size/Weight instead requires an active weight and its separate weight base price. Show missing configuration inline and block publication. Turning an option OFF requires confirmation, removes it from new customer/POS quotes, and triggers re-quote messaging for affected carts without changing historical orders.

Show confirmation and dependency impact before deactivation. Deactivating a parent hides all descendants from new customer and POS activity but preserves products and historical orders. Reactivation does not automatically enable every location; location availability remains explicit.

#### Add-Ons Tab

Admin manages add-on name, description, price, required/optional status, minimum quantity, maximum quantity, availability, display order, and assignments to parent categories, subcategories, or individual products. Include search, status and assignment filters, add, edit, duplicate, activate/deactivate, and price preview. Owner has full authority; Branch Manager can view and sell only add-ons available for products at assigned locations.

Customer and POS product forms show applicable add-ons after product options. Required add-ons are automatically included or require explicit confirmation according to configuration; optional add-ons use quantity controls. Every price summary shows add-on unit price, quantity, and total, and the server requotes when an add-on changes.

The add-on list columns are:

```text
Add-On | Description | Price | Required/Optional | Quantity Range | Assignments | Active Locations | Status | Actions
```

The add/edit drawer provides category, subcategory, and product assignment selectors plus location availability and optional location price overrides. Require at least one assignment. Required add-ons must have a minimum quantity of at least 1. Reject a maximum quantity below the minimum, negative prices, duplicate codes, and assignments to inactive or incompatible products.

Show inherited applicability clearly: product assignment overrides category-level applicability only when an explicit product rule exists. Checkout and POS show unavailable add-ons disabled with the reason, remove stale selections after a server re-quote, and require the operator/customer to review the changed total before payment.

Option control and pricing rules:

- Owner or Admin sets main-category ON/OFF values and subcategory/product Inherit/ON/OFF values for flavour, Egg/Eggless, sweetener, flour, and size/weight.
- Effective state is product explicit value, then subcategory explicit value, then main-category value, otherwise OFF.
- Each group is independent; a product may expose only Sweetener Type while all other option groups are OFF.
- Owner or Admin separately configures inherited Minimum, Maximum, and Default Quantity. Quantity always remains visible.
- Changing a parent shows an impact confirmation, preserves explicit child overrides, emits a catalogue-change event, and requotes affected carts.
- Admin manages a 1kg-based Ingredient Pricing Matrix only for enabled customization types. Each option has one editable 1kg contribution; all other weights are calculated previews, including 500g as half of the 1kg value.
- Flour Type master includes Maida and Wheat Flour.
- Customer price and itemized ingredient breakdown update immediately as any ingredient or quantity changes.
- Server recalculates base/discounted price plus all option adjustments, multiplied by quantity, before payment.
- Checkout rejects stale or client-modified quotes.
- Store ingredient IDs, labels, contributions, pricing version, calculation time, unit price, and total as an order-time snapshot.
- Admin can preview the exact customer price breakdown while editing the matrix.
- Custom Cakes use the same 1kg option-price basis and multiply each contribution by `requested grams / 1000` through 10kg, with a documented Admin override when needed.

#### Pricing & Weights Tab

Use the `Pricing & Weights` tab inside Menu Management with Flavour, Egg/Eggless, Flour Type, Sweetener Type, Weight, and Price Preview sub-tabs. Option rows expose one editable `1kg Price Contribution` plus read-only calculated previews for 500g, 2kg, 3kg, and a selected Custom Cake weight. Weight base prices remain separately editable. Custom Cake rows also expose the weight-in-kg multiplier and manual adjustment with reason.

For an unpaid Custom Cake request, actions are `Approve Quote`, `Request Clarification`, and `Reject`. `Approve Quote` sends the quote to the customer but does not mark the order Accepted. Show `Accept for Production` only as the automatic server result after customer quote approval and verified full payment.

Include default radio controls for each enabled customization, plus Default Quantity and a Starting Price preview. Suggested defaults are 500g, Mishri, Egg, Maida, and quantity 1 where those controls are enabled.

Weight behavior:

- Customizable catalogue cakes: configured sizes from 500g through 3kg; fixed-size products hide the size selector.
- Custom Cakes: configurable weights from 500g through 10kg.
- Above 10kg: customer enters requested weight and submits for manual feasibility and price review.
- Above-10kg requests cannot use automatic acceptance or payment until Admin sends a quote and the customer approves it.
- Keep Weight per cake and Quantity of cakes as separate controls.
- Admin Price Preview reproduces the customer's itemized dynamic quote before publishing.

Same-day controls:

- Each Cakes subcategory and product has an independent same-day delivery setting.
- Admin controls category ON/OFF, cutoff, minimum preparation lead time, slots, slot capacity, service area, and per-cake ON/OFF.
- Offer same-day only when all timing, quota, production, slot, product, and address checks pass.
- Wedding or Anniversary Cakes are never same-day eligible and remain restricted to 72 through 720 hours. This does not apply to Custom Cakes.
- Same-day orders require full online payment. Reserve the slot only after the full amount is verified.

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
- Delivery date/time from separately configured Custom Cake availability; do not inherit the Wedding or Anniversary Cakes fixed window
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

The final ready action is fulfilment-aware: use `Mark Ready for Pickup` for `Pickup-at-Store`, `Mark Ready for Delivery` for local `Doorstep-Delivery`, and `Mark Packed` for NYC Cookies `Nationwide-Delivery`; the corresponding shipment begins at `Pending Dispatch`.

### Delivery Partners

Show partner name, phone, vehicle, online status, current assignment, completed deliveries, and damage incidents. All assignments use the production house as pickup.

### Delivery & Pickup Settings

Admin controls `Pickup-at-Store` and `Doorstep-Delivery` independently. Include store pickup address/instructions and a dynamic distance-band table with Add Band, Edit, Activate/Deactivate, effective dates, minimum distance, maximum distance, fee, and maximum service range controls. Validate that active bands do not overlap or have ambiguous boundaries.

When the selected subcategory code is `GUNUCO_NYC_COOKIES`, show an exclusive `NYC Cookies Delivery Coverage` section:

- `Regular City Delivery` ON/OFF, using existing local service area, distance bands, slots, and delivery partners
- `All-India Delivery` ON/OFF
- Coverage segmented control: `All States & UTs` / `Selected States & UTs`, visible only when All India is ON
- Searchable state/UT checklist grouped by State and Union Territory, with Select All, Clear All, enabled count, and per-row ON/OFF
- Nationwide Shipping Fee, Minimum Delivery Days, and Maximum Delivery Days
- Read-only summary: `Regular City`, `All 36 States/UTs`, or `{n} Selected States/UTs`
- Save confirmation showing newly enabled/disabled destinations and affected unpaid carts

Require at least one of Regular City or All India to remain ON. Selected States mode requires at least one enabled destination. Hide this section for every other subcategory. Owner and Admin edit it; Branch Manager is read-only.

Default Cakes parent and eligible Cakes subcategory bands:

- 0 through 5 km inclusive: Rs 0
- Over 5 through 8 km inclusive: Rs 39
- Over 8 through 10 km inclusive: Rs 59
- Over 10 through 15 km inclusive: Rs 159
- Beyond 15 km: `Doorstep-Delivery` unavailable; offer `Pickup-at-Store`

Custom Cakes show `Pickup-at-Store` or `Doorstep-Delivery`, with Rs 0 fee for both. Use server-calculated road distance, preserve the unrounded value for band selection, snapshot the rule on checkout, and never assign a rider to store pickup orders.

### Customer Fulfilment Selection

Checkout normally places two equal-width options in a required segmented selector before payment:

- `Pickup-at-Store`: show `Free`, the production-house address, map action, operating hours, and pickup instructions. Hide delivery-address and distance fields.
- `Doorstep-Delivery`: show the delivery-address form, `Check Serviceability` action, verified road distance, applied distance band, delivery fee, and estimated delivery slot.

For NYC Cookies only, serviceability may add a third `Nationwide Delivery` option. Show it only when All-India Delivery is ON and the verified address state/UT is covered. Display shipping fee and estimated delivery-day range; do not calculate road-distance bands or assign a local rider. If Regular City and Nationwide both qualify, show both and let the customer choose. If the state is disabled, show `Nationwide delivery is not available in this state` and keep payment disabled for that method.

When `Doorstep-Delivery` is selected, display one clear fee result after server validation:

```text
Up to 5 km          Free delivery
Over 5 to 8 km      Rs 39
Over 8 to 10 km     Rs 59
Over 10 to 15 km    Rs 159
Beyond 15 km        Delivery unavailable - choose Pickup-at-Store
```

Show `Calculating distance...` while validating and an inline retry state if route calculation fails. Do not enable payment while distance is pending, the address is unserviceable, or the quote is stale. Changing the fulfilment option or doorstep address immediately requests a fresh server quote and displays Subtotal, Discount, Delivery Fee, and Payable Total. Highlight the selected method and require the customer to review the recalculated total before payment.

After total calculation, show one `Pay Full Amount` action. Do not show advance, installment, balance-due, Cash, or Cash on Delivery controls. Do not book the order until the server verifies payment of the complete payable total.

NYC Cookies retains the existing independent customization matrix. Delivery coverage never switches all customization groups ON. Admin can enable any required subset at category or product level, and checkout renders only the effective groups for that cookie product for both Regular City and Nationwide fulfilment.

### Nationwide Shipments

Show only NYC Cookies Nationwide-Delivery orders. Columns: Order ID, Customer, Destination State/UT, Products, Quantity, Paid Amount, Carrier, Tracking Number, Estimated Delivery, Shipment Status, and Actions. Actions are Book Shipment, Add/Edit Tracking, Mark Dispatched, Update In Transit, Mark Out for Delivery, Mark Delivered, Record Failure, Record Return, and Cancel Shipment. Local riders never see or receive these orders.

Catalogue checkout books the order only after verified full payment. A Custom Cake request may be saved before payment for Admin clarification, feasibility review, and quoting; production actions remain disabled until the quote is approved and full payment is captured.

Pickup orders use `Pickup Scheduled`, `Ready for Pickup`, and `Collected`. Provide an Admin pickup queue and send the customer Order ID, pickup address, map link, and operating hours. Authorized Owner, Admin, Branch Manager, and POS order views may display the Order ID, but the validation field is blank and never prefilled. Staff asks the customer to state the Order ID, enters it, and must receive an exact server match before `Confirm Collection` or `Mark Collected` is enabled.

Initialize pickup status as `Pickup Scheduled` when full-payment booking succeeds. Unpaid requests never become booked orders and never enter pickup or delivery operations.

Display Order IDs as `YY-N` with at least two sequence digits, such as `26-01` and `26-888`, to the customer and authorized store-operation panels. Use this Order ID instead of OTP for Pickup-at-Store and local Doorstep-Delivery. The customer provides it at store collection or local doorstep delivery. The rider screen must never display, prefill, echo, or otherwise expose either the public Order ID or internal OrderID. It provides a blank `Enter Customer-Provided Order ID` field, `Validate`, and a disabled `Mark Delivered` button that unlocks only after an exact server match for the assigned order. Keep `Mark Collected` disabled under the same exact-match rule. Nationwide courier delivery uses shipment tracking instead of local rider validation.

Order ID validation UI states:

- Admin/POS pickup screen: operational order details may show Order ID, but the separate validation input remains blank; provide Validate, privacy-safe success/failure, attempt indicator, and disabled `Mark Collected` until an exact match and completed payment are confirmed.
- Rider doorstep screen: order details excluding every Order ID, Customer Call, blank customer-provided Order ID input, Validate, privacy-safe success/failure, attempt indicator, and disabled `Mark Delivered` until an exact match and completed payment are confirmed.
- Clear the entered value after a failed attempt, rate-limit repeated failures, and never expose the expected Order ID in an error message.
- After successful validation, show `Order confirmed` and enable only the appropriate completion action. Never show the matched or expected Order ID to the rider. Complete validation and the final status update in one server transaction.
- Use the exact customer-facing Order ID only; do not request or accept an OTP, pickup code, phone number, or client-side success value as fulfilment proof.
- At store pickup, permit validation only for an Owner, Admin, or Branch Manager authorized for the order's location. At the doorstep, permit validation only for the rider assigned to that order.

### Offers And Discounts

Allow offers for a parent category, subcategory, or selected products. Add-on offer scope is deferred at launch. Include discount type, value, schedule, usage limit, status, and a server-calculated preview. Do not expose stacking controls: automatically apply only the single best eligible offer and preserve its snapshot with the order.

### Cancellations, Refunds, And Returns

- Cancellation is time-based from confirmed booking payment and independent of `Preparing`. Default UI states are 0-30 minutes: 100% refund; over 30-60 minutes: 50% refund; after 60 minutes: unavailable with Raise Support Ticket. `Out for Delivery` and `Delivered` are never customer-cancellable.
- Refund: payment method, amount, status, retries, gateway reference, and reconciliation.
- Payment and refund detail drawers show an immutable timeline of attempts, gateway events, status transitions, actor/source, amount, retries, failures, timestamps, and correlation ID. Cancellation detail shows actor, policy snapshot, elapsed time, tier, percentage, deduction, and refund linkage.
- Returns: reason, evidence, severity, proposed resolution, customer response, replacement, escalation, and quality metrics.

## Customer Feedback

Do not build product star ratings, numeric scores, rating distributions, review tabs, per-product comment forms, or public customer comments anywhere in the customer application or static website.

### Customer Feedback Prompt

- After an eligible order is Delivered or Collected, schedule the initial in-app and push notification after 24 hours with concise copy such as `How was your GUNUCO order? Share your feedback.` The launch request expires after 168 hours; a single reminder is optional and disabled until configured.
- When the authenticated customer next opens the app, the same request may appear as a dismissible in-app pop-up or banner. It opens the message editor and never contains rating controls.
- The notification opens a message-only feedback screen using a versioned feedback-request ID. It must not open an arbitrary URL.
- Show the public Order ID, completion date, and compact order summary as read-only context.
- Provide one required multiline field labelled `Your feedback`, with a 10-2000 character counter.
- Feedback is text-only. Do not render image or file upload controls.
- Do not show stars, smiley-score scales, thumbs up/down, product selectors, review title, pros/cons, or separate comments per item.
- Provide an unchecked consent checkbox: `You may use this feedback as a public testimonial.` Link to the applicable privacy notice.
- Actions are `Not now` and `Submit feedback`. Preserve the draft locally during transient failures but submit once using an idempotency key.
- On success, show `Thank you for your feedback.` Do not promise publication and do not expose moderation status.
- Allow one message per completed order. Expired, duplicate, non-owned, or incomplete-order requests show a clear unavailable state.

### Admin Feedback Queue

Show a compact moderation table:

```text
Submitted | Order ID | Customer | Message Preview | Testimonial Consent | Status | Moderator | Actions
```

- Filters: date, Pending/Approved/Rejected/Withdrawn, consent Yes/No, fulfilment method, and order category.
- Detail drawer shows the full message, read-only order context, consent state, submission time, and moderation history.
- Actions: Approve for internal use, Reject, Withdraw, and `Create Testimonial` when consent is present.
- Require a moderation note for rejection or withdrawal. Every action is audited.
- Feedback approval does not publish anything and does not alter product ordering, popularity, search relevance, or catalogue scores.

## Testimonials

Admin creates a curated testimonial only from approved feedback with explicit testimonial consent.

The testimonial editor includes:

- Read-only original feedback and customer consent
- Safe display name, defaulting to first name plus last initial where available
- Faithful quote snapshot up to 1000 characters
- Required approved/licensed image upload or media-library selection
- Required image alt text
- Publication channels: Customer App and/or Static Website
- Display order
- Publish now toggle or publication start/end dates
- Preview for mobile app and responsive static website

Do not expose phone, email, address, Order ID, private order images, or internal moderation notes. Publishing requires an approved source, active consent, image, alt text, quote, display name, and at least one channel. Withdrawing source feedback or consent immediately unpublishes the testimonial everywhere.

### App And Static Website Carousel

- Both channels use the same published-testimonials API and render only active records for that channel and publication window.
- Use an image-backed horizontal carousel/slider, not review cards with stars.
- Each slide contains the testimonial image, message quote, and safe display name. Do not show a score, star icon, product rating, review count, or verified-purchase badge.
- Show one slide on small mobile, two where space permits, and three on wide desktop. Use stable aspect ratios so images and text do not shift layout.
- Provide previous/next icon buttons, pagination indicators, touch swipe, keyboard arrow navigation, visible focus states, and screen-reader labels.
- Auto-rotation is optional, pauses on hover/focus/interactions, respects reduced-motion preferences, and never removes manual controls.
- Handle loading, empty, image-failure, offline, and retry states. Hide the entire section when no testimonials are published.
- The carousel is a brand-level Home section in the customer app and static website; do not attach testimonials to individual product pages.

## Guided Customer Support

Use a simple predefined topic menu: Cancel Order, Payment, Pickup, Delivery, Refund, Return, Custom Cake, and Something Else. This is normal application logic with stored rules and text; it uses no LLM, AI service, generated response, or autonomous agent.

Cancellation UI behavior:

- During the full-refund window, show the exact full-refund deadline, countdown, captured refund base, `100% refund`, calculated refund amount, and Cancel Order.
- During the partial-refund window, show the final cancellation deadline, countdown, configured percentage, calculated refund amount, non-refundable amount, and a required confirmation before Cancel Order.
- After the final deadline, disable cancellation and show `Cancellation window ended` with Raise Support Ticket.
- Production status, including `Preparing`, remains visible but does not alter the countdown.
- `Out for Delivery` and `Delivered` disable cancellation regardless of the countdown.
- Guided Support cannot override rules, modify orders, mark payments, or approve refunds.

### Cancellation Policy Settings

Owner and Admin configure policy name, scope (global/location/category), full-refund window in minutes, final partial-refund deadline in minutes, partial-refund percentage, effective dates, and Active status. Defaults are 30 minutes, 60 minutes, and 50 percent. Validate that the final deadline exceeds the full-refund window and percentage is from 0 through 100.

Show a policy preview with example booking time, both deadlines, full/partial refund amounts, and the affected locations/categories. Saving creates a new effective version; it does not rewrite existing order snapshots. Branch Manager sees the effective policy read-only.

From a signed-in order, automatically use the verified Order ID, name, and phone. The customer enters only Message and may add up to three optional photos. Show three fixed image slots with preview/remove controls; accept JPEG, PNG, or WebP up to 5 MB each. On success, show Ticket ID, status, creation time, and `View Ticket`. Email the ticket to `support@gunuco.com` with subject `Ticket {Ticket ID} | Order {Order ID}`.

## Web Admin Support Tickets

Add `Support Tickets` to the shared web Admin sidebar. This workspace and the separate Customer Support Panel read and update the same source-of-truth ticket records in real time.

- Summary cards: Total, New, Open, Pending, Closed, Urgent, Unassigned, and Escalated to Admin.
- Filters: Ticket ID, Order ID, customer name/phone, status, priority, assigned agent, escalation owner, source channel, order location, and date range.
- Columns: Ticket ID, Order ID, Customer, Message Preview, Priority, Status, Assigned Agent, Escalation Owner, Created At, Updated At, and Actions.
- Owner/Admin actions: View, Assign/Reassign/Unassign, Set Priority, Reply, Add Internal Note, Set Open, Set Pending, Escalate/Take Escalation, Close, and Reopen.
- Closing requires a resolution note. Reopening requires a reason. Every action stores the Admin identity and timestamp in immutable history.
- Ticket detail shows the conversation, authorized private attachments, linked order summary/snapshot, email events, assignment, escalation, internal notes, and complete history.
- Branch Manager is limited to tickets for assigned-location orders and may View, Reply, Add Internal Note, Set Open, and Set Pending only.
- Ticket actions cannot silently modify an order, payment, cancellation, refund, production, or delivery record. Open the appropriate authorized Admin screen and retain its reference in ticket history.

## Customer Support Panel

Portal: `https://support.gunuco.com/login`. Keep authentication and navigation separate from the shared Owner/Admin/Branch Manager web panel at `https://admin.gunuco.com/login`.

### Support Dashboard

Summary cards: Total Tickets, New, Open, Pending, and Closed.

Filters: Ticket ID, Order ID, status, priority, assigned agent, channel, and date range.

```text
Ticket ID | Order ID | Subject | Message Preview | Photos | Status | Assigned Agent | Created At | Updated At | Actions
```

Ticket IDs use atomic `YYMM-NN` monthly numbering, for example `2608-01` and `2608-125`.

### Ticket Detail

Show Ticket ID and Order ID first, generated subject, customer message, up to three photos, read-only order summary, conversation, internal notes, assignment, escalation owner, and email state. Actions are Assign to Me, Reassign, Reply, Add Internal Note, Set Open, Set Pending, Escalate to Admin, and Close.

Show inbound/outbound email delivery history, failures, bounces, and received times in the conversation. Mailbox retries must not create duplicate messages.

Admin manages individual freelancer accounts, access expiry, active/suspended state, maximum active users, and concurrent sessions. Never share credentials. Assign each new ticket to the available active agent with the fewest non-closed tickets, using least-recent assignment to break ties. Email replies synchronize into the same dashboard ticket; the dashboard database remains authoritative.

Support Agent access is ticket-focused and read-only for linked order data. It cannot change order, payment, cancellation eligibility, production, fulfilment, refund, user, catalogue, or settings data. Every action is audited.

### Reports

Include parent category, subcategory, product, add-on, flavour, Egg/Eggless, sugar type, flour type, quantity, same-day usage, revenue, refund, return, and delivery-partner reports. Category reports support hierarchy roll-up and drill-down; add-on reports include quantity, gross sales, discounts, and location performance.

### Access

Web-admin role hierarchy is `Owner` -> `Admin` -> `Branch Manager`. Delivery Partner uses a separate panel and is not a web-admin role. Owner manages Admins, Branch Managers, and delivery partners. Admin may manage Branch Managers and delivery partners within authorized operations. Branch Managers require one or more location assignments and explicit POS permission. Branch Manager access checks are server-side and location-scoped; no lower role can create, modify, or remove a higher role.

### Settings

- Production-house profile and pickup address
- Operating hours and timezone
- Service area
- Global, parent-category, subcategory, product, and custom-cake quotas
- Custom-cake minimum lead time (3 days) and maximum scheduling window (30 days)
- Flavour master
- Egg preference master with Egg and Eggless
- Sugar type master
- Flour type master
- Per-cake option price adjustments
- Ingredient Pricing Matrix with availability, effective date, audit details, and customer breakdown preview
- Same-day delivery controls for every Cakes subcategory and product
- Catalogue weight limit: 500g through 3kg
- Custom Cake weights: through 10kg, with larger weights handled by manual quote
- Size/weight master
- Payment and notification settings, including feedback-prompt delay, optional single reminder, and request expiry
- Cashless full payment only; no advance, installment, balance, or pay-later controls
- POS receipt numbering, printing/sharing, supported cashless methods, and payment-terminal settings
- Global POS ON/OFF plus location-level POS ON/OFF; both must be ON for a new assisted order
- Configurable category hierarchy with Cakes active, its seven launch subcategories active, and Coffee, Pizza, and Burgers seeded inactive; do not hard-code allowed names
- Add-on master, required/optional rules, quantity ranges, category/subcategory/product assignments, location availability, and location price overrides
- Branch feature flag, location configuration, location-category availability, and staff-location assignments
- Full-payment verification and payment-failure alerts
- Security controls: Owner MFA status, active sessions, session revocation, password reset, and rate-limit policy status
- Operational health: payment webhook, route provider, notification worker, rider-assignment worker, outbox backlog, and last successful processing time
- Data operations: migration version, backup status, last restore drill, retention policy, and audit export access for Owner

## Delivery Partner Panel

### Bottom Navigation

```text
Orders | Earnings | Profile
```

### Orders

Each assignment shows:

- An opaque assignment reference; never an internal or customer-facing Order ID
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
- Full-payment status
- Assignment accept-by time
- Reject assignment with reason

Only local `Doorstep-Delivery` orders appear in the rider application. `Pickup-at-Store` orders stay in the Admin production/pickup queue, and NYC Cookies `Nationwide-Delivery` orders stay in the Admin nationwide-shipment workspace.

Rider data is loaded only through the assigned-order projection and assignment-scoped endpoints. Exclude `OrderID` and `PublicOrderID` from assignment lists, details, push payloads, deep links, analytics, logs returned to the device, and validation responses. The customer must provide the value verbally or by showing their own confirmation.

Automatic assignments appear immediately in the rider application. Acceptance updates Admin in real time; rejection or timeout returns the order to automatic fallback. Riders cannot update orders they have not accepted.

`Picked Up`, `Out for Delivery`, and `Mark Delivered` require a fully paid order. Riders never collect cash.

### Earnings

Show today's completed orders, today's earnings, weekly earnings, incentives, and payment history.

### Profile

Show delivery-partner details, vehicle, availability toggle, ratings, and support contact. Do not show branch assignment.

## Shared Components

### Product Configuration Summary

```text
Parent Category | Subcategory | Product | Configured Options | Add-Ons | Quantity
```

For cake-module products, expand Configured Options as `Flavour | Egg Preference | Sweetener Type | Flour Type | Size/Weight`. Sweetener values may include sugar, Mishri, Stevia, jaggery, or sugar-free choices. Future category modules render their own configured labels without empty cake fields.

### Role Access Summary

```text
Area                           Owner   Admin   Branch Manager
All global controls            Full          Read-only    Read-only
Branches and admin assignment  Full          No access    No access
Categories and subcategories   Full          Manage       No access
Products, pricing, add-ons      Full          Manage       View/sell assigned location
Orders and production          Full          Manage       Assigned locations only
Support Tickets                Full          All operations Assigned locations limited
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