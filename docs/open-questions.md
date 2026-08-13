# GUNUCO Customer App — Open Questions (Post Product Decisions)

> Authority: `GUNUCO_PRODUCT_DECISIONS.md` overrides prior open items where answered.
> Status legend: **FINAL** | **NOT APPLICABLE** | **STILL OPEN**

---

## Q1–Q56 Resolution Table

| ID | Topic | Status | Decision / Remaining gap |
|---|---|---|---|
| Q1 | Customer identity | **FINAL** | Dedicated `Customers` entity; referenced by cart, orders, addresses, wishlist, reviews, store credit, notifications, tickets |
| Q2 | Auth method | **FINAL** | Phone + OTP; no password initially |
| Q3 | Guest browse/checkout | **FINAL** | Guest browsing YES; guest checkout NO; auth before checkout |
| Q4 | Change phone | **FINAL** | Allowed with OTP on new number |
| Q5 | Session | **FINAL** | Access + refresh; stay logged in until logout; multi-device OK |
| Q6 | Cart storage | **FINAL** | Server-persisted cart for logged-in customers |
| Q7 | Cart product types | **FINAL** | One common cart for all catalogue products; no custom-cake cart |
| Q8 | Multi-item checkout | **FINAL** | YES; backend validates joint fulfilment |
| Q9 | Price/availability changes | **FINAL** | Backend revalidates at checkout; inform customer before pay |
| Q10 | Address book | **FINAL** | YES — customer address table/API |
| Q11 | Address fields | **FINAL** | Full field set incl. type, lat/lng, default (see decisions doc) |
| Q12 | Map provider | **FINAL** | Google Maps |
| Q13 | Default address | **FINAL** | Multiple addresses; default preselected at checkout |
| Q14 | Search filters/sort | **FINAL** | Subcategory, price, relevant options; Popular / Price↑↓ / Newest |
| Q15 | Home API | **FINAL** | Aggregated `GET customer/home` |
| Q16 | Featured products | **FINAL** | Admin-controlled |
| Q17 | Cookies | **FINAL** | Cakes subcategory; normal catalogue options (not cake-specific custom fields) |
| Q18 | Coupon codes | **FINAL** | YES + automatic offers |
| Q19 | Offer stacking | **FINAL** | Backend-controlled |
| Q20 | Offer scopes | **FINAL** | Order / product / subcategory at launch |
| Q21 | Wishlist | **FINAL** | REQUIRED |
| Q22 | Ratings & reviews | **FINAL** | REQUIRED; purchased/eligible only; admin moderation |
| Q23 | Slots UX | **FINAL** | ASAP + Schedule; slots from backend |
| Q24 | Same-day cutoff copy | **FINAL** | Recommended message provided; cutoff from backend |
| Q25 | Live rider tracking | **FINAL** | REQUIRED when out for delivery |
| Q26 | Production house | **FINAL** | Backend assigns; customer does not select |
| Q27 | Payment gateway | **FINAL** | Razorpay |
| Q28 | Payment methods | **FINAL** | UPI, Cards, Net Banking at launch |
| Q29 | Store Credit | **FINAL** | REQUIRED; ledger on backend |
| Q30 | Payment deadline / advance | **FINAL** | Full payment at checkout; no advance/balance for catalogue |
| Q31 | Amount serialization | **FINAL** | Integer paise |
| Q32 | Reorder | **FINAL** | REQUIRED with revalidation |
| Q33 | Order list | **FINAL** | Active / Past / Cancelled |
| Q34 | Return/refund window | **STILL OPEN** | Must define actual food/cake complaint/refund policy with business/CA; do not assume 24h schema default |
| Q35 | Evidence photos | **FINAL** | Max 3; JPG/PNG/WEBP; size limit backend |
| Q36 | Support replies | **FINAL** | Customer can reply in ticket thread |
| Q37 | Cancellation reasons | **FINAL** | Predefined + Other; eligibility by backend/status |
| Q38 | Custom cake reference image | **NOT APPLICABLE** | No custom-cake feature |
| Q39 | Custom cake clarification | **NOT APPLICABLE** | No custom-cake feature |
| Q40 | Edit pending custom cake | **NOT APPLICABLE** | No custom-cake feature |
| Q41 | Edit after quote approval | **NOT APPLICABLE** | No custom-cake feature |
| Q42 | Push provider | **FINAL** | FCM Android + APNs iOS + Expo-compatible |
| Q43 | Channel matrix | **FINAL** | OTP=SMS; order events mostly Push |
| Q44 | Permission timing | **FINAL** | Contextual, not first launch |
| Q45 | Languages | **FINAL** | English only; keep strings externalizable |
| Q46 | Brand assets | **STILL OPEN** | Final logo, colors, typography, fonts, icons, imagery, component styling guidelines must be delivered |
| Q47 | Legal screens | **FINAL** | Terms, Privacy, Refund, Cancellation required |
| Q48 | Dark mode | **FINAL** | REQUIRED; both themes in design system |
| Q49 | Force update / maintenance | **FINAL** | Backend app config required |
| Q50 | Tax display | **FINAL** (display) / **STILL OPEN** (rates) | Show tax as separate line; **actual tax treatment/rates** need business/CA confirmation |
| Q51 | Invoice PDF | **FINAL** | REQUIRED from Order Details |
| Q52 | Error codes | **FINAL** (approach) / **STILL OPEN** (full catalogue) | Code→message mapping approach agreed; complete canonical message catalogue to be finalized jointly |
| Q53 | Correlation ID | **FINAL** | Not shown to customers |
| Q54 | App scope | **FINAL** | Customer-only Expo app; Android + iOS |
| Q55 | Rider chat/call | **FINAL** | REQUIRED during active delivery per backend rules |
| Q56 | Referral/invite | **FINAL** | NOT REQUIRED |

---

## Still Open — Detail

### Q34 — Refund / complaint policy
Business must define when customers can raise quality/wrong/missing/damaged complaints and what refund/replacement/store-credit outcomes apply. Backend will enforce; app shows eligibility UI once API exists.

### Q46 — Brand assets
Design system token **names** are ready; final hex values, fonts, and logo packages are pending from brand/design.

### Q50 — Tax rates / treatment
UI will show a tax line from API totals. Exact GST/rules are a business/CA decision for backend — frontend must not hard-code rates.

### Q52 — Full error message catalogue
Example codes exist in decisions doc; product/backend/mobile should agree final copy for each code before production hardening.

### Ancillary confirmations (implementation contracts, not product ambiguity)

These are not unresolved product questions, but need OpenAPI confirmation during Phase 2+:

- Guest local cart → server cart **merge** algorithm after OTP login  
- Wishlist behavior for guests (local vs force login on heart)  
- Razorpay Expo SDK package choice compatible with Expo version  
- Rider chat transport (polling vs WebSocket)  
- Legal content delivery (CMS URL vs in-API markdown)  
- Theme default: Light vs follow system  

---

## Removed Guidance from Prior Doc

- Do **not** feature-flag Wishlist/Ratings as optional — they are **required**.  
- Do **not** keep custom-cake open questions as active work.  
- Do **not** plan advance/balance payment UI.

---

## Counts

| Status | Count |
|---|---|
| FINAL | 49 |
| NOT APPLICABLE | 4 (Q38–Q41) |
| STILL OPEN (product/business) | 3 primary: Q34, Q46, Q50(+partial Q52) |

Requirements are sufficient to start **Phase 1** (foundation + design system). Remaining opens do not block token architecture, navigation shell, or reusable UI scaffolding; they block only policy copy, final brand hex/fonts, and tax rate display content from backend.

---

*End of open questions.*
