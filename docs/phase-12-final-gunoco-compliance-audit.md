# GUNUCO Phase 12 — Final Product Compliance Audit

> Authority: `CURSOR_MASTER_INSTRUCTIONS.md` → `GUNUCO_PRODUCT_DECISIONS.md` → `docs/`.
> `GUNUCO_Customer_App_Final_Product_Decisions.md` is **not in this repository**.
> Phase 11 implementation is the baseline. Phase 12 is hardening only.
> Status: **PASS** | **PARTIAL** | **FAIL** | **CONFIRM** | **NOT TESTED**.

Date: 15 Aug 2026.

---

## How to read Status

- **PASS** — implemented in code as decided (not a device test).
- **PARTIAL** — implemented with a documented gap.
- **FAIL** — contradicts a GUNUCO decision or a confirmed defect (none remaining after Phase 12 401 cache fix).
- **CONFIRM** — backend/OpenAPI or product contract still unconfirmed.
- **NOT TESTED** — requires device, native module, or live backend.

---

## 1. Product / catalogue decisions

| Decision | Expected | Actual | Status | File/Evidence | Open Dependency |
|---|---|---|---|---|---|
| Customer-only Expo app Android+iOS | No Rider/Admin modules | Customer routes only | PASS | `app/` | Native store builds NOT TESTED |
| Cakes launch; Coffee/Pizza/Burgers later | Generic catalogue | Category tree from API; no hard-coded food types | PASS | `categoryApi`, ProductOptionRenderer | Inactive mains hidden unless API active |
| Wedding / Birthday cakes | Normal catalogue products | Same PDP/cart | PASS | `app/product/[id]` | |
| Cookies | Normal catalogue options | Same | PASS | | |
| No Custom Cake | No quote/request UI | No custom-cake screens | PASS | Screen inventory | |
| No Referral / Invite | Not required | Not implemented | PASS | | |
| English only | No i18n switcher | English strings | PASS | | Q45 FINAL |
| BigBasket inspiration only | No copied brand | GUNUCO naming/tokens | PASS | design-system | Q46 brand assets STILL OPEN |

## 2. Authentication / session

| Decision | Expected | Actual | Status | File/Evidence | Open Dependency |
|---|---|---|---|---|---|
| Phone + OTP, no password | Phone → OTP | Implemented | PASS | `authApi` | |
| Guest browse, no guest checkout | Auth before checkout | Cart/checkout gated | PASS | `app/(tabs)/cart.tsx`, checkout | Guest cart merge CONFIRM |
| Stay logged in until logout | SecureStore + restore | Implemented | PASS | `session.ts` | Device restore NOT TESTED |
| Change phone with OTP | In-memory challenge | Implemented | PASS | `phoneChangeChallenge.ts` | OTP length CONFIRM |
| Tokens not in URL/logs | SecureStore only | Implemented | PASS | `secureStorage.ts` | |
| Logout isolation | Reset customer cache | Logout + 401 both reset | PASS | `clearSession`, `dropInvalidSession` | Device A→B NOT TESTED |
| Auth intent | Clear after use; no stale fire | consume after OTP; Phase 12 clears on Profile/expired sign-in | PASS | `authIntent.ts` | |

## 3. Commerce

