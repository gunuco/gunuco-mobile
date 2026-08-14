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
| A2 | Force Update | Block outdated app | Config flag | GText, GButton | App version config | Static | Update Now | Store |
| A3 | Maintenance | Temporary outage | Config flag | Empty/Error composition | App config | Static | Retry later | — |
| A4 | Onboarding (optional) | Value props | First launch | Carousel, GButton | Local | Instant | Skip / Continue | Phone Auth |
| A5 | Notification Permission Prompt | Contextual push opt-in | After first order or before tracking | Modal, GButton | Push token register | — | Allow / Not now | System settings / continue |

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
| C4 | Cart | Common cart review | Tab | CartItem, QuantitySelector, PriceDisplay, CartSummary, CouponInput, EmptyState | Cart API | Empty, revalidation banners | Update qty, remove, apply coupon, checkout | Product Options, Checkout, Auth |
| C5 | Profile | Account hub | Tab | ListRow, avatar | Customer profile | Skeleton | Navigate sections | Orders, Addresses, Wishlist, Store Credit, Support, Notifications, Settings, Legal, Edit Profile |

---

## D. Catalogue

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| D1 | Main Category | Show Cakes (and future mains) | Categories / Home | Category hero, subcategory grid | Categories | — | Open subcategory | Subcategory Products |
| D2 | Subcategory Products | Catalogue for Premium / Cakes / Cookies / Wedding / Birthday | Category | ProductCard FlashList, filters | Products by subcategory | Empty, pagination | Open product, add, wishlist | Product Detail, Options |
| D3 | Product Detail | Info, price, rating summary, options, qty, sticky Add to Cart, wishlist | Home / Category / Search / deep link `/product/[id]` | ProductImageGallery, PriceDisplay, RatingView, ProductOptionRenderer, QuantitySelector, WishlistButton, GButton, sticky CTA | `GET products/{id}`, `GET products/{id}/options`, `POST cart/items` | Skeleton, 404/empty, error+retry, unavailable (screen remains, CTA disabled) | Select options, qty, Add to Cart, Wishlist, See reviews | Reviews, Back, Continue shopping, View cart tab (placeholder), Phone auth if guest adds/wishlists |
| D4 | Product Options / Variants | Composed into D3 (not a separate route). Schema-driven option groups/values; required vs optional; unavailable options visible but not selectable. | Product Detail | ProductOptionRenderer, QuantitySelector, PriceDisplay, sticky CTA | Options payload (groups/values/variants). `POST products/quote` not called — still **[CONFIRM]**. | Options skeleton; options 404 = no options; options error + retry | Select options, Add to Cart | Cart (later phase) |
| D5 | Offer List | Browse offers | Home / Profile | OfferCard | Offers | Empty | Open offer products | Product / Category |
| D6 | Offer Detail | Offer terms + eligible products | Offer List | OfferCard, ProductCard | Offer detail | — | Shop products | Product |

---

## E. Wishlist & Reviews

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| E1 | Wishlist | Saved products | Profile / heart | ProductCard, WishlistButton, EmptyState | `GET/POST/DELETE wishlist`; add cart uses existing `POST cart/items` or opens Product Detail when options are required/unknown | Empty, error, guest sign-in | Remove, open product, add cart | Product Detail, Cart tab placeholder |
| E2 | Product Reviews List | Approved reviews for a product | Product Detail | ReviewCard, RatingView, FlashList | `GET products/{id}/reviews` | Skeleton, empty, pagination, error+retry | Back | Product Detail |
| E3 | Write Review | Rate + write review for an eligible order item | Future Past Order / post-delivery (`/review/write?orderItemId=`) | RatingView input, GInput, GButton | `POST reviews`; eligibility `GET orders/{id}/reviewable-items` (API ready, Orders UI later) | Validation, pending moderation message, error | Submit | Back. No fake orders. |

---

## F. Addresses

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| F1 | Address Book | Manage saved addresses | Profile / Checkout | AddressCard list | Addresses | Empty | Add, edit, delete, set default | Address Form |
| F2 | Address Form + Map | Create/edit with Google Maps pin | Address Book / Checkout | AddressForm, map, GButton | Address CRUD, geocode | Validation errors | Save | Address Book / Checkout |

---

