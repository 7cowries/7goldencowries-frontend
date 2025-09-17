# Launch Notes

## Frontend (Vercel env vars)

```
REACT_APP_API_URL=
GENERATE_SOURCEMAP=false
REACT_APP_TONCONNECT_MANIFEST_URL=
REACT_APP_TON_NETWORK=mainnet
# optional override when testing locally:
# REACT_APP_TON_RECEIVE_ADDRESS=EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Backend (Render env vars)

```
PORT=4000
FRONTEND_URL=https://7goldencowries.com
SESSION_SECRET=super-secret
SQLITE_FILE=/data/db.sqlite   # or DATABASE_URL
SUBSCRIPTION_BONUS_XP=120
COOKIE_SECURE=true
TON_NETWORK=mainnet
TON_RECEIVE_ADDRESS=EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TON_VERIFIER=toncenter
TON_MIN_AMOUNT_NANO=500000000   # 0.5 TON (adjust as needed)
TONCENTER_API_KEY=your-key
```

## Vercel configuration

- Add the domains `7goldencowries.com` and `www.7goldencowries.com`.
- Ensure the project uses the repo-root `vercel.json`. Rewrites proxy `/api/*` and `/ref/*` to the Render backend and disable caching for API responses.

## Manual smoke

1. Connect a TON wallet and confirm only one `/api/users/me` fires on focus thanks to the debounced listener.
2. Visit `/subscription` with an unpaid wallet. The paywall button should render. Complete a TonConnect payment, see the “Payment verified 🎉” toast, and confirm `/api/v1/payments/status` now returns `paid: true`.
3. Claim the **Subscription XP Bonus** once to receive `+N XP`, then try again to confirm the backend returns `0` and the UI stays disabled.
4. Link a social account from `/profile` and confirm a single toast/confetti burst plus one profile refresh.
5. Run `npm run build` before deploying to verify `GENERATE_SOURCEMAP=false` and no CORS warnings.
