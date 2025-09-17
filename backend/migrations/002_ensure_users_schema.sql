-- Ensure users table exists with the required columns
CREATE TABLE IF NOT EXISTS users (
  wallet TEXT PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  tier TEXT DEFAULT 'Free',
  subscriptionTier TEXT DEFAULT 'Free',
  paid INTEGER DEFAULT 0,
  subscriptionPaidAt TEXT,
  subscriptionClaimedAt TEXT,
  subscriptionSubscribedAt TEXT,
  subscriptionLastDelta INTEGER DEFAULT 0,
  levelName TEXT DEFAULT 'Shellborn',
  levelSymbol TEXT DEFAULT '🐚',
  levelProgress REAL DEFAULT 0,
  nextXP INTEGER DEFAULT 10000,
  socials TEXT,
  referral_code TEXT,
  referred_by TEXT,
  updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
  createdAt TEXT DEFAULT (CURRENT_TIMESTAMP)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS levelName TEXT DEFAULT 'Shellborn';
ALTER TABLE users ADD COLUMN IF NOT EXISTS levelSymbol TEXT DEFAULT '🐚';
ALTER TABLE users ADD COLUMN IF NOT EXISTS levelProgress REAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nextXP INTEGER DEFAULT 10000;
ALTER TABLE users ADD COLUMN IF NOT EXISTS socials TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP);
ALTER TABLE users ADD COLUMN IF NOT EXISTS createdAt TEXT DEFAULT (CURRENT_TIMESTAMP);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscriptionTier TEXT DEFAULT 'Free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS paid INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscriptionPaidAt TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscriptionClaimedAt TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscriptionSubscribedAt TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscriptionLastDelta INTEGER DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code
  ON users(referral_code)
  WHERE referral_code IS NOT NULL AND referral_code <> '';

-- Ensure completed_quests table exists and has a unique wallet/quest pair
CREATE TABLE IF NOT EXISTS completed_quests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet TEXT NOT NULL,
  quest_id INTEGER NOT NULL,
  completed_at TEXT DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE (wallet, quest_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_completed_quests_wallet_quest
  ON completed_quests(wallet, quest_id);
