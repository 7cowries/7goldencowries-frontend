# Deploy Notes

## Required Environment Variables
- `FRONTEND_URL` – allowed origin for CORS and referral redirects.
- `DATABASE_URL` or `SQLITE_FILE` – path/connection string for SQLite database.
- `SESSION_SECRET` – session signing secret.
- Social (optional): `TWITTER_CLIENT_ID`, `TELEGRAM_BOT_TOKEN`, `DISCORD_CLIENT_ID`, etc.

## One-time Database Checks
```sh
# verify quests table exists
sqlite3 $SQLITE_FILE "SELECT id, title FROM quests LIMIT 5;"
# verify users table with referral column
sqlite3 $SQLITE_FILE "PRAGMA table_info(users);"
```

## Testing Referrals Locally
1. Start backend and frontend with the environment above.
2. Create two wallets, e.g. `walletA` (inviter) and `walletB` (invitee).
3. Visit `http://localhost:3000/ref/<inviter_code>` in a fresh browser session.
4. Connect wallet `walletB`, complete a quest with proof, then claim.
5. Check that `walletA`'s XP increases with the referral bonus.
