# 7GoldenCowries Frontend

Minimal React app for the 7GoldenCowries launch.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `REACT_APP_API_URL`.
3. Start development server: `npm start`

TonConnect manifest is served from the same origin at `/tonconnect-manifest.json`. `www` permanently (308) redirects to the apex domain.

## API

The frontend talks to the backend REST API:

- `GET /api/users/:wallet` – fetch profile (`xp`, `levelName`, `progress`)
- `POST /api/quests/:id/claim` – claim quest; returns `{ alreadyClaimed: boolean }`
- `GET /api/meta/progression` – XP progression metadata

## Vercel

Deploy on Vercel with custom domains:
- 7goldencowries.com
- www.7goldencowries.com

## Manual Test Steps

1. Set wallet to `UQTestWallet123` in the header input.
2. Go to Quests and claim "Join our Telegram" → XP +40; re-claim → "Already claimed".
3. Refresh page → XP persists and Profile widget progress reflects backend.
4. Visit /leaderboard. Verify:
   - Top 3 show as large cards with progress bars.
   - Your wallet row is highlighted when localStorage.wallet is set.
   - Progress bars reflect server levelProgress.
   - List re-sorts/refreshes within 60s and when wallet changes.

## Scripts

- `npm start` – run development server
- `npm test` – run tests
- `npm run build` – production build

See [LAUNCH.md](LAUNCH.md) for deployment notes and manual test steps.
