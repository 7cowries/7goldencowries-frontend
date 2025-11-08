# 7GoldenCowries Frontend

A production-ready Create React App powering the 7GoldenCowries experience. The UI leans into an ocean-inspired glassmorphism theme, celebrates achievements with confetti bursts, and talks to the backend in `backend/` exclusively through same-origin `/api` requests (rewritten by Vercel). Leave `REACT_APP_API_URL` blank in production so those rewrites keep all calls on-origin.

## Getting Started

1. Install dependencies: `npm install`.
2. Copy `.env.example` to `.env` (or `.env.production` for deploy previews) and customise the variables listed below.
   - Leave `REACT_APP_API_URL` blank so CRA talks to the backend through same-origin `/api` rewrites.
   - When developing against a standalone backend, set `REACT_APP_API_URL=http://localhost:4000`.
   - Keep `GENERATE_SOURCEMAP=false` to silence Create React App build-time warnings.
3. Run the development servers:
   - Backend: `node backend/server.js` (Render-style environment variables are supported locally).
   - Frontend: `npm start` (CRA proxy forwards `/api` to `http://localhost:4000`).

### Frontend environment

| Variable | Purpose |
| --- | --- |
| `REACT_APP_API_URL` | Leave blank for same-origin requests (Vercel rewrites `/api/*` and `/ref/*` to the backend). Set to `http://localhost:4000` when bypassing the CRA proxy. |
| `GENERATE_SOURCEMAP` | Disable production source maps with `false` (default) to silence CRA build warnings. |
| `REACT_APP_TONCONNECT_MANIFEST_URL` | TonConnect manifest location (`https://7goldencowries.com/tonconnect-manifest.json` in production). |
| `REACT_APP_TELEGRAM_BOT_NAME` | Telegram bot name used by the embedded login widget. |
| `REACT_APP_TON_NETWORK` | TonConnect target network (`mainnet` by default). |
| `REACT_APP_TON_RECEIVE_ADDRESS` | Optional override for the TonConnect paywall destination wallet when testing locally. |
| `X_TARGET_HANDLE`, `X_TARGET_TWEET_URL`, `X_REQUIRED_HASHTAG` | Targets used by social quests and verification flows. |

`/.env.example` and `.env.production` list the full set for development and production respectively. In production, set these values inside the Vercel project (see `LAUNCH.md`) and keep `REACT_APP_API_URL` blank so the same-origin rewrite handles `/api` and `/ref` calls.

### Backend environment

Backend configuration lives in `backend/.env.example` for local reference; production values belong in the Render service settings.

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `production` in deployed environments. |
| `PORT` | Express listen port (Render exposes `4000`). |
| `FRONTEND_URL` | Public frontend URL for referral redirects. |
| `SQLITE_FILE` | Absolute path to the SQLite database file on Render (`/var/data/7gc.sqlite`). |
| `SESSION_SECRET` | 64–128 character random string used for session signing. |
| `COOKIE_SECURE` | Enable `Secure; SameSite=None` cookies in production (set to `true`). |
| `SUBSCRIPTION_BONUS_XP` | XP granted on the first successful subscription claim. |
| `TON_NETWORK`, `TON_RECEIVE_ADDRESS`, `TON_MIN_PAYMENT_TON`, `TON_VERIFIER`, `TONCENTER_API_KEY` | TON verification + paywall settings. |
| Optional webhooks | `SUBSCRIPTION_WEBHOOK_SECRET`, `TOKEN_SALE_WEBHOOK_SECRET`. |

### Persistence

When `SQLITE_FILE` points to an accessible path (Render mounts `/var/data`) and `better-sqlite3` is available, the backend bootstraps a lightweight `user_state` table (`wallet`, `paid`, `subscriptionTier`, `subscriptionPaidAt`, `subscriptionClaimedAt`, `subscriptionLastDelta`, etc.) and persists wallet sessions, payments, and subscription claims. If the driver is missing the API gracefully falls back to in-memory state, so local development stays zero-dependency.

