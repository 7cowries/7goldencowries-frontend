const express = require('express');
const cors = require('cors');
const { createRouter } = require('./src/routes/quests.js');
const fs = require('fs');
const crypto = require('crypto');
const {
  ensureProgression,
  grantXP,
} = require('./src/lib/progression');
const { verifyTonPayment } = require('./src/lib/ton');
const { Address } = require('@ton/core');

const FRONTEND_URL = process.env.FRONTEND_URL || '';
const SUBSCRIPTION_BONUS_XP = Math.max(
  0,
  Number(process.env.SUBSCRIPTION_BONUS_XP || 120)
);

function parseTonToNano(value) {
  if (value == null) return 0n;
  const raw = String(value).trim();
  if (!raw) return 0n;
  const sanitized = raw.replace(/[^0-9.]/g, '');
  if (!sanitized) return 0n;
  const [whole, fractional = ''] = sanitized.split('.');
  let total = 0n;
  if (whole) {
    try {
      total += BigInt(whole) * 1000000000n;
    } catch (err) {
      return 0n;
    }
  }
  if (fractional) {
    const frac = fractional.slice(0, 9).padEnd(9, '0');
    try {
      total += BigInt(frac);
    } catch (err) {
      return total;
    }
  }
  return total;
}

function normalizeWalletAddress(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  try {
    const friendly = Address.parseFriendly(raw);
    return friendly.address.toRawString();
  } catch (err) {
    try {
      return Address.parse(raw).toRawString();
    } catch (err2) {
      try {
        return Address.parseRaw(raw).toRawString();
      } catch (err3) {
        return raw;
      }
    }
  }
}

const TON_RECEIVE_ADDRESS = (process.env.TON_RECEIVE_ADDRESS || '').trim();
const TON_MIN_PAYMENT_NANO = (() => {
  if (process.env.TON_MIN_AMOUNT_NANO) {
    try {
      return BigInt(process.env.TON_MIN_AMOUNT_NANO);
    } catch (err) {
      return 0n;
    }
  }
  if (process.env.TON_MIN_TON) {
    return parseTonToNano(process.env.TON_MIN_TON);
  }
  return 0n;
})();

function isSecureCookieEnv() {
  if (process.env.COOKIE_SECURE === 'true') return true;
  if (process.env.COOKIE_SECURE === 'false') return false;
  return process.env.NODE_ENV === 'production';
}

function serializeCookie(name, value, options = {}) {
  const parts = [];
  const encodedValue = value == null ? '' : encodeURIComponent(value);
  parts.push(`${name}=${encodedValue}`);

  const {
    maxAge,
    path = '/',
    httpOnly = true,
    domain,
    sameSite,
    secure,
    expires,
  } = options;

  if (path) parts.push(`Path=${path}`);
  if (domain) parts.push(`Domain=${domain}`);
  if (typeof maxAge === 'number') parts.push(`Max-Age=${maxAge}`);
  if (expires instanceof Date) {
    parts.push(`Expires=${expires.toUTCString()}`);
  } else if (typeof expires === 'string') {
    parts.push(`Expires=${expires}`);
  }

  if (httpOnly) parts.push('HttpOnly');

  const secureFlag = secure ?? isSecureCookieEnv();
  const sameSiteValue = sameSite ?? (secureFlag ? 'None' : 'Lax');
  if (sameSiteValue) parts.push(`SameSite=${sameSiteValue}`);
  if (secureFlag) parts.push('Secure');

  return parts.join('; ');
}

function appendCookie(res, header) {
  if (!header) return;
  const prev = res.getHeader('Set-Cookie');
  if (!prev) {
    res.setHeader('Set-Cookie', header);
  } else if (Array.isArray(prev)) {
    res.setHeader('Set-Cookie', [...prev, header]);
  } else {
    res.setHeader('Set-Cookie', [prev, header]);
  }
}

function defaultSocials() {
  return {
    twitter: { connected: false, username: null, id: null },
    telegram: { connected: false, username: null, id: null },
    discord: { connected: false, username: null, id: null },
  };
}

