# Deploy Notes

## Required Environment Variables
- `NODE_ENV=production`
- `PORT=4000`
- `FRONTEND_URL=https://7goldencowries.com`
- `SQLITE_FILE=/var/data/7gc.sqlite`
- `SESSION_SECRET=<64-128 char random string>`
- `COOKIE_SECURE=true`
- `SUBSCRIPTION_BONUS_XP=120`
- `TON_NETWORK=mainnet`
- `TON_RECEIVE_ADDRESS=<TON wallet>`
- `TON_MIN_PAYMENT_TON=0.5`
- `TON_VERIFIER=toncenter`
- `TONCENTER_API_KEY=<toncenter api key>`
- Optional webhooks: `SUBSCRIPTION_WEBHOOK_SECRET`, `TOKEN_SALE_WEBHOOK_SECRET`
- Optional social auth: `TWITTER_CLIENT_ID`, `TELEGRAM_BOT_TOKEN`, `DISCORD_CLIENT_ID`, etc.

## One-time Database Checks
```sh
# verify quests table exists
sqlite3 $SQLITE_FILE "SELECT id, title FROM quests LIMIT 5;"
# verify users table with subscription columns
sqlite3 $SQLITE_FILE "PRAGMA table_info(users);"
```

## Testing Referrals Locally
1. Start backend and frontend with the environment above.
2. Create two wallets, e.g. `walletA` (inviter) and `walletB` (invitee).
3. Visit `http://localhost:3000/ref/<inviter_code>` in a fresh browser session.
4. Connect wallet `walletB`, complete a quest with proof, then claim.
5. Check that `walletA`'s XP increases with the referral bonus.
