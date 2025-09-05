# 7GoldenCowries Frontend

Minimal React app for the 7GoldenCowries launch.

## Configuration

Set the backend URL before starting the app:

```
REACT_APP_API_URL=https://sevengoldencowries-backend.onrender.com
```

## Vercel

Deploy on Vercel with custom domains:
- 7goldencowries.com
- www.7goldencowries.com

## Manual Test Steps

1. Set wallet to `UQTestWallet123` in the header input.
2. Go to Quests and claim "Join our Telegram" → XP +40; re-claim → "Already claimed".
3. Refresh page → XP persists and Profile widget progress reflects backend.

## Scripts

- `npm start` – run development server
- `npm test` – run tests
- `npm run build` – production build

See [LAUNCH.md](LAUNCH.md) for deployment notes and manual test steps.
