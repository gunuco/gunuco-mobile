# GUNUCO Customer App — Environment Variables

> Phase 12 inventory. **Never put real secrets in this file.**
> Source of runtime values: `src/config/env.ts`.
> Templates: `.env.development`, `.env.staging`, `.env.production` (committed placeholders).
> Local overrides: `.env` and `.env*.local` (gitignored).

---

## Variables

| Variable | Purpose | Required | Example placeholder | Production source |
|---|---|---|---|---|
| `EXPO_PUBLIC_APP_ENV` | Selects `development` / `staging` / `production`. If omitted: `__DEV__` → development, else production. | Recommended | `production` | EAS / CI env for the production profile |
| `EXPO_PUBLIC_API_BASE_URL` | Backend API origin used by the single `baseApi` client. Trailing slash stripped. | Yes for real backends | `https://api.example.com` | EAS / CI env. Must be HTTPS in production. |
| `EXPO_PUBLIC_ENABLE_LOGGING` | Reserved flag (`true` to enable). No debug logger is wired in production. | No | `false` | Leave `false` in production |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Public Maps SDK key for `react-native-maps` (address pin + tracking map). Injected in `app.config.js` plugins. | Yes for maps | *(empty in templates)* | Maps console restricted key (Android package + iOS bundle). Not a backend secret. |
| `EXPO_PUBLIC_RAZORPAY_KEY_ID` | Razorpay **public** key id passed to the hosted checkout SDK. | Yes for payment | *(empty in templates)* | Razorpay dashboard publishable key. **Never** the key secret. |

---

## Last-resort API URL fallback (`src/config/env.ts`)

If `EXPO_PUBLIC_API_BASE_URL` is missing:

| `EXPO_PUBLIC_APP_ENV` / inferred env | Fallback host |
|---|---|
| `production` | `https://api.gunuco.com` |
| `staging` | `https://api.staging.gunuco.com` |
| `development` | `https://api.dev.gunuco.local` |

Production and staging **do not** fall back to a `.local` host (Phase 12 fix).

Production builds should still set `EXPO_PUBLIC_API_BASE_URL` explicitly. The production fallback matches the committed `.env.production` template only.

---

## EAS profile mapping

`eas.json` sets non-secret `EXPO_PUBLIC_*` values per profile. Razorpay public key and Maps key stay empty in git and must be supplied in EAS Environment (or gitignored `.env*.local`). They are client-visible; never put Razorpay secret there.

| EAS profile | `EXPO_PUBLIC_APP_ENV` | `EXPO_PUBLIC_API_BASE_URL` | Logging |
|---|---|---|---|
| `development` | `development` | `https://api.dev.gunuco.local` | `true` |
| `preview` | `staging` | `https://api.staging.gunuco.com` | `true` |
| `production` | `production` | `https://api.gunuco.com` | `false` |

A physical device cannot resolve `api.dev.gunuco.local`. Override `EXPO_PUBLIC_API_BASE_URL` in EAS for the development profile to a reachable HTTPS API before device testing.

---

## Not used / not present

| Item | Notes |
|---|---|
| Razorpay key secret / webhook secret | Must never appear in the app |
| JWT signing secrets | Backend only |
| Database URLs | Backend only |
| Firebase Admin / service account JSON | Not in this repo |
| `POST /cart/merge` and other unconfirmed APIs | Not called; no extra env |

---

## Network

Production API must be `https://`. Android cleartext is not broadly enabled. HTTP in a production URL should be treated as a release blocker.

---

*End of environment variables.*