function createBaseProfile(overrides = {}) {
  const profile = {
    wallet: null,
    subscriptionTier: 'Free',
    tier: 'Free',
    socials: defaultSocials(),
    referralCount: 0,
    questHistory: [],
    authed: false,
    paid: false,
    lastPaymentAt: null,
    ...overrides,
  };
  return ensureProgression(profile);
}

function serializeUser(user, { wallet, authed } = {}) {
  const normalized = ensureProgression({ ...user });
  const socials = defaultSocials();
  if (normalized.socials && typeof normalized.socials === 'object') {
    ['twitter', 'telegram', 'discord'].forEach((key) => {
      if (normalized.socials[key]) {
        socials[key] = { ...socials[key], ...normalized.socials[key] };
      }
    });
  }
  const referralCount =
    normalized.referralCount ??
    (normalized.referrals instanceof Set
      ? normalized.referrals.size
      : 0);

  const questHistory = Array.isArray(normalized.questHistory)
    ? normalized.questHistory
    : [];

  const payload = {
    ...createBaseProfile(),
    ...normalized,
    wallet: wallet ?? normalized.wallet ?? null,
    socials,
    referralCount,
    questHistory,
  };

  if (payload.tier == null && payload.subscriptionTier != null) {
    payload.tier = payload.subscriptionTier;
  }
  payload.twitterHandle =
    normalized.twitterHandle ?? socials.twitter?.username ?? null;
  payload.telegramId =
    normalized.telegramId ?? socials.telegram?.id ?? socials.telegram?.username ?? null;
  payload.discordId =
    normalized.discordId ?? socials.discord?.id ?? socials.discord?.username ?? null;

  delete payload.referrals;
  if (authed != null) {
    payload.authed = Boolean(authed);
  } else {
    payload.authed = Boolean(payload.wallet);
  }
  payload.paid = Boolean(payload.paid);
  payload.lastPaymentAt = payload.lastPaymentAt ?? null;
  return payload;
}

function getOrCreateUser(wallet) {
  if (!wallet) return null;
  let user = users.get(wallet);
  if (!user) {
    user = createBaseProfile({ wallet });
  }
  if (!user.socials) {
    user.socials = defaultSocials();
  }
  if (user.paid == null) {
    user.paid = false;
  }
  if (user.lastPaymentAt == null) {
    user.lastPaymentAt = null;
  }
  const normalized = ensureProgression(user);
  users.set(wallet, normalized);
  return normalized;
}

function buildSubscriptionStatus(user, wallet) {
  const profile = serializeUser(user || createBaseProfile(), {
    wallet,
    authed: Boolean(wallet),
  });
  const claimedAt = user?.subscriptionClaimedAt || null;
  const lastClaimDelta = Number(user?.subscriptionLastDelta || 0);
  const paid = Boolean(user?.paid);
  const lastPaymentAt = user?.lastPaymentAt || null;
  return {
    tier: profile.tier || 'Free',
    levelName: profile.levelName || 'Shellborn',
    levelSymbol: profile.levelSymbol || '🐚',
    xp: profile.xp ?? 0,
    xpIntoLevel: profile.xp ?? 0,
    totalXP: profile.totalXP ?? 0,
    nextXP: profile.nextXP ?? null,
    wallet: profile.wallet ?? wallet ?? null,
    paid,
    lastPaymentAt,
    canClaim: paid && !claimedAt,
    claimedAt,
    lastClaimDelta,
  };
}

// In‑memory stores for demo purposes
const sessions = new Map();
const users = new Map(); // wallet -> user profile
const referralCodes = new Map(); // code -> wallet

function parseCookies(req) {
  const hdr = req.headers.cookie || '';
  const out = {};
  hdr.split(';').forEach((p) => {
    const [k, v] = p.trim().split('=');
    if (k) out[k] = decodeURIComponent(v || '');
  });
  return out;
}

function getSession(req, res) {
  const cookies = parseCookies(req);
  let sid = cookies.sid;
  if (!sid || !sessions.has(sid)) {
    sid = crypto.randomUUID();
    sessions.set(sid, {});
    appendCookie(res, serializeCookie('sid', sid, { httpOnly: true }));
  }
  return sessions.get(sid);
}

const app = express();
app.set('etag', false);

