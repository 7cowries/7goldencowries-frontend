# Launch Notes

## Environment

```
# Leave blank to rely on the Vercel -> Render rewrite
REACT_APP_API_URL=
GENERATE_SOURCEMAP=false
```

Backend (Render):

```
PORT=4000
FRONTEND_URL=https://7goldencowries.com
SUBSCRIPTION_BONUS_XP=120
COOKIE_SECURE=true
```

## Vercel

Add the domains:
- 7goldencowries.com
- www.7goldencowries.com

## Manual Test Steps

1. Set wallet to `UQTestWallet123` in the header input.
2. Claim "Join our Telegram" → XP +40, then re-claim → Already claimed.
3. Refresh page → XP persists and Profile widget progress reflects backend.