| Decision | Expected | Actual | Status | File/Evidence | Open Dependency |
|---|---|---|---|---|---|
| Server cart | GET/POST/PATCH/DELETE cart | Implemented | PASS | `cartApi` | |
| No local guest cart | Sign-in instead | Implemented | PASS | | `POST /cart/merge` CONFIRM |
| Backend prices/tax/discount | Integer paise; formatPaise | CartSummary formats only | PASS | `CartSummary`, `money.ts` | |
| Common cart | All catalogue products | One cart | PASS | | |
| Wishlist required | Server wishlist | Implemented | PASS | `wishlistApi`, `WishlistButton` | |
| Reviews purchased/eligible only | orderItemId + backend eligibility | Implemented | PASS | `reviewApi`, `/review/write` | |
| Address book | CRUD + default + map pin | Implemented | PASS | `addressApi`, MapPicker | Maps key empty in templates |
| Fulfilment ASAP + slots | Backend slots | Implemented | PASS | `fulfilmentApi` | Slot query extras CONFIRM |
| No production-house picker | Backend assigns | Pickup info display only | PASS | | |
| Coupons + stacking | Backend | Implemented | PASS | cart coupon endpoints | |
| Store credit | Ledger + checkout apply | Implemented | PASS | `storeCreditApi`, cart apply | `{ max: true }` CONFIRM |
| Checkout revalidate | Inform before pay | Implemented | PASS | Checkout | |
| Razorpay UPI/card/netbanking | Hosted SDK; backend confirm | Implemented | PARTIAL | `paymentApi`, razorpayCheckout | Public key empty; native NOT TESTED; New Architecture warning |
| Full payment at checkout | No advance/balance | No plan UI | PASS | | |
| Order confirmation after verify | Not Razorpay callback alone | Implemented | PASS | `order-confirmation` | |
| Orders Active/Past/Cancelled | Three groups | Implemented | PASS | `/orders` | |
| Cancel eligibility backend | No frontend refund math | Implemented | PASS | cancel screen | Reason codes CONFIRM |
| Reorder with revalidation | Current cart, not old price | Implemented | PASS | reorder mutation | |
| Invoice from detail | Backend URL | HTTPS browser | PASS | `openInvoiceUrl` | Invoice fields CONFIRM |
| Live tracking when allowed | Backend coords; no fake GPS | Poll while focused | PASS | tracking screen | Realtime CONFIRM |
| Rider chat/call | Backend gated; separate from support | Implemented | PASS | chatApi, RiderInfo | Call token CONFIRM |
| Complaint evidence max 3 JPG/PNG/WEBP | Shared uploader | Implemented | PASS | ImageUploaderSlots | Q34 refund policy STILL OPEN; eligibility CONFIRM |

## 4. Notifications / support / profile / legal / lifecycle

| Decision | Expected | Actual | Status | File/Evidence | Open Dependency |
|---|---|---|---|---|---|
| FCM Android + APNs iOS | Native device token | `getDevicePushTokenAsync` | PARTIAL | `pushNotifications.ts` | Device NOT TESTED; token delete CONFIRM |
| Contextual permission | Not first launch | Order confirmation + inbox | PASS | NotificationPermissionCard | |
| Inbox + deep links | IDs only | Implemented | PASS | notifications utils | Payload enum CONFIRM; read-all CONFIRM |
| Support tickets + replies | Customer-owned | Implemented | PASS | supportApi | Pagination/FormData field CONFIRM |
| Profile lightweight | No duplicate Home/Orders | Hub rows | PASS | `profile.tsx` | Image upload CONFIRM |
| Dark mode Light/Dark/System | Persist | SecureStore | PASS | settings | Q46 tokens STILL OPEN |
| Legal Terms/Privacy/Refund/Cancellation | All four | Hub + `[type]` | PASS | legalApi | URL vs markdown CONFIRM |
| Maintenance + force update | Config; fail-open | Implemented + foreground recheck | PASS | `appConfig.ts`, `_layout.tsx` | storeUrls shape CONFIRM |
| Numeric semver | 1.9 < 1.10 | `compareSemver` | PASS | `semver.ts` | Device gate NOT TESTED |

## 5. Architecture compliance

| Decision | Expected | Actual | Status | File/Evidence | Open Dependency |
|---|---|---|---|---|---|
| Expo Router + RTK Query | No second store/client | One baseApi | PASS | `src/store` | |
| Design system tokens | No random dual palettes | Screens use theme | PASS | `src/design-system` | Literal hex only in tokens/splash |
| Shared components | ProductCard, WishlistButton, etc. | Single implementations | PASS | component-inventory | |
| Feature freeze Phase 12 | No new product features | Hardening only | PASS | This phase | |
| Config fail-open | Do not switch to fail-closed | Preserved | PASS | `checkRemoteAppConfig` | |