// CORS configuration allowing production + local dev origins with credentials
const allowedOrigins = new Set(
  [
    FRONTEND_URL,
    'https://7goldencowries.com',
    'https://www.7goldencowries.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/+$/, ''))
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      const normalized = origin.replace(/\/+$/, '');
      if (allowedOrigins.has(normalized)) {
        return callback(null, normalized);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/healthz', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), timestamp: Date.now() });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), timestamp: Date.now() });
});

app.get('/api/health/db', (req, res) => {
  const file = process.env.SQLITE_FILE || '';
  if (!file) {
    return res.status(500).json({ ok: false, error: 'No database configured' });
  }
  try {
    if (!fs.existsSync(file)) throw new Error('Database file missing');
    try {
      const Database = require('better-sqlite3');
      const db = new Database(file, { readonly: true });
      db.prepare('SELECT 1').get();
      db.close();
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        console.warn('better-sqlite3 not installed; skipping query check');
      } else {
        throw e;
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Referral landing – validates code, sets cookie, redirects to frontend
app.get('/ref/:code', (req, res) => {
  const { code } = req.params;
  const ownerWallet = referralCodes.get(code);
  if (!ownerWallet) {
    return res.status(404).send('Invalid referral code');
  }
  appendCookie(
    res,
    serializeCookie('referral_code', code, {
      maxAge: 2592000,
      httpOnly: true,
    })
  );
  const dest = FRONTEND_URL || 'https://7goldencowries.com';
  res.redirect(302, dest);
});

app.post('/api/session/bind-wallet', (req, res) => {
  const sess = getSession(req, res);
  const wallet = req.body && req.body.wallet;
  if (typeof wallet !== 'string' || !wallet.trim()) {
    return res.status(400).json({ error: 'wallet required' });
  }
  const w = wallet.trim();
  sess.wallet = w;

  const cookies = parseCookies(req);
  const code = cookies.referral_code;
  let user = getOrCreateUser(w);
  users.set(w, user);
  sess.user = user;

  if (code && !user.referrerWallet) {
    const refWallet = referralCodes.get(code);
    if (refWallet && refWallet !== w) {
      user.referred_by = code;
      user.referrerWallet = refWallet;
      let refUser = getOrCreateUser(refWallet);
      if (!refUser.referrals) refUser.referrals = new Set();
      if (!refUser.referrals.has(w)) {
        refUser.referrals.add(w);
        refUser.referralCount = (refUser.referralCount || 0) + 1;
        refUser = grantXP(refUser, 50);
        users.set(refWallet, refUser);
      }
    }
    appendCookie(
      res,
      serializeCookie('referral_code', '', {
        maxAge: 0,
        httpOnly: true,
      })
    );
  }

  res.json({ ok: true });
});

app.get('/api/users/me', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return res.json(createBaseProfile());
  }
  let user = getOrCreateUser(sess.wallet);
  if (!user.referral_code) {
    user.referral_code = Math.random().toString(36).slice(2, 10);
    referralCodes.set(user.referral_code, sess.wallet);
  }
  users.set(sess.wallet, user);
  sess.user = user;
  res.json(serializeUser(user, { wallet: sess.wallet, authed: true }));
});

app.get('/api/v1/payments/status', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return res.json({ paid: false, lastPaymentAt: null });
  }
  const user = getOrCreateUser(sess.wallet);
  users.set(sess.wallet, user);
  sess.user = user;
  res.json({
    paid: Boolean(user.paid),
    lastPaymentAt: user.lastPaymentAt || null,
  });
});

app.post('/api/v1/payments/verify', async (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return res
      .status(401)
      .json({ verified: false, error: 'unauthorized', message: 'Wallet session required' });
  }
  if (!TON_RECEIVE_ADDRESS) {
    return res.status(500).json({
      verified: false,
      error: 'not-configured',
      message: 'TON_RECEIVE_ADDRESS not configured',
    });
  }

  const body = req.body || {};
  const txHash = typeof body.txHash === 'string' ? body.txHash.trim() : '';
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  if (!txHash) {
    return res.status(400).json({ verified: false, error: 'txhash-required' });
  }

  try {
    const verification = await verifyTonPayment({
      txHash,
      to: TON_RECEIVE_ADDRESS,
      minAmount: TON_MIN_PAYMENT_NANO,
      comment: comment || '7GC-SUB',
    });
    if (!verification?.verified) {
      return res.status(422).json({ verified: false, detail: verification || null });
    }

    const normalizedSessionWallet = normalizeWalletAddress(sess.wallet);
    const normalizedSender = normalizeWalletAddress(verification.from);
    if (!normalizedSender || normalizedSender !== normalizedSessionWallet) {
      return res.status(403).json({
        verified: false,
        error: 'wallet-mismatch',
        from: verification?.from || null,
      });
    }

    let user = getOrCreateUser(sess.wallet) || createBaseProfile({ wallet: sess.wallet });
    user.paid = true;
    user.lastPaymentAt = Date.now();
    users.set(sess.wallet, user);
    sess.user = user;

    res.json({
      verified: true,
      paid: true,
      lastPaymentAt: user.lastPaymentAt,
    });
  } catch (err) {
    console.error('TON verification failed', err);
    res.status(400).json({
      verified: false,
      error: err?.message || 'verification-failed',
    });
  }
});

