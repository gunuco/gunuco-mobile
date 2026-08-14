# GUNUCO Customer App — Component Inventory (Final)

> Centralized reusable UI per `CURSOR_MASTER_INSTRUCTIONS.md`.
> One component per concept; variants instead of duplicates.
> Supports Light + Dark themes via design-system tokens.

---

## 1. Primitive UI

| Component | Purpose |
|---|---|
| `GText` | Themed typography variants |
| `GButton` | Primary/secondary/tertiary/danger/ghost; loading/disabled |
| `GInput` | Text, phone, multiline; error/helper |
| `GIcon` | Sized icon wrapper |
| `GImage` | Cached image, placeholder, fallback |
| `GDivider` | Separators |
| `GBadge` | Counts, PREMIUM, discount, status |
| `GLoader` | Inline/overlay loader |
| `GCheckbox` / `GRadio` / `GSwitch` | Form + settings (incl. dark mode) |
| `GChip` | Filters / option chips |
| `GSegmentedControl` | Tabs (orders later), fulfilment, ASAP/Schedule — **implemented** |
| `GPressable` | Accessible press feedback |
| `GSkeleton` | Base skeleton |
| `GSpacer` | Token spacing |

---

## 2. Composite UI

| Component | Purpose |
|---|---|
| `SearchBar` | Query + clear |
| `PriceDisplay` | INR from paise; strike/discount |
| `PriceBreakdown` | Subtotal, discount, tax, delivery, total |
| `RatingView` | Display + interactive star input |
| `QuantitySelector` | Min/max qty |
| `Header` | Title, back, actions |
| `Section` | Home section chrome |
| `Modal` / `BottomSheet` | Dialogs and sheets |
| `EmptyState` / `ErrorState` | List/detail states |
| `StatusChip` | Order/payment/delivery statuses |
| `ConfirmDialog` | Destructive/financial confirms |
| `ImageUploaderSlots` | Max 3 JPG/PNG/WEBP slots |
| `ListRow` | Profile/settings rows |
| `OfflineBanner` | Connectivity / store closed messaging |
| `OtpInput` | OTP digit group |
| `CouponInput` | Code field + Apply / applied + Remove |
| `ThemeAwareScreen` | Optional safe wrapper consuming theme |

---

## 3. Business / Commerce Components

| Component | Purpose | Used on |
|---|---|---|
| `ProductCard` | Grid/list/compact; price, badges, add, wishlist | Home, Search, Category, Offers, Wishlist |
| `CategoryCard` | Main/subcategory | Home, Categories |
| `ProductCarousel` | Horizontal products | Home |
| `CategorySection` | Section + cards | Home |
| `OfferCard` / `OfferSection` | Promos | Home, Offers |
| `ProductOptionRenderer` | **Schema-driven** option groups/values (single/multi); required vs optional; unavailable visible but not selectable | Product Details |
| `ProductImageGallery` | Swipeable `GImage` gallery, count, dots, preview modal | Product Details |
| `AddOnSelector` | Not a separate component — add-ons from the options payload render through `ProductOptionRenderer` | Options |
| `WishlistButton` | Heart add/remove; guest → phone auth | ProductCard, Product Details, Wishlist |
| `ReviewCard` | Approved review display (rating, text, date, safe name) | Product Reviews |
| `CartItem` | Line item + options summary + qty + remove; `compact` review mode on Checkout | Cart, Checkout |
| `CartSummary` | Backend totals: subtotal, discount, store credit, tax, delivery if returned, total | Cart, Checkout |
| `CartChangeBanner` | Price/availability/option change notice from cart payload | Cart, Checkout |
| `CouponInput` | Code + Apply; applied code + Remove | Cart, Checkout |
| `AddressCard` | Saved address; select/edit/delete/default | Address book, Checkout |
| `AddressForm` | Full address fields + default toggle | Address Form |
| `MapPicker` | Google Maps pin UI (`react-native-maps`) | Address Form |
| `FulfilmentSelector` | Pickup vs Delivery | Checkout |
| `SlotSelector` | ASAP + backend dates/slots | Checkout |
| `PickupInfoPanel` | Assigned pickup details (no production-house picker) | Checkout |
| `ServiceabilityMessage` | Deliverable / not + backend fee | Checkout |
| `StoreCreditCard` | Available balance + apply/remove | Checkout |
| `OrderCard` | Active/Past/Cancelled lists | Orders |
| `OrderTimeline` | Status timeline | Order Detail |
| `InvoiceButton` | Download invoice PDF | Order Detail |
| `ReviewCard` | Review display | Product reviews |
| `CancellationReasonList` | Predefined + Other | Cancel |
| `ProductConfigurationSummary` | Category/sub/product/options/qty | Cart, Order, Support |

---

## 4. Tracking Components

| Component | Purpose |
|---|---|
| `RiderInfo` | Rider name/photo/vehicle summary |
| `RiderMap` | Live map + rider marker |
| `TrackingStatus` | Status + ETA |
| `RiderChat` | Chat thread UI (delivery-scoped) |
| `RiderCall` | Call action (tel / masked number per API) |

Visible only when backend status allows (typically Out for Delivery).

---

## 5. Support Components

| Component | Purpose |
|---|---|
| `SupportTicketCard` | Ticket list row |
| `SupportMessage` | Message bubble |
| `SupportComposer` | Reply input + optional attachments |

---

## 6. Screen-Specific (keep local until reused)

| Component | Screen |
|---|---|
| `HomeBannerCarousel` | Home |
| `ProductDetailSkeleton` | Product Details |
| `CartSkeleton` | Cart |
| `CheckoutSkeleton` | Checkout |
| `OnboardingSlide` | Onboarding |
| `ForceUpdateView` | Force Update |
| `MaintenanceView` | Maintenance |
| `NotificationPermissionCard` | Contextual prompt |
| `PaymentProcessingView` | Payment Processing |
| `OrderSuccessActions` | Confirmation |
| `LegalDocumentView` | Legal |

Promote when a second screen needs the same UI.

---

## 7. Anti-Duplication Watchlist

Must remain single implementations with variants:

1. `ProductCard` (all merchandising surfaces)
2. `ProductOptionRenderer` (all category modules)
3. `PriceDisplay` / `CartSummary`
4. `WishlistButton`
5. `OrderCard` / `OrderTimeline`
6. `AddressCard`
7. `FulfilmentSelector` + `SlotSelector`
8. `CouponInput`
9. `RiderMap` / chat primitives (do not fork for support unless necessary — share message list primitive)
10. Theme tokens for all colors/spacing — no hard-coded dual palettes in screens

---

## 8. Removed Components (prior analysis)

Do **not** implement:

- Custom cake form / quote status panels
- Advance/Balance payment plan selector
- Custom cake reference image uploader (as a custom-cake feature)

Reusable `ImageUploaderSlots` remains for support/complaint evidence only.

---

*End of component inventory.*