## 6. Security compliance

| Decision | Expected | Actual | Status | File/Evidence | Open Dependency |
|---|---|---|---|---|---|
| No frontend secrets | No Razorpay secret / JWT / private keys | None found | PASS | Secret scan | Rotate if any ever committed |
| No OTP/token logs | No console logging | None in TS | PASS | | |
| No sensitive push payload display | IDs only | parsePushData | PASS | | Payload CONFIRM |
| No rider private dump | Display-safe fields | RiderInfo | PASS | | |
| HTTPS production API | Env URL | Template https://api.gunuco.com | PASS | env.ts | Must be set in EAS |
| Store URL validation | Safe schemes | Phase 12 | PASS | `urls.ts` | |

## 7. Area roll-up (section 158)

| Area | Status | Notes |
|---|---|---|
| Authentication | PASS | Device NOT TESTED |
| Home | PASS | |
| Catalogue | PASS | |
| Search | PASS | |
| Product Details | PASS | Quote API CONFIRM unused |
| Product Options | PASS | |
| Wishlist | PASS | |
| Reviews | PASS | |
| Cart | PASS | |
| Checkout | PASS | Field names CONFIRM |
| Fulfilment | PASS | |
| Payment | PARTIAL | Code complete; native/key NOT TESTED |
| Order Confirmation | PASS | |
| Orders | PASS | |
| Cancellation | PASS | |
| Reorder | PASS | |
| Invoice | PASS | HTTPS gate Phase 12 |
| Tracking | PASS | |
| Rider Chat | PASS | |
| Rider Call | PASS | tel: when allowed |
| Notifications | PARTIAL | Code complete; FCM/APNs NOT TESTED |
| Support | PASS | |
| Profile | PASS | Image upload CONFIRM |
| Addresses | PASS | |
| Store Credit | PASS | |
| Settings | PASS | |
| Theme | PASS | |
| Legal | PASS | |
| Maintenance | PASS | |
| Force Update | PASS | Store URL validation Phase 12 |

## 8. Business rules (section 159)

| Rule | Status |
|---|---|
| No Custom Cake | PASS |
| Wedding/Birthday/Cookies normal products | PASS |
| No Referral | PASS |
| English only | PASS |
| Customer-only app | PASS |
| No Rider/Admin modules | PASS |
| Backend-authoritative financials | PASS |
| Backend-authoritative cancellation | PASS |
| Backend-authoritative order state | PASS |
| Backend-authoritative tracking | PASS |
| Backend-authoritative review eligibility | PASS |
| Backend-authoritative support ownership | PASS |

## 9. Common UI (section 161)

| Component | Used by | Theme | A11y | Centralized | Duplicate |
|---|---|---|---|---|---|
| ProductCard | Home, Search, Category, Wishlist | Yes | Labels | Yes | No |
| WishlistButton | Card, PDP, Wishlist | Yes | Add/remove label | Yes | No |
| CartItem | Cart, Checkout | Yes | Yes | Yes | No |
| OrderCard | Orders | Yes | Status text not color-only | Yes | No |
| GButton / GInput / GText / GImage / GIcon / GCard | App-wide | Yes | Roles on buttons | Yes | No |
| PriceDisplay | Cards, PDP, summaries | Yes | Formatted INR | Yes | No |
| RatingView | PDP, reviews, write | Yes | Yes | Yes | No |
| Header | Most stacks | Yes | Back | Yes | No |
| EmptyState / ErrorState / Skeleton | Lists/details | Yes | Retry | Yes | No |
| FlashList | Large lists | n/a | n/a | Yes | Not on short ScrollViews |

Screen-reader / contrast on device: **NOT TESTED**.

## 10. Still CONFIRM / STILL OPEN

See `docs/open-questions.md` and section 19–20 of the Phase 12 final report.

---

*End of Phase 12 GUNUCO compliance audit.*
