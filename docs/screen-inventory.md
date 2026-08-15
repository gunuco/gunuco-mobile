# GUNUCO Customer App — Screen Inventory (Final)

> Source of truth for screens: `GUNUCO_PRODUCT_DECISIONS.md` + master navigation guidance.
> Custom-cake screens are **removed**. Rider/Admin screens are **out of scope**.

Primary tabs: **Home | Search | Categories | Cart | Profile**

All API-driven screens require: loading, skeleton (where useful), empty, error, retry, refresh; pagination loading where applicable.

---

## A. System / Bootstrap

| # | Screen | Purpose | Entry | Key components | API | Loading / Empty / Error | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| A1 | Splash / Bootstrap | Session restore, app config, force-update/maintenance gate | Cold start | Brand, GLoader | Auth restore, app config | Splash; maintenance/force-update takeover | Auto | Onboarding / Auth / Tabs / Force Update / Maintenance |
| A2 | Force Update | Block outdated app | Config `forceUpdate` or current < minVersion | ForceUpdateScreen | App version config | Static | Update App (backend store URL) | Store |
| A3 | Maintenance | Temporary outage | Config `maintenanceMode` | MaintenanceScreen | App config | Static | Check again | — |
| A4 | Onboarding (optional) | Value props | First launch | Carousel, GButton | Local | Instant | Skip / Continue | Phone Auth |
| A5 | Notification Permission Prompt | Contextual push opt-in | Order confirmation + Notifications Center (not first launch) | NotificationPermissionCard | Push token register after grant | — | Allow / Not now | System permission / continue |

---

## B. Authentication

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| B1 | Phone Login / Register | Enter phone | Auth stack, checkout gate, logout | GInput, GButton | Request OTP | Pending, rate limit, invalid | Send OTP | OTP |
| B2 | OTP Verification | Verify OTP → login/register | After phone | OTP inputs, Resend | Verify OTP | Invalid/expired OTP | Verify, Resend | Tabs / resume checkout |
| B3 | Session Expired | Re-auth | 401 hard fail | Modal | Logout clear | — | Sign in | Phone Auth |

Guest browsing: no auth required for Home/Search/Categories/Product. Checkout requires auth.

---

## C. Primary Tabs

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| C1 | Home | Aggregated discovery | Tab | Header, SearchBar entry, banners, CategorySection, OfferSection, ProductCarousel, ProductCard, WishlistButton | `GET customer/home` | Section skeletons / empty / retry | Open category, product, offers, notifications | Search, Category, Product, Offers, Notifications |
| C2 | Search | Catalogue search | Tab / Home | SearchBar, filters, sort, ProductCard FlashList | Search API | Skeleton, no results, error | Filter, sort, open product, wishlist | Product Detail |
| C3 | Categories | Main + subcategory browse | Tab | CategoryCard, subcategory list | Categories tree | Empty if none active | Select | Subcategory Products |
| C4 | Cart | Common cart review | Tab | CartItem, QuantitySelector, PriceDisplay, CartSummary, CouponInput, CartChangeBanner, CartSkeleton, EmptyState, ConfirmDialog | `GET cart`, `PATCH/DELETE cart/items/{id}`, `POST cart/apply-coupon`, `DELETE cart/coupon` | Empty, error+retry, refresh, revalidation banners, guest sign-in | Update qty, remove, apply/remove coupon, open product, Proceed to Checkout | Product Detail, Auth, Checkout (`/checkout`) |
| C5 | Profile | Account hub | Tab | ListRow, GImage | `GET customers/me` | Skeleton via pull refresh | Navigate sections | Orders, Addresses, Wishlist, Store Credit, Support, Notifications, Settings, Legal, Edit Profile, Change Phone |

---

