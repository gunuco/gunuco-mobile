# GUNUCO Mobile Application — Master Development Instructions

## 1. Project Objective

Build the GUNUCO customer mobile application from scratch for:

* Android
* iOS

The application must provide a premium, highly responsive e-commerce experience inspired by the interaction patterns, information architecture, usability, and visual quality of leading grocery/e-commerce applications such as BigBasket.

IMPORTANT:

* Do NOT copy BigBasket branding, logo, proprietary assets, exact copyrighted UI, or proprietary content.
* Use BigBasket only as a UX/design benchmark.
* GUNUCO must have its own branding and visual identity.
* The application must follow the requirements and workflows defined in the GUNUCO_PLAN files.

The uploaded GUNUCO_PLAN documentation is the primary business-requirements source of truth.

---

# 2. Frontend Scope

This project is FRONTEND ONLY.

Do NOT implement a backend.

The application will consume APIs provided by an external backend team.

The frontend must therefore be designed as an API-driven application with clean separation between:

* UI
* business presentation logic
* state management
* API communication
* authentication/session handling
* navigation
* design system

Never create fake backend logic that pretends to be production backend functionality.

Mock data may be used temporarily during UI development, but it must be isolated and easily replaceable by real APIs.

---

# 3. Technology Stack

Use:

* React Native
* Expo
* TypeScript
* Expo Router
* Redux Toolkit
* RTK Query
* React Native Reanimated
* React Native Gesture Handler
* FlashList where appropriate for large lists
* Secure OS-backed storage for sensitive authentication/session data
* ESLint
* Prettier
* TypeScript strict mode

Use modern stable versions compatible with each other.

Before installing packages, verify compatibility between Expo, React Native, React, and all native dependencies.

Avoid unnecessary dependencies.

---

# 4. Architecture Principle

The application must be highly maintainable and scalable.

Use a modular architecture.

The most important architectural requirement is:

## COMMON UI / DESIGN SYSTEM

Never duplicate common UI components.

If a component is used in multiple places, create it once and reuse it.

For example:

* Button
* Input
* SearchBar
* Card
* ProductCard
* CategoryCard
* Badge
* Price
* Rating
* QuantitySelector
* Modal
* BottomSheet
* Header
* Section
* Skeleton
* EmptyState
* ErrorState
* Loader
* AddressCard
* CartItem
* OrderCard
* DeliverySlot

must be centralized reusable components.

---

# 5. Centralized Design System

Create:

src/design-system/

with centralized:

* colors
* typography
* spacing
* dimensions
* border radius
* shadows
* icon sizing
* animation durations
* z-index/elevation
* component variants
* theme

Example:

src/design-system/
├── colors.ts
├── typography.ts
├── spacing.ts
├── dimensions.ts
├── radius.ts
├── shadows.ts
├── animations.ts
├── theme.ts
└── index.ts

NEVER hard-code the same design values repeatedly throughout screens.

For example, avoid:

padding: 16

in hundreds of files.

Instead use centralized design tokens.

If the primary button radius changes from 12 to 16, it should be possible to change it centrally and have the change reflected throughout the application.

---

# 6. Reusable UI Architecture

Use three layers.

## Layer 1 — Primitive UI

Examples:

* GText
* GButton
* GInput
* GIcon
* GImage
* GDivider
* GBadge
* GLoader

## Layer 2 — Composite UI

Examples:

* SearchBar
* PriceDisplay
* RatingView
* QuantitySelector
* ProductCard
* CategoryCard
* AddressCard
* CartItem
* OrderCard

## Layer 3 — Business Components

Examples:

* ProductCarousel
* CategorySection
* OfferSection
* RecommendedProducts
* CartSummary
* DeliverySlotSelector
* OrderTimeline
* ProductCustomization

Screens should compose these components instead of implementing everything themselves.

---

# 7. Component Rules

Every reusable component should have:

* TypeScript props
* clear prop types
* sensible defaults
* variants where necessary
* accessibility support
* loading state where appropriate
* disabled state where appropriate
* error state where appropriate
* consistent styling through the design system

Avoid creating almost-identical components such as:

* HomeProductCard
* SearchProductCard
* CategoryProductCard
* OfferProductCard

Prefer one reusable ProductCard with controlled variants.

Example:

<ProductCard
product={product}
variant="default"
showRating
showDiscount
showAddButton
/>

---

# 8. Folder Structure

Use a clean structure similar to:

app/
├── (auth)/
├── (tabs)/
├── product/
├── cart/
├── checkout/
├── orders/
└── profile/