## G. Checkout & Payment

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| G1 | Checkout | Address, fulfilment, ASAP/schedule, coupon, store credit, totals | Cart (auth required) | AddressCard, FulfilmentSelector, DeliverySlot, CouponInput, StoreCreditCard, CartSummary, tax line | Cart revalidate, slots, serviceability, coupons, store credit | Cart updated banner, calculating | Change options, place order / pay | Payment, Address, Auth |
| G2 | Razorpay Payment | Launch gateway for full payment | Checkout | Razorpay SDK UI | Payment initiate (paise) | Initiating | Pay | Processing |
| G3 | Payment Processing | Wait for backend verification | Gateway return | GLoader | Payment/order status poll | Processing / fail | Retry / support | Order Confirmation / Failed |
| G4 | Order Confirmation | Success after backend confirm | Verified payment | OrderIdHighlight, summary, GButton | Order detail | — | Track, Home | Order Detail, Home |
| G5 | Payment Failed | Failure messaging | Failed verify | ErrorState | Status | — | Retry, Support | Checkout, Support |

---

## H. Orders

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| H1 | Orders Hub | Tabs Active / Past / Cancelled | Profile | Segmented tabs, OrderCard FlashList | Orders list | Empty per tab | Open detail | Order Detail |
| H2 | Order Detail | Full order info + actions | Orders / deep link | OrderTimeline, Cart-like lines, InvoiceButton, StatusChip | Order detail | — | Track, cancel, reorder, invoice, support, review, chat/call when active delivery | Tracking, Cancel, Cart, Support, Review, Rider Chat |
| H3 | Live Tracking | Map + ETA + rider | Order Detail when OFD | RiderMap, RiderInfo, TrackingStatus, RiderChat, RiderCall | Tracking + rider | Location loading | Chat, Call, refresh | Rider Chat |
| H4 | Rider Chat | In-delivery messaging | Tracking / Order Detail | Support-like chat UI adapted for rider | Chat API | Offline | Send message | — |
| H5 | Cancel Order | Reasons + confirm | Order Detail | Radio reasons, Other text, ConfirmDialog | Cancel eligibility + cancel | Not allowed | Confirm | Order Detail |
| H6 | Complaint / Return Request | Issue + ≤3 evidence photos | Order Detail | Reason, GInput, ImageUploaderSlots | Create complaint/return | Window closed | Submit | Order Detail / Ticket |
| H7 | Reorder result / Cart Updated | Show revalidation changes after reorder | Reorder action | Cart change banner | Reorder → cart | Price/availability changes | Review cart | Cart |

---

## I. Store Credit & Invoice

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| I1 | Store Credit | Balance + history | Profile / Checkout entry | StoreCreditCard, history list | Store credit ledger | Empty history | Use at checkout | Checkout |
| I2 | Invoice Viewer / Download | Open/share PDF | Order Detail | InvoiceButton, system share | Invoice URL/PDF | Generating | Download/share | — |

---

## J. Notifications

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| J1 | Notifications Center | Inbox | Home bell / Profile | NotificationItem | Notifications | Empty | Open deep link, mark read | Order, Tracking, Ticket, Review |

---

## K. Support

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| K1 | Support Hub / My Tickets | List tickets | Profile / Order | SupportTicketCard | Tickets list | Empty | Create, open | Create Ticket, Ticket Detail |
| K2 | Create Support Ticket | Message + optional photos | Hub / Order | Composer, ImageUploaderSlots | Create ticket | Validation | Submit | Ticket Detail |
| K3 | Ticket Detail | Thread: support ↔ customer | List / notification | SupportMessage, SupportComposer | Ticket + messages | — | Reply | — |

---

## L. Profile / Settings / Legal

| # | Screen | Purpose | Entry | Components | API | States | Actions | Destinations |
|---|---|---|---|---|---|---|---|---|
| L1 | Edit Profile | Name, email, image | Profile | GInput, GImage picker | Update profile | Validation | Save | Profile |
| L2 | Change Phone | New phone + OTP | Profile | Phone + OTP flow | Request/verify OTP | — | Verify | Profile |
| L3 | Settings | Theme (Light/Dark/System?), notifications prefs, about | Profile | Switch, ListRow | Local + push prefs | — | Toggle dark mode | — |
| L4 | Legal Hub | Links to policies | Profile / Settings | ListRow | CMS/static URLs **[CONFIRM]** | — | Open | Legal Document |
| L5 | Legal Document | Terms / Privacy / Refund / Cancellation | Legal Hub | Scroll GText / WebView | Content URL | Offline | — | — |

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