## TonConnect subscription flow

- `PaymentGuard` wraps premium-only UI and checks `/api/v1/payments/status`.
- When payment is required the `PaywallButton` triggers the TonConnect modal, streams state updates (`pending`, `verifying`, `success`, `error/cancelled`) into the UI, verifies the transaction via `/api/v1/payments/verify`, optionally pings `/api/v1/subscription/subscribe`, dispatches a `profile-updated` event, and surfaces toast notifications.
- Successful claims and referrals fire confetti bursts while respecting the strict rate limits enforced on focus/visibility events.

## API client guarantees

`src/utils/api.js` centralises API access:

- Supports blank `REACT_APP_API_URL` for same-origin calls and rewrites external URLs automatically.
- De-duplicates in-flight requests by method, URL, and body with automatic cleanup on resolve or reject.
- Sends credentials on every request, enforces a 15 s timeout, and retries 502/503/504 responses once.
- Normalises all errors into an `ApiError` (`{ error, code, message, status, details }`) so the UI can reliably surface messages.
- Includes a tiny TTL cache for `/api/users/me` and `/api/quests` to avoid storms while respecting the SLO of ≤1 `/api/users/me` call per focus event with passive refreshes capped at once per minute.

## Testing

Run the full suite with:

```bash
npm test -- --watchAll=false
```

Coverage includes:

1. API utility behaviours (base URL resolution, dedupe, timeout/error normalisation, cache cleanup).
2. TonConnect paywall flow (successful unlock, cancellation, subscribe hand-off, UI events).
3. Supertest integration hitting the backend: wallet bind → payments status (`false`) → payment verify → payments status (`true`) → subscription status → claim → idempotent re-claim, plus mismatch guards.

## Deployment

### Vercel frontend

- Deploy the CRA build, honouring the repo-root `vercel.json`. Rewrites proxy `/api/*` and `/ref/*` to `https://sevengoldencowries-backend.onrender.com` and disable caching for API routes.
- Configure the Vercel Environment Variables with the values from `LAUNCH.md`. Leave `REACT_APP_API_URL` blank so production requests flow through the rewrite.
- Enable apex + `www` domains in Vercel project settings to mirror Render CORS allowances.

### Render backend

- Run `node backend/server.js`.
- Use the Render service Environment Variables (NODE_ENV `production`, PORT `4000`, `FRONTEND_URL=https://7goldencowries.com`, `SUBSCRIPTION_BONUS_XP=120`, `COOKIE_SECURE=true`, generated `SESSION_SECRET`, `SQLITE_FILE=/var/data/7gc.sqlite`, TON settings, and optional webhook secrets).
- CORS is limited to local development origins; production traffic must originate from the Vercel rewrite to avoid cross-origin storms.
- The `/ref/:code` endpoint manages secure cookies and redirects to `FRONTEND_URL`.
- Health checks: `GET /api/health` and `GET /api/health/db`.

## Manual acceptance checklist

1. Connect a TON wallet and verify `/api/users/me` only runs once per focus event (200 ms debounce, passive refresh ≤1/minute).
2. Complete the Telegram quest flow (launch the widget, submit the proof) and confirm the quest rewards update without request storms.
3. Link and unlink a social account (Twitter/X or Discord) and observe a single toast plus one `profile-updated` dispatch.
4. Claim the Subscription XP bonus once to see `+N XP earned`, confirm the button disables, and attempt a second claim (expect `xpDelta=0`).
5. Visit the leaderboard to confirm it loads once and reflects the claimed XP.
6. Run `npm run build` to ensure `GENERATE_SOURCEMAP=false` keeps CRA quiet and assets render with the ocean-glass styling.

> **Product Requirements (Single Source of Truth):** see `docs/7goldencowries_Final_Full_PRD_v1.2.pdf` (tag: `prd-v1.2`).

> **Product Requirements (Single Source of Truth):** see `docs/7goldencowries_Final_Full_PRD_v1.2.pdf` (tag: `prd-v1.2`).