src/
├── components/
│   ├── ui/
│   ├── layout/
│   └── business/
│
├── design-system/
│
├── store/
│   ├── store.ts
│   ├── slices/
│   └── api/
│
├── services/
├── hooks/
├── utils/
├── constants/
├── config/
├── types/
└── features/

assets/
├── images/
├── icons/
└── fonts/

tests/

Keep feature-specific code organized and avoid putting everything into giant files.

---

# 9. API Architecture

Backend APIs are external.

Use RTK Query for API communication.

Create separate API modules such as:

src/store/api/

* authApi.ts
* productApi.ts
* categoryApi.ts
* cartApi.ts
* addressApi.ts
* orderApi.ts
* paymentApi.ts
* deliveryApi.ts
* userApi.ts
* notificationApi.ts

Do not make direct API calls from UI components.

Bad:

component → axios/fetch → API

Preferred:

component → RTK Query hook → API service

---

# 10. API Configuration

Never hard-code production URLs inside components.

Use environment configuration.

Support:

* development
* staging
* production

Example configuration:

EXPO_PUBLIC_API_BASE_URL

The API layer must be the only place responsible for constructing API requests.

---

# 11. Authentication

Authentication is API-driven.

The frontend should support:

* login
* registration
* OTP if provided by backend
* access token
* refresh token
* logout
* session restoration
* expired session handling

Sensitive authentication/session data must use secure OS-backed storage.

Do not use ordinary AsyncStorage for sensitive tokens unless there is a specific non-sensitive use case.

Never log tokens.

Never hard-code secrets.

Never store payment card details.

---

# 12. Security Principles

The mobile application is an untrusted client.

Never assume frontend validation is security.

The backend remains authoritative for:

* prices
* permissions
* inventory
* order status
* payment status
* delivery charges
* quotas
* user roles

Frontend validation is only for UX.

Do not put:

* API secrets
* private keys
* database credentials
* payment secrets
* backend credentials

inside the mobile application.

Do not expose sensitive information in logs.

Handle API errors without exposing internal backend details.

---

# 13. Performance Requirements

The application must feel extremely fast and interactive.

Prioritize:

* RTK Query caching
* request deduplication
* optimistic UI where safe
* pagination
* lazy loading
* virtualized lists
* FlashList for large product/order lists
* memoization where it actually improves performance
* stable callbacks where beneficial
* image caching
* properly sized images
* thumbnails for product lists
* high-resolution images only where necessary
* skeleton loading
* incremental rendering
* minimal unnecessary re-renders
* lightweight animations

Do NOT blindly use memo/useMemo/useCallback everywhere.

Measure and optimize meaningful bottlenecks.

---

# 14. Image Performance

Shopping applications are image-heavy.

Use an image strategy that supports:

* caching
* placeholders
* lazy loading
* appropriate image dimensions
* thumbnails
* error fallback
* loading state

Never load unnecessarily large original images into product grids.

---

# 15. UI/UX Direction

The application should feel like a premium modern commerce application.

Use BigBasket as a UX benchmark for:

* information hierarchy
* search experience
* category navigation
* product discovery
* promotional sections
* product cards
* cart interaction
* checkout flow
* bottom navigation
* delivery experience
* order tracking
* visual density
* interaction patterns

But create a distinct GUNUCO design identity.

Do not copy:

* BigBasket logo
* BigBasket brand colors exactly
* BigBasket images
* BigBasket proprietary assets
* proprietary text/content
* exact screen copies

---

# 16. Customer App Core Navigation

Recommended primary navigation:

Home
Search
Categories
Cart
Profile

Additional flows:

* Product Details
* Product Customization
* Wishlist
* Address Management
* Checkout
* Payment
* Order Success
* Orders
* Order Details
* Order Tracking
* Notifications
* Help/Support

---

# 17. GUNUCO Business Features

Implement the frontend according to GUNUCO_PLAN.

Important areas include:

### Product discovery

* categories
* subcategories
* search
* filtering
* sorting
* product details
* product variants
* recommendations
* offers

### Cake customization

Support the business options defined in GUNUCO_PLAN, such as:

* flavour
* egg/eggless
* sugar type
* flour type
* weight/size
* add-ons
* custom message
* image/photo requirements
* scheduled custom cake orders

Do not invent business rules that conflict with GUNUCO_PLAN.

---

# 18. Fulfilment

Support frontend flows for:

* pickup
* doorstep delivery
* address selection
* delivery distance
* delivery charges returned by API
* delivery slots
* scheduled orders
* store/branch selection if applicable

