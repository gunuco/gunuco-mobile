# GUNUCO Customer App — Phase 12 QA Matrix

> Device columns are **NOT TESTED** in this environment (Windows workstation; no Android emulator run, no iOS toolchain).
> Code-review expected behaviour is recorded. Do not treat Expected as Actual.
> Status: PASS | PARTIAL | FAIL | CONFIRM | NOT TESTED.

---

## Device feature matrix

| Feature | Scenario | Android | iOS | Network | Expected | Actual | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Authentication | New / returning / wrong OTP / expired OTP / resend / restore | NOT TESTED | NOT TESTED | Normal | Phone OTP; challenge in memory; session restore via refresh | — | NOT TESTED | |
| Authentication | Token refresh + 401 | NOT TESTED | NOT TESTED | 401 | Mutex refresh, retry once, then sign-out + cache reset | — | NOT TESTED | Phase 12 code fix for cache reset |
| Authentication | Logout A then B | NOT TESTED | NOT TESTED | Normal | B never sees A wishlist/cart/orders/tickets | — | NOT TESTED | |
| Home | Load / empty / error / retry | NOT TESTED | NOT TESTED | Normal / offline | Skeleton, retry, guest OK | — | NOT TESTED | |
| Search | Debounce, empty, error, clear | NOT TESTED | NOT TESTED | Normal | 350ms, min 2 chars | — | NOT TESTED | |
| Catalogue | Category → products, filters, sort | NOT TESTED | NOT TESTED | Normal | Backend filters; no custom-cake UI | — | NOT TESTED | |
| Product | Options, add cart, wishlist, reviews | NOT TESTED | NOT TESTED | Normal | Required options; IDs not shown | — | NOT TESTED | |
| Wishlist | Guest → auth; fail keeps previous | NOT TESTED | NOT TESTED | Normal / fail | Shared WishlistButton; no local guest list | — | NOT TESTED | |
| Cart | Qty, remove, coupon, empty | NOT TESTED | NOT TESTED | Normal | Backend totals; previous qty until 2xx | — | NOT TESTED | |
| Checkout | Invalid cart blocked; revalidate | NOT TESTED | NOT TESTED | Normal | Pay not started if invalid | — | NOT TESTED | |
| Payment | Success / fail / cancel / timeout / double tap | NOT TESTED | NOT TESTED | Interrupt | Confirm API authoritative; Pay disabled while busy | — | NOT TESTED | Native module, not Expo Go |
| Orders | Active / Past / Cancelled / detail actions | NOT TESTED | NOT TESTED | Normal | Backend gated Cancel/Track/Chat/etc. | — | NOT TESTED | |
| Tracking | Poll stop on leave / delivered | NOT TESTED | NOT TESTED | Normal | No customer GPS; no fake ETA | — | NOT TESTED | |
| Rider Chat | Send fail keeps draft; poll stops | NOT TESTED | NOT TESTED | Normal | Separate from Support | — | NOT TESTED | |
| Notifications | Inbox, deep link, permission | NOT TESTED | NOT TESTED | Normal | Contextual permission; unknown stays inbox | — | NOT TESTED | |
| Support | List / create / reply / closed | NOT TESTED | NOT TESTED | Normal | Other customer ticket → not found | — | NOT TESTED | |
| Profile | Edit draft on fail; phone change OTP | NOT TESTED | NOT TESTED | Fail | Challenge not in URL | — | NOT TESTED | |
| Settings | Theme persist Light/Dark/System | NOT TESTED | NOT TESTED | n/a | SecureStore | — | NOT TESTED | |
| Legal | Four documents; HTTPS browser | NOT TESTED | NOT TESTED | Normal | No tokens on URL | — | NOT TESTED | |
| Maintenance | Blocks commerce; retry; themed | NOT TESTED | NOT TESTED | Config | Fail-open if config fetch fails | — | NOT TESTED | |
| Force Update | Semver + store URL | NOT TESTED | NOT TESTED | Config | Numeric compare; safe schemes only | — | NOT TESTED | |

---

## Network matrix (conceptual)

| Scenario | Expected | Actual | Status |
|---|---|---|---|
| Normal | Screens load via RTK Query | — | NOT TESTED |
| Slow | Buttons show loading; no duplicate submit | — | NOT TESTED |
| Offline | Cached data if any; retry; no fake mutation success | — | NOT TESTED |
| Reconnect | Refetch on focus/retry | — | NOT TESTED |
| Timeout | `TIMEOUT_ERROR` copy after 30s | — | NOT TESTED |
| 401 | Refresh then retry or sign-out | — | NOT TESTED |
| 403 | Generic not-found copy | — | NOT TESTED |
| 404 | Not found + retry where list/detail | — | NOT TESTED |
| 409 | Safe conflict copy | — | NOT TESTED |
| 422 | Check details copy | — | NOT TESTED |
| 429 | Too many attempts | — | NOT TESTED |
| 500 / 503 | Server trouble copy | — | NOT TESTED |

---

## Payment matrix

| Scenario | Expected | Actual | Status |
|---|---|---|---|
| Success | Confirm 2xx → Order Confirmation | — | NOT TESTED |
| Failure | Stay on Payment; Try Again | — | NOT TESTED |
| User cancel | Cancelled state; no duplicate checkout | — | NOT TESTED |
| Network interrupt during verify | UNKNOWN; retry confirm only | — | NOT TESTED |
| Duplicate Pay tap | Disabled while busy | — | NOT TESTED |
| Backend verify fail | Not treated as success | — | NOT TESTED |
| Initiate fail | Error; no Razorpay | — | NOT TESTED |
| Amount mismatch | Return to Checkout | — | NOT TESTED |

Do not fake production payment success.

---

## Order matrix

| Scenario | Expected | Actual | Status |
|---|---|---|---|
| Active / Past / Cancelled tabs | Separate fetches | — | NOT TESTED |
| Cancel eligible / not | Backend eligibility | — | NOT TESTED |
| Reorder | Current cart after revalidate | — | NOT TESTED |
| Invoice | HTTPS browser | — | NOT TESTED |
| Tracking / rider / chat / complaint / review | Backend flags | — | NOT TESTED |

---

## Auth matrix

| Scenario | Expected | Actual | Status |
|---|---|---|---|
| New customer | OTP verify creates session | — | NOT TESTED |
| Returning | Same | — | NOT TESTED |
| Wrong / expired OTP | Mapped errors | — | NOT TESTED |
| Resend | Request OTP again | — | NOT TESTED |
| Session restore | Refresh + me | — | NOT TESTED |
| Token refresh | Mutex | — | NOT TESTED |
| Logout | Full clear | — | NOT TESTED |
| A → B | Isolated cache | — | NOT TESTED |

---

## Accessibility / dark mode / keyboard

Code uses shared `GButton`/`GInput` labels, `EmptyState`/`ErrorState`, theme tokens, and safe-area padding on audited screens. **Android/iOS accessibility and keyboard: NOT TESTED.**

---

*End of QA matrix.*