## D. Catalogue

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| D1 | Main Category | Show Cakes (and future mains) | Categories / Home | Category hero, subcategory grid | Categories | — | Open subcategory | Subcategory Products |
| D2 | Subcategory Products | Catalogue for Premium / Cakes / Cookies / Wedding / Birthday | Category | ProductCard FlashList, filters | Products by subcategory | Empty, pagination | Open product, add, wishlist | Product Detail, Options |
| D3 | Product Detail | Info, price, rating summary, options, qty, sticky Add to Cart, wishlist | Home / Category / Search / deep link `/product/[id]` | ProductImageGallery, PriceDisplay, RatingView, ProductOptionRenderer, QuantitySelector, WishlistButton, GButton, sticky CTA | `GET products/{id}`, `GET products/{id}/options`, `POST cart/items` | Skeleton, 404/empty, error+retry, unavailable (screen remains, CTA disabled) | Select options, qty, Add to Cart, Wishlist, See reviews | Reviews, Back, Continue shopping, Cart tab, Phone auth if guest adds/wishlists |
| D4 | Product Options / Variants | Composed into D3 (not a separate route). Schema-driven option groups/values; required vs optional; unavailable options visible but not selectable. | Product Detail | ProductOptionRenderer, QuantitySelector, PriceDisplay, sticky CTA | Options payload (groups/values/variants). `POST products/quote` not called — still **[CONFIRM]**. | Options skeleton; options 404 = no options; options error + retry | Select options, Add to Cart | Cart |
| D5 | Offer List | Browse offers | Home / Profile | OfferCard | Offers | Empty | Open offer products | Product / Category |
| D6 | Offer Detail | Offer terms + eligible products | Offer List | OfferCard, ProductCard | Offer detail | — | Shop products | Product |

---

## E. Wishlist & Reviews

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| E1 | Wishlist | Saved products | Profile / heart | ProductCard, WishlistButton, EmptyState | `GET/POST/DELETE wishlist`; add cart uses existing `POST cart/items` or opens Product Detail when options are required/unknown | Empty, error, guest sign-in | Remove, open product, add cart | Product Detail, Cart |
| E2 | Product Reviews List | Approved reviews for a product | Product Detail | ReviewCard, RatingView, FlashList | `GET products/{id}/reviews` | Skeleton, empty, pagination, error+retry | Back | Product Detail |
| E3 | Write Review | Rate + write review for an eligible order item | Future Past Order / post-delivery (`/review/write?orderItemId=`) | RatingView input, GInput, GButton | `POST reviews`; eligibility `GET orders/{id}/reviewable-items` (API ready, Orders UI later) | Validation, pending moderation message, error | Submit | Back. No fake orders. |

---

## F. Addresses

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| F1 | Address Book | Manage saved addresses | Profile / Checkout (`/addresses`, `?select=1` from Checkout) | AddressCard list, ConfirmDialog | `GET/PATCH/DELETE addresses` | Empty, error+retry, guest sign-in | Add, edit, delete (confirm), set default, select for checkout | Address Form, Checkout |
| F2 | Address Form + Map | Create/edit with Google Maps pin | Address Book / Checkout (`/addresses/form`) | AddressForm, MapPicker, GButton | `POST addresses`, `PATCH addresses/{id}` | Validation errors, save failure stays on form | Save pin lat/lng | Address Book / Checkout |

---