Backend API values are authoritative.

---

# 19. Cart

Cart should provide:

* add product
* remove product
* update quantity
* product customization summary
* pricing summary
* discount/coupon display
* delivery charge display
* subtotal
* total
* checkout navigation

Use optimistic updates where safe and supported by API behavior.

---

# 20. Orders

Support:

* order confirmation
* order list
* order details
* order status
* order timeline
* pickup status
* delivery status
* cancellation state
* payment state
* refund state
* reorder where supported
* tracking where supported

---

# 21. Loading / Error / Empty States

Every API-driven screen must have deliberate states:

1. Initial loading
2. Skeleton loading
3. Loaded
4. Empty
5. Error
6. Retry
7. Refreshing
8. Pagination loading where applicable

Do not use a full-screen spinner for every API request.

---

# 22. Accessibility

Support:

* accessible labels
* appropriate touch targets
* screen reader-friendly controls
* sufficient contrast
* dynamic text where practical
* semantic roles
* keyboard behavior where relevant

---

# 23. Animations

Use subtle, purposeful animations.

Examples:

* Add-to-cart feedback
* Quantity changes
* Bottom sheet transitions
* Navigation transitions
* Product image transitions
* Skeleton transitions
* Button feedback
* Cart badge changes

Animations must never make the application feel slow.

---

# 24. Code Quality Rules

Use:

* TypeScript strict mode
* ESLint
* Prettier
* small focused components
* meaningful naming
* reusable utilities
* reusable hooks
* no duplicated business logic
* no duplicated styles
* no unnecessary dependencies

Avoid:

* giant components
* giant style files
* hard-coded API URLs
* hard-coded secrets
* duplicated UI
* duplicated API logic
* unnecessary global state
* unnecessary re-renders
* `any` unless absolutely unavoidable

---

# 25. State Management Rules

Use local component state for local UI concerns.

Use Redux only for genuinely shared application state.

Use RTK Query for server/API state.

Do NOT copy API responses unnecessarily into Redux slices.

Preferred separation:

UI state → component state

Server state → RTK Query

Global client state → Redux Toolkit

Sensitive session state → secure storage + controlled auth state

---

# 26. Design System Rule — CRITICAL

Before implementing many screens, build and validate the common UI library.

At minimum create:

* Button
* Text
* Input
* SearchBar
* Card
* ProductCard
* CategoryCard
* Badge
* Price
* Rating
* QuantitySelector
* Image
* Modal
* BottomSheet
* Header
* Section
* Skeleton
* EmptyState
* ErrorState
* Loader
* AddressCard
* CartItem
* OrderCard

All screens must consume these components.

Do not create screen-specific replacements without a strong reason.

---

# 27. Documentation

Maintain:

docs/
├── architecture.md
├── design-system.md
├── api-integration.md
├── navigation.md
├── performance.md
└── security.md

Whenever architecture changes significantly, update the relevant documentation.

---

# 28. Development Process

DO NOT build the entire application in one giant implementation.

Work in phases.

Phase 1:
Project foundation + architecture + design system

Phase 2:
Navigation + authentication

Phase 3:
Home + discovery

Phase 4:
Categories + search

Phase 5:
Product details + customization

Phase 6:
Cart

Phase 7:
Checkout + payment integration UI

Phase 8:
Orders + tracking

Phase 9:
Profile + addresses + notifications

Phase 10:
Performance optimization

Phase 11:
Testing + production hardening

After every phase:

* run TypeScript checks
* run lint
* fix errors
* verify navigation
* verify reusable components
* avoid regressions
* keep code production-ready

---

# 29. Cursor Agent Behavior

Before coding a feature:

1. Read the relevant GUNUCO_PLAN documentation.
2. Inspect the existing project structure.
3. Reuse existing components.
4. Reuse the design system.
5. Reuse existing API abstractions.
6. Do not create duplicate components.
7. Do not introduce a new library unless necessary.
8. Explain architectural impact before making major changes.
9. Keep changes modular.
10. Validate the implementation after changes.

When a requirement is ambiguous, inspect GUNUCO_PLAN first instead of inventing business behavior.

---

# 30. Final Quality Goal

The final application should feel:

* fast
* polished
* responsive
* premium
* consistent
* scalable
* secure from the frontend perspective
* easy to maintain
* strongly componentized
* API-driven
* production-ready

The most important principle is:

ONE DESIGN SYSTEM → REUSABLE COMPONENTS → CONSISTENT UI EVERYWHERE.

If a common component changes, the change should propagate to every screen using that component.
