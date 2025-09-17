# Launch Notes

## Frontend (Vercel env vars)

```
REACT_APP_API_URL=
GENERATE_SOURCEMAP=false
REACT_APP_TONCONNECT_MANIFEST_URL=https://7goldencowries.com/tonconnect-manifest.json
REACT_APP_TELEGRAM_BOT_NAME=GOLDENCOWRIEBOT
REACT_APP_TON_NETWORK=mainnet
X_TARGET_HANDLE=7goldencowries
X_TARGET_TWEET_URL=https://x.com/7goldencowries/status/123456789
X_REQUIRED_HASHTAG=#7GC
# optional override when testing locally:
# REACT_APP_TON_RECEIVE_ADDRESS=EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> Configure these in Vercel project settings. Leave `REACT_APP_API_URL` blank in production so the same-origin rewrite handles `/api`.

## Backend (Render env vars)

```
PORT=4000
FRONTEND_URL=https://7goldencowries.com
SUBSCRIPTION_BONUS_XP=120
COOKIE_SECURE=true
SESSION_SECRET=<64-128 char random string>
SQLITE_FILE=/data/7gc.sqlite
# optional integrations
# TON_RECEIVE_ADDRESS=EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# TON_MIN_AMOUNT_NANO=500000000
# DISCORD_CLIENT_ID=...
# DISCORD_CLIENT_SECRET=...
# TELEGRAM_BOT_TOKEN=...
```

> Configure these in Render environment settings; cookies stay `SameSite=None; Secure` when `COOKIE_SECURE=true`.

## Vercel configuration

- Domains: `7goldencowries.com` and `www.7goldencowries.com`.
- Use the repo-root `vercel.json`. It rewrites `/api/*` and `/ref/*` to the Render backend and sets `Cache-Control: no-store` for API routes.

## Manual smoke

1. Connect a TON wallet and verify only one `/api/users/me` request fires per focus event (200 ms debounce, passive refresh ≤1/minute).
2. Open `/subscription` without a subscription. The paywall button should show pending → verifying → success/error states. Complete a TonConnect payment, observe the “Payment verified 🎉” toast, and confirm `/api/v1/payments/status` flips to `paid: true`.
3. Claim the **Subscription XP Bonus** once to see a single `+N XP` toast and confetti, ensure the button disables based on `status.canClaim`, then attempt a second claim and confirm the backend returns `xpDelta=0`.
4. Link/unlink a social account from `/profile`. Each action should emit one toast, one confetti burst, and a single `profile-updated` event.
5. Run `npm run build` to confirm `GENERATE_SOURCEMAP=false` and check the glassmorphism/ocean theme renders correctly.