## G. Checkout & Payment

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| G1 | Checkout | Fulfilment, address or pickup, ASAP/schedule, coupon, store credit, totals, revalidate, create checkout | Cart CTA (`/checkout`). Auth required. | CartItem (compact), AddressCard, FulfilmentSelector, SlotSelector, CouponInput, StoreCreditCard, CartSummary, CartChangeBanner, ServiceabilityMessage, PickupInfoPanel, CheckoutSkeleton | `GET cart`, addresses, serviceability, slots, pickup-info, store-credit, coupon + store-credit cart mutations, `POST cart/revalidate`, `POST checkout` | Empty cart, auth gate, serviceability/slot/checkout errors, cart-updated banner | Continue to Payment (disabled until valid). Does **not** open Razorpay. | `/payment`, Address Book, Address Form, Cart, Auth |
| G2 | Payment | Order/payment summary, Pay Now, Razorpay hosted UI, backend confirm | Successful `POST /checkout` (`/payment?checkoutId=`) | PaymentSummary, PaymentStatusCard, GButton, ErrorState, EmptyState, GLoader | `POST payments/razorpay/initiate` (if checkout did not return Razorpay order), `POST payments/razorpay/confirm` | IDLE / preparing / Razorpay open / verifying / failed / cancelled / unknown. Amount mismatch returns to Checkout. | Pay Now (double-tap protected). Try Again. Confirm payment (retry verify only). Back to Checkout. | Razorpay UI, Order Confirmation, Checkout |
| G3 | Payment Processing | Not a separate route. Loading copy lives on Payment (`PaymentStatusCard` preparing / opening / verifying). | — | PaymentStatusCard, GLoader | Same as G2. No status poll. | Verifying after Razorpay success | None (wait) | Order Confirmation or unknown/failed on Payment |
| G4 | Order Confirmation | Success only after backend `POST /payments/razorpay/confirm` | Verified payment (`router.replace /order-confirmation`) | OrderConfirmationCard, GButton | Confirm response (in-memory). View Order uses `orderId` only. | Missing confirmation after app kill | View Order (if `orderId`), Continue Shopping → Home | Order Detail, Home |
| G5 | Payment Failed / Cancelled / Unknown | Failure, cancel, and uncertain states on Payment — not separate routes | Razorpay fail/cancel or confirm failure | PaymentStatusCard, ErrorState | Retry initiate (fail/cancel) or retry confirm (unknown). No new checkout. | Failed, cancelled, unknown, checkout expired, amount mismatch | Try Again, Confirm payment, Back to Checkout / Review order | Checkout, Payment retry |

---

## H. Orders

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| H1 | Orders Hub | One screen, Active / Past / Cancelled segments | Profile (`/orders`). Auth required. | GSegmentedControl, OrderCard FlashList, OrderListSkeleton, EmptyState, ErrorState | `GET /orders?statusGroup=&page=` | Empty per tab, error+retry | Open detail, Track if allowed, Reorder if allowed | Order Detail, Tracking, Cart |
| H2 | Order Detail | Backend order fetch by id | Orders, Order Confirmation View Order, future deep link (`/orders/[id]`) | OrderTimeline, OrderItemCard, CartSummary | `GET /orders/{id}`, eligibility, reviewable-items, lazy invoice, rider if call allowed | 403/404 “Order not found”, pull-to-refresh | Track, Chat, Call, Cancel, Reorder, Invoice, Write Review, Complaint — only when backend allows | Tracking, Chat, Cancel, Complaint, Review, Cart |
| H3 | Live Tracking | Map + ETA + rider | Order Detail / Active card when `trackingAvailable` | RiderMap, TrackingStatus, RiderInfo | `GET /orders/{id}/tracking` (15s poll while focused), `GET /orders/{id}/rider` | Unavailable, delivered, cancelled, stale, rider error isolated | Chat, Call | Rider Chat, Order Detail |
| H4 | Rider Chat | Delivery-scoped messages | Tracking / Order Detail when `chatAvailable` | FlashList, RiderChatMessage, RiderChatComposer | GET/POST `orders/{id}/rider-chat/messages` (10s poll while focused) | Unavailable, send failure keeps draft | Send | — |
| H5 | Cancel Order | Predefined reasons + Other + confirm | Order Detail when eligibility.allowed | CancellationReasonSelector, ConfirmDialog | eligibility + `POST /orders/{id}/cancel` | Not allowed | Confirm cancel | Order Detail |
| H6 | Complaint / Return Request | Issue + ≤3 evidence photos | Order Detail when `complaintAllowed` | CancellationReasonSelector, GInput, ImageUploaderSlots | `POST /support/tickets` + attachments | Not allowed, submit success (no ticket hub) | Submit | Order Detail |
| H7 | Reorder result | Not a separate route — Cart after backend reorder | Reorder on Past card or Detail | CartChangeBanner on Cart | `POST /orders/{id}/reorder` then `GET /cart` | Changes / failure stay on Orders | Review cart | Cart |