app.get('/api/v1/subscription', (req, res) => {
  res.redirect(301, '/api/v1/subscription/status');
});

app.get('/api/v1/subscription/status', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    const status = buildSubscriptionStatus(null, null);
    status.canClaim = false;
    status.wallet = null;
    status.claimedAt = null;
    status.paid = false;
    status.lastPaymentAt = null;
    return res.json(status);
  }
  const user = getOrCreateUser(sess.wallet);
  users.set(sess.wallet, user);
  sess.user = user;
  res.json(buildSubscriptionStatus(user, sess.wallet));
});

app.post('/api/v1/subscription/claim', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return res
      .status(401)
      .json({ error: 'unauthorized', message: 'Wallet session required' });
  }

  let user = getOrCreateUser(sess.wallet) || createBaseProfile({ wallet: sess.wallet });
  if (!user.paid) {
    return res
      .status(402)
      .json({ error: 'payment-required', message: 'Active subscription required' });
  }
  let xpDelta = 0;
  if (!user.subscriptionClaimedAt) {
    const now = Date.now();
    xpDelta = SUBSCRIPTION_BONUS_XP;
    const history = Array.isArray(user.questHistory) ? [...user.questHistory] : [];
    const updated = grantXP(user, xpDelta);
    updated.subscriptionClaimedAt = now;
    updated.subscriptionLastDelta = xpDelta;
    history.push({
      id: `subscription-${now}`,
      title: 'Subscription bonus',
      xp: xpDelta,
      delta: xpDelta,
      completed_at: new Date(now).toISOString(),
    });
    updated.questHistory = history;
    user = updated;
  } else {
    user.subscriptionLastDelta = 0;
  }

  users.set(sess.wallet, user);
  sess.user = user;

  res.json({
    xpDelta,
    status: buildSubscriptionStatus(user, sess.wallet),
  });
});

app.get('/api/profile', (req, res) => {
  const wallet = String(req.query.wallet || '').trim();
  if (!wallet) {
    return res.status(400).json({ error: 'wallet required' });
  }
  const user = getOrCreateUser(wallet);
  if (!user) {
    return res.status(404).json({ error: 'not-found' });
  }
  res.json({ profile: serializeUser(user, { wallet, authed: false }) });
});

// Referral status for current session
app.get('/api/referral/status', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return res.json({ referral_code: null, referred_by: null, referrerWallet: null });
  }
  const user = getOrCreateUser(sess.wallet) || {};
  if (user.referral_code) {
    referralCodes.set(user.referral_code, sess.wallet);
  }
  res.json({
    referral_code: user.referral_code || null,
    referred_by: user.referred_by || null,
    referrerWallet: user.referrerWallet || null,
  });
});

// Placeholder: attach additional routes here
// e.g., app.use('/api/quests', createRouter(db));

app.get('/', (req, res) => {
  res.json({
    ok: true,
    name: '7GoldenCowries API',
    routes: [
      '/healthz',
      '/api/health',
      '/api/users/me',
      '/api/v1/payments/status',
      '/api/v1/subscription/status',
    ],
  });
});

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`API listening on ${port}`);
  });
}
