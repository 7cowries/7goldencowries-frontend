# 7GoldenCowries Frontend

Minimal React app for the 7GoldenCowries launch.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env`. Leave `REACT_APP_API_URL` blank to use the same origin `/api` routes through the provided Vercel rewrite, or set it to `http://localhost:4000` when running the backend separately.
3. Ensure `GENERATE_SOURCEMAP=false` is present in `.env` for production builds to silence node_modules source-map warnings during deployment.
4. Start the development server: `npm start`

The CRA proxy is set to `http://localhost:4000` so local requests automatically forward to the backend during development. To target a remote backend from the browser (e.g. Render), set `REACT_APP_API_URL` to the absolute URL instead.

TonConnect manifest is served from the same origin at `/tonconnect-manifest.json`. `www` permanently (308) redirects to the apex domain.

## API

The frontend talks to the backend REST API. Key endpoints:

- `GET /api/users/me` – session profile (wallet, XP, socials)
- `GET /api/v1/subscription/status` – subscription tier/level metadata
- `POST /api/v1/subscription/claim` – claim the subscription XP bonus (idempotent)
- `POST /api/quests/:id/claim` – claim quest XP; returns the normalized response payload

## Vercel

Deploy on Vercel with custom domains:
- 7goldencowries.com
- www.7goldencowries.com

The default `vercel.json` rewrites `/api/*` and `/auth/*` to the Render backend so the frontend can run with a blank `REACT_APP_API_URL`.

## Manual Test Steps

1. Set wallet to `UQTestWallet123` in the header input.
2. Claim "Join our Telegram" → XP +40; re-claim → "Already claimed".
3. Connect a social (Twitter/Discord/Telegram) and confirm the profile toast fires once, the confetti animation appears, and `/api/users/me` only fires a single request per focus event.
4. Visit /subscription. Confirm tier data loads, then trigger **Claim Subscription XP Bonus**. The toast should show the `+N XP` delta, `/api/v1/subscription/claim` should return `xpDelta`, and the profile updates once via the `profile-updated` event.
5. Visit /leaderboard. Verify:
   - Top 3 show as large cards with progress bars.
   - Your wallet row is highlighted when `localStorage.wallet` is set.
   - Progress bars reflect server `levelProgress`.
   - List re-sorts/refreshes within 60s and when wallet changes.

## How to test

- `npm start` – run development server
- `npm test` – run unit, integration, and API smoke tests (includes subscription flow coverage via supertest)
- `npm run build` – production build (honors `GENERATE_SOURCEMAP=false`)

### Automated smoke checks

`npm test` now exercises:

1. API base URL handling and fetch de-duplication logic (prevents `/api/users/me` storms on focus).
2. End-to-end subscription flow via supertest (wallet bind → status fetch → claim bonus → idempotent re-claim with consistent XP).

These checks complement the manual steps above and catch regressions in the profile refresh and subscription reward flows.
See [LAUNCH.md](LAUNCH.md) for deployment notes and extended manual scenarios.
