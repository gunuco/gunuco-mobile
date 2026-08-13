# GUNUCO Customer App — Design System Plan (Final)

> Premium modern commerce UX inspired by BigBasket **patterns**, with distinct GUNUCO identity.
> **Light mode + Dark mode required from the beginning.**
> Do not copy BigBasket branding/assets.

```text
src/design-system/
├── colors.ts          # semantic tokens for light + dark
├── typography.ts
├── spacing.ts
├── dimensions.ts
├── radius.ts
├── shadows.ts
├── animations.ts
├── theme.ts           # ThemeProvider values
└── index.ts
```

Never hard-code repeated visual values in screens.

---

## 1. Brand Direction

| Attribute | Intent |
|---|---|
| Personality | Warm bakery craft + trusted modern commerce |
| Density | Grocery-app information density; fast scan |
| Modes | Light + Dark, same component API |
| Differentiation | GUNUCO Premium badge; product photography; clear Pickup vs Delivery |

Exact logo/colors/fonts arrive as brand assets (**still open** until delivered). Token **names** are fixed now; hex values swap centrally.

Avoid generic AI clichés (purple gradients, cream+terracotta broadsheet clones) unless brand assets explicitly require them.

---

## 2. Colors (Light + Dark)

Define semantic tokens with dual values:

```text
color.bg.canvas
color.bg.surface
color.bg.surfaceMuted
color.bg.inverse
color.text.primary
color.text.secondary
color.text.disabled
color.text.inverse
color.brand.primary
color.brand.primaryPressed
color.brand.secondary
color.accent.offer
color.border.default
color.border.focus
color.semantic.success | warning | danger | info
color.overlay.scrim
color.skeleton.base | highlight
color.badge.premium | discount
color.map.route (tracking)
```

`theme.ts` exposes `lightTheme` / `darkTheme` / optional `system`. Components consume theme only — never `PlatformColor` ad-hoc sprawl.

Status chip colors must remain legible in both modes.

---

## 3. Typography

Purposeful fonts (not Inter/Roboto/system as brand voice) — final files **[CONFIRM brand package]**.

| Role | Tokens |
|---|---|
| Display / brand moments | `text.display` |
| Titles | `text.title.lg/md/sm` |
| Body | `text.body.lg/md/sm` |
| Labels / captions | `text.label`, `text.caption` |
| Prices | `text.price.*` + tabular nums |

English-only launch copy; keep strings externalizable for future i18n.

---

## 4. Spacing / Dimensions / Radius / Shadows

- Spacing: 4-pt scale `0…64` with named aliases
- Touch min ≥ 44
- Icon sizes sm/md/lg
- Product image presets: thumb / card / hero
- Radius: sm→xl + pill (buttons/cards use centralized `radius.lg`)
- Shadows: subtle `sm/md/lg`; dark mode may use lighter borders instead of heavy shadows

---

## 5. Icons

Single set via `GIcon`. Include: home, search, categories, cart, profile, wishlist, offer, premium, pickup, delivery, chat, call, invoice, store credit, moon/sun.

---

## 6. Component Variants & States

Every reusable control supports where relevant:

- default / pressed / disabled / loading / error
- light + dark appearance via tokens
- accessibility labels + hit slop

### Buttons
`primary | secondary | tertiary | danger | ghost`

### Inputs
Label, helper, error; OTP variant; coupon field

### Cards
`ProductCard`, `CategoryCard`, `OrderCard`, `OfferCard`, `AddressCard`, `StoreCreditCard` — domain cards, not dashboard clutter

### Badges
PREMIUM, discount, cart count, status

### Sheets / Modals
Filters, slots, confirms; safe-area + scrim; reduced-motion aware

### Skeletons
Match Product/Order layouts; shimmer tokens for both themes

---

## 7. Tracking UI

- Map occupies meaningful space during Out for Delivery
- Rider info bar + Chat/Call actions with large targets
- ETA typography prominent

---

## 8. Animations

Reanimated, purposeful:

- Add-to-cart / wishlist heart
- Quantity change
- Sheet transitions
- Skeleton shimmer
- Cart badge
- Theme cross-fade (subtle)

Tokens: `duration.instant|fast|normal|slow`, standard easings. Never delay payment/checkout completion.

---

## 9. Layout Patterns

1. Sticky context + search on Home  
2. Category strip + offers + carousels  
3. Dense product grids  
4. Bottom tabs + cart badge  
5. Checkout with live totals (tax line visible)  
6. Order timeline + live map when delivering  

Imagery: real product photography as visual anchor.

---

## 10. Implementation Order

1. Dual-theme tokens  
2. Primitives  
3. Composites  
4. Commerce + tracking + support business components  
5. Theme gallery / story route validation before mass screens  

---

## 11. Phase 1 Implementation Notes (as built)

### Tokens implemented

`src/design-system/` now contains:

- `colors.ts` — light + dark semantic tokens (provisional cocoa/cream GUNUCO palette until brand assets arrive)
- `typography.ts` — display/title/body/label/caption/price variants; platform system + Georgia/serif display until brand fonts
- `spacing.ts`, `dimensions.ts`, `radius.ts`, `shadows.ts`, `animations.ts`, `theme.ts`, `index.ts`

### Theme wiring

- `AppThemeProvider` resolves `settings.themePreference` (`light` | `dark` | `system`) against the OS scheme
- Components consume `useTheme()` — no scattered hard-coded palette values for shared UI

### BottomSheet decision

Phase 1 ships a lightweight `BottomSheet` built on React Native `Modal` (no `@gorhom/bottom-sheet` yet) to avoid an extra native dependency. Upgrade later if gesture-driven sheets are required.

### Gallery

`app/design-system.tsx` (route `/design-system`) is the Phase 1 design-system gallery for validating primitives, composites, and business cards before feature screens. App entry `/` redirects to tabs.

### Web note

RN Web may warn that `shadow*` props are deprecated in favor of `boxShadow`. Native iOS/Android continue to use the tokenized shadow/elevation API; revisit web-specific shadow mapping if web becomes a primary target (customer app is Android + iOS).

---

## 12. Phase 3 Home Composition (as built)

Home reuses the shared design system — **no Home-specific tokens or primitives**.

| Piece | Implementation |
|---|---|
| Sticky context + search | `HomeHeader` (layout) + shared `SearchBar` |
| Banners | `HomeBannerCarousel` + `GImage` |
| Category shortcuts | `CategorySection` → memoized `CategoryCard` |
| Offers | `OfferSection` → `OfferCard` |
| Product rows | `ProductCarousel` → memoized `ProductCard` / `PriceDisplay` / `RatingView` |
| Loading | `HomeSkeleton` + section-level `Skeleton` |
| Empty / error | shared `EmptyState` / `ErrorState` |

Layout pattern matches §9 item 1–2 (sticky context + category strip + offers + carousels). Cart badge on tabs remains a later cart-phase concern.

---

*End of design system plan.*
