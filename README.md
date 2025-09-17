# 7GoldenCowries Frontend

Create React App that powers the 7GoldenCowries experience. The app talks to the backend in `backend/` via same-origin `/api` requests (proxied on Vercel) and ships with an end-to-end TonConnect paywall for the subscription flow.

## Setup

1. Install dependencies: `npm install`.
2. Copy `.env.example` to `.env` and adjust as needed:
   - Leave `REACT_APP_API_URL` blank to rely on the Vercel rewrite. Set it to `http://localhost:4000` when running the backend locally without the CRA proxy.
   - `GENERATE_SOURCEMAP=false` silences noisy warnings in production builds.
   - `REACT_APP_TONCONNECT_MANIFEST_URL` is optional; the default serves `/tonconnect-manifest.json` from the same origin.
   - `REACT_APP_TON_NETWORK` defaults to `mainnet`. Set `REACT_APP_TON_RECEIVE_ADDRESS` if you need to override the TON destination wallet during local testing.
3. Start the development server: `npm start`. The CRA proxy forwards `/api` requests to `http://localhost:4000` so the backend can run alongside the frontend during development.

## TonConnect paywall

- `public/tonconnect-manifest.json` advertises the dApp name and icon. Override it with `REACT_APP_TONCONNECT_MANIFEST_URL` when hosting the manifest elsewhere.
- `PaymentGuard` wraps premium CTAs and consults `/api/v1/payments/status`. If `paid: false`, it renders the `PaywallButton`, which initiates a TonConnect transfer to `REACT_APP_TON_RECEIVE_ADDRESS` (or the fallback placeholder), tags it with `7GC-SUB:<timestamp>`, and then posts to `/api/v1/payments/verify`.
- A successful verification dispatches a single `profile-updated` event so the rest of the app can refresh without triggering `/api/users/me` storms.

## Key API endpoints

- `GET /api/users/me` – session profile (wallet, XP, socials, paid flag).
- `GET /api/v1/payments/status` – current wallet payment state.
- `POST /api/v1/payments/verify` – server-side TON verification; marks the session wallet as paid.
- `GET /api/v1/subscription/status` – subscription tier, level metadata, `canClaim`, and `paid`.
- `POST /api/v1/subscription/claim` – claim the subscription XP bonus (idempotent; requires a verified payment).

## Deployment (Vercel)

- Custom domains: `7goldencowries.com` and `www.7goldencowries.com`.
- Use the repo-root `vercel.json`. It rewrites `/api/*` and `/ref/*` to `https://sevengoldencowries-backend.onrender.com`, and disables caching for API responses.
- Production builds run with a blank `REACT_APP_API_URL`, `GENERATE_SOURCEMAP=false`, `REACT_APP_TONCONNECT_MANIFEST_URL=` (same origin), and `REACT_APP_TON_NETWORK=mainnet`.

## Tests

`npm test -- --watchAll=false`

The suite covers:

1. API base URL normalisation and fetch de-duplication to keep `/api/users/me` requests under control.
2. TonConnect paywall behaviour (success + cancellation) including the verification POST payload and event dispatches.
3. End-to-end backend flow (wallet bind → payment status → verification → subscription status → claim → idempotent re-claim) using supertest.

## Manual QA checklist

1. Connect a TON wallet via the header button. Verify only one `/api/users/me` call fires on focus thanks to the debounced listener.
2. Visit `/subscription` with an unpaid wallet – the `PaywallButton` should render. Complete the TonConnect payment, confirm the “Payment verified 🎉” toast, and ensure `/api/v1/payments/status` flips to `paid: true`.
3. After paying, claim the **Subscription XP Bonus** once to see the `+N XP` toast, and verify the button switches to “Bonus Already Claimed”. A second click should return `0` without additional XP.
4. Link and unlink a social account from `/profile`. You should see a single toast plus confetti, and only one profile refresh.
5. Switch tabs or refocus the page – the profile refresh debounces for 200 ms and rate-limits passive refreshes to ≤1/minute.
6. Run `npm run build` and confirm the output honours `GENERATE_SOURCEMAP=false` with no CORS issues thanks to the same-origin rewrites.
