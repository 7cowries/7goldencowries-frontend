const fs = require('fs');
const path = require('path');

let db = null;
let statements = null;
let ready = false;
let warned = false;

function loadDatabase() {
  if (ready || db || statements !== null) {
    return;
  }

  const file = (process.env.SQLITE_FILE || '').trim();
  if (!file) {
    statements = false;
    return;
  }

  let Database;
  try {
    // `better-sqlite3` is optional – skip persistence if it's not installed.
    Database = require('better-sqlite3');
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') {
      if (!warned) {
        warned = true;
        console.warn('[storage] better-sqlite3 not installed; skipping SQLite persistence');
      }
      statements = false;
      return;
    }
    throw err;
  }

  const directory = path.dirname(file);
  if (directory && directory !== '.' && !fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  db = new Database(file);
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_state (
      wallet TEXT PRIMARY KEY,
      profile_json TEXT,
      paid INTEGER DEFAULT 0,
      subscriptionTier TEXT,
      subscriptionStatus TEXT,
      subscriptionActive INTEGER DEFAULT 0,
      lastPaymentAt INTEGER,
      subscriptionPaidAt INTEGER,
      subscriptionClaimedAt INTEGER,
      subscriptionLastDelta INTEGER,
      xp INTEGER DEFAULT 0,
      totalXP INTEGER DEFAULT 0,
      updatedAt INTEGER DEFAULT (strftime('%s','now') * 1000),
      createdAt INTEGER DEFAULT (strftime('%s','now') * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_user_state_paid
      ON user_state(paid);
  `);

  statements = {
    getUser: db.prepare(`
      SELECT wallet, profile_json, paid, subscriptionTier, subscriptionStatus,
             subscriptionActive, lastPaymentAt, subscriptionPaidAt, subscriptionClaimedAt,
             subscriptionLastDelta, xp, totalXP, updatedAt, createdAt
      FROM user_state
      WHERE wallet = ?
    `),
    upsertUser: db.prepare(`
      INSERT INTO user_state (
        wallet,
        profile_json,
        paid,
        subscriptionTier,
        subscriptionStatus,
        subscriptionActive,
        lastPaymentAt,
        subscriptionPaidAt,
        subscriptionClaimedAt,
        subscriptionLastDelta,
        xp,
        totalXP,
        updatedAt
      ) VALUES (
        @wallet,
        @profile_json,
        @paid,
        @subscriptionTier,
        @subscriptionStatus,
        @subscriptionActive,
        @lastPaymentAt,
        @subscriptionClaimedAt,
        @subscriptionLastDelta,
        @xp,
        @totalXP,
        @updatedAt
      )
      ON CONFLICT(wallet) DO UPDATE SET
        profile_json = excluded.profile_json,
        paid = excluded.paid,
        subscriptionTier = excluded.subscriptionTier,
        subscriptionStatus = excluded.subscriptionStatus,
        subscriptionActive = excluded.subscriptionActive,
        lastPaymentAt = excluded.lastPaymentAt,
        subscriptionClaimedAt = excluded.subscriptionClaimedAt,
        subscriptionPaidAt = excluded.subscriptionPaidAt,
        subscriptionLastDelta = excluded.subscriptionLastDelta,
        xp = excluded.xp,
        totalXP = excluded.totalXP,
        updatedAt = excluded.updatedAt
    `),
  };

  ready = true;
}

function cloneForStorage(value, seen = new WeakSet()) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (value instanceof Set) {
    return Array.from(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => cloneForStorage(item, seen));
  }
  if (typeof value === 'object') {
    if (seen.has(value)) {
      return undefined;
    }
    seen.add(value);
    const out = {};
    for (const [key, entry] of Object.entries(value)) {
      if (key === 'authed') continue;
      const cloned = cloneForStorage(entry, seen);
      if (cloned !== undefined) {
        out[key] = cloned;
      }
    }
    return out;
  }
  return value;
}

function hydrateUser(row) {
  if (!row) return null;
  let profile = {};
  if (row.profile_json) {
    try {
      profile = JSON.parse(row.profile_json);
    } catch (err) {
      console.warn('[storage] failed to parse profile_json', err);
    }
  }

  if (Array.isArray(profile.referrals)) {
    profile.referrals = new Set(profile.referrals);
  }

  const numeric = (value) => (value === null || value === undefined ? null : Number(value));

  const user = {
    ...profile,
    wallet: row.wallet,
    paid: row.paid != null ? Boolean(row.paid) : Boolean(profile.paid),
    subscriptionTier: row.subscriptionTier ?? profile.subscriptionTier ?? profile.tier,
    subscriptionStatus: row.subscriptionStatus ?? profile.subscriptionStatus,
    subscriptionActive:
      row.subscriptionActive != null
        ? Boolean(row.subscriptionActive)
        : Boolean(profile.subscriptionActive),
    lastPaymentAt:
      numeric(row.lastPaymentAt) ?? (profile.lastPaymentAt != null ? Number(profile.lastPaymentAt) : null),
    subscriptionPaidAt:
      numeric(row.subscriptionPaidAt) ??
      (profile.subscriptionPaidAt != null
        ? Number(profile.subscriptionPaidAt)
        : profile.lastPaymentAt != null
        ? Number(profile.lastPaymentAt)
        : null),
    subscriptionClaimedAt:
      numeric(row.subscriptionClaimedAt) ??
      (profile.subscriptionClaimedAt != null ? Number(profile.subscriptionClaimedAt) : null),
    subscriptionLastDelta:
      numeric(row.subscriptionLastDelta) ??
      (profile.subscriptionLastDelta != null ? Number(profile.subscriptionLastDelta) : 0),
    xp: row.xp != null ? Number(row.xp) : profile.xp ?? profile.totalXP ?? 0,
    totalXP: row.totalXP != null ? Number(row.totalXP) : profile.totalXP ?? profile.xp ?? 0,
    updatedAt: numeric(row.updatedAt) ?? (profile.updatedAt != null ? Number(profile.updatedAt) : null),
    createdAt: numeric(row.createdAt) ?? (profile.createdAt != null ? Number(profile.createdAt) : null),
  };

  return user;
}

function getUser(wallet) {
  loadDatabase();
  if (!ready || !wallet || !statements || statements === false) {
    return null;
  }
  try {
    const row = statements.getUser.get(wallet);
    return hydrateUser(row);
  } catch (err) {
    console.warn('[storage] failed to load user', err);
    return null;
  }
}

function saveUser(user) {
  loadDatabase();
  if (!ready || !user || !user.wallet || !statements || statements === false) {
    return false;
  }

  const now = Date.now();
  const plain = cloneForStorage(user);

  try {
    statements.upsertUser.run({
      wallet: user.wallet,
      profile_json: JSON.stringify(plain),
      paid: user.paid ? 1 : 0,
      subscriptionTier: user.subscriptionTier ?? user.tier ?? null,
      subscriptionStatus: user.subscriptionStatus ?? null,
      subscriptionActive: user.subscriptionActive ? 1 : 0,
      lastPaymentAt: user.lastPaymentAt ?? null,
      subscriptionPaidAt:
        user.subscriptionPaidAt != null
          ? user.subscriptionPaidAt
          : user.lastPaymentAt != null
          ? user.lastPaymentAt
          : null,
      subscriptionClaimedAt: user.subscriptionClaimedAt ?? null,
      subscriptionLastDelta: user.subscriptionLastDelta ?? 0,
      xp:
        user.totalXP != null
          ? Number(user.totalXP)
          : user.xp != null
          ? Number(user.xp)
          : 0,
      totalXP:
        user.totalXP != null
          ? Number(user.totalXP)
          : user.xp != null
          ? Number(user.xp)
          : 0,
      updatedAt: now,
    });
    return true;
  } catch (err) {
    console.warn('[storage] failed to persist user', err);
    return false;
  }
}

module.exports = {
  getUser,
  saveUser,
  isReady() {
    loadDatabase();
    return ready && statements && statements !== false;
  },
};
