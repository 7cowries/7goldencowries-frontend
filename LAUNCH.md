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

> Configure these in Vercel project settings. Leave `REACT_APP_API_URL` blank in production so the same-origin rewrite handles `/api` and `/ref` calls while `GENERATE_SOURCEMAP=false` keeps CRA builds quiet.

## Backend (Render env vars)

```
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://7goldencowries.com
SQLITE_FILE=/var/data/7gc.sqlite
SESSION_SECRET=<64-128 char random string>
COOKIE_SECURE=true
SUBSCRIPTION_BONUS_XP=120
TON_NETWORK=mainnet
TON_RECEIVE_ADDRESS=<TON wallet>
TON_MIN_PAYMENT_TON=0.5
TON_VERIFIER=toncenter
TONCENTER_API_KEY=<toncenter api key>
SUBSCRIPTION_WEBHOOK_SECRET=<optional>
TOKEN_SALE_WEBHOOK_SECRET=<optional>
```

> Configure these in Render environment settings; cookies stay `SameSite=None; Secure` when `COOKIE_SECURE=true`. If `SQLITE_FILE` points to an existing path and `better-sqlite3` is present, the lightweight `user_state` table migrates automatically on boot.

## Vercel configuration

- Domains: `7goldencowries.com` and `www.7goldencowries.com`.
- Use the repo-root `vercel.json`. It rewrites `/api/*` and `/ref/*` to the Render backend and sets `Cache-Control: no-store` for API routes.

## Manual smoke

1. Connect a TON wallet and confirm `/api/users/me` fires once on focus (200 ms debounce, ≤1 passive refresh/minute).
2. Launch the Telegram quest from `/quests`, complete the login/proof flow, and verify the quest reward updates without duplicate API calls.
3. Link a social account (Twitter/X or Discord) then disconnect it; observe a single toast and one `profile-updated` dispatch each time.
4. Visit `/subscription` and claim the **Subscription XP Bonus** once to see `+N XP earned`, then try a second claim and expect `xpDelta=0`.
5. Open the leaderboard to confirm it refreshes once and reflects the newly granted XP.
6. Run `npm run build` to validate `GENERATE_SOURCEMAP=false` suppresses CRA source-map warnings.