---

## I. Store Credit & Invoice

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| I1 | Store Credit | Balance + history | Profile `/store-credit` | GCard, history list | `GET store-credit` | Empty history, error+retry | View only (apply remains Checkout) | Checkout |
| I2 | Invoice Viewer / Download | Not a custom PDF renderer. Order Detail opens the backend URL in the system browser. | Order Detail when `invoiceAvailable` | GButton | `GET /orders/{id}/invoice` | Generating / unavailable | Download/view | System browser |

---

## J. Notifications

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| J1 | Notifications Center | Inbox | Home bell / Profile `/notifications` | NotificationItem, NotificationPermissionCard, FlashList, OrderListSkeleton | `GET notifications`, `POST notifications/{id}/read` | Empty, error+retry, pagination, refresh | Open deep link, mark read | Order, Tracking, Ticket, Review |

---

## K. Support

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| K1 | Support Hub / My Tickets | List tickets | Profile `/support` | SupportTicketCard, FlashList | `GET support/tickets` | Empty, error+retry, pagination | Create, open | Create Ticket, Ticket Detail |
| K2 | Create Support Ticket | Message + optional photos + optional order ID | Hub / Order | GInput, ImageUploaderSlots | `POST support/tickets` + attachments | Validation | Submit (idempotent) | Ticket Detail |
| K3 | Ticket Detail | Thread: support ↔ customer | List / notification `/support/[id]` | SupportMessage, SupportComposer, FlashList | `GET support/tickets/{id}`, `POST .../messages` | Skeleton, error, closed (composer hidden) | Reply, View Order | Order Detail |

---

## L. Profile / Settings / Legal

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| L1 | Edit Profile | Name, email (image display only) | Profile `/profile/edit` | GInput, GImage | `GET/PATCH customers/me` | Skeleton, validation | Save | Profile |
| L2 | Change Phone | New phone + OTP | Profile `/profile/change-phone` | Phone + OtpInput | `auth/phone/change/request` + `verify` | Wrong/expired OTP | Verify | Profile |
| L3 | Settings | Theme Light/Dark/System, OS notification permission, about, logout | Profile `/settings` | RadioRow, ListRow, SettingSection | Local SecureStore theme; no server notification prefs | — | Persist theme | Legal Hub |
| L4 | Legal Hub | Links to policies | Profile / Settings `/legal` | ListRow | — | — | Open | Legal Document |
| L5 | Legal Document | Terms / Privacy / Refund / Cancellation | Legal Hub `/legal/[type]` | LegalDocumentView or in-app browser | `GET legal/{type}` | Error+retry | Open URL if provided | — |

---

## Screen Count Summary

| Group | Count |
|---|---|
| System / Bootstrap | 5 |
| Authentication | 3 |
| Primary Tabs | 5 |
| Catalogue | 6 |
| Wishlist & Reviews | 3 |
| Addresses | 2 |
| Checkout & Payment | 5 |
| Orders | 7 |
| Store Credit & Invoice | 2 |
| Notifications | 1 |
| Support | 3 |
| Profile / Settings / Legal | 5 |
| **Total customer screens** | **47** |

Removed vs prior analysis: all Custom Cake screens (Intro/Form/Quote Status).  
Added vs prior analysis: Force Update, Maintenance, Wishlist, Reviews, Live Tracking, Rider Chat, Store Credit, Invoice, Dark Mode settings, richer Orders tabs, Coupon-centric checkout, notification permission prompt.

---

*End of screen inventory.*
