const express = require('express');
const cors = require('cors');
const { createRouter } = require('./src/routes/quests.js');
const fs = require('fs');
const crypto = require('crypto');
const {
  ensureProgression,
  grantXP,
} = require('./src/lib/progression');
const storage = require('./src/lib/storage');
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

function normalizeErrorCode(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim().toLowerCase();
  if (!str) return null;
  const normalized = str.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
  return normalized || null;
}

function sendError(res, status, code, message, extra = {}) {
  const normalized = normalizeErrorCode(code) || 'request-failed';
  const body = {
    ...extra,
    error: normalized,
    code: normalized,
    message: message || normalized,
  };
  return res.status(status).json(body);
}

function sendOk(res, payload = {}, { status = 200, message } = {}) {
  const body = { ...payload };
  body.error = null;
  body.code = null;
  if (message !== undefined) {
    body.message = message;
  } else if (!('message' in body)) {
    body.message = null;
  }
  return res.status(status).json(body);
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

const sessions = new Map();
const users = new Map();
const referralCodes = new Map();

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
    subscriptionStatus: 'inactive',
    subscriptionActive: false,
    subscriptionSubscribedAt: null,
    subscriptionPaidAt: null,
    subscriptionClaimedAt: null,
    subscriptionLastDelta: 0,
    ...overrides,
  };
  return ensureProgression(profile);
}

function normalizeSocials(input) {
  const socials = defaultSocials();
  if (input && typeof input === 'object') {
    ['twitter', 'telegram', 'discord'].forEach((key) => {
      if (input[key]) {
        socials[key] = { ...socials[key], ...input[key] };
      }
    });
  }
  return socials;
}

function normalizeUserShape(rawUser = {}, wallet = null) {
  const base = createBaseProfile({ wallet });
  const merged = {
    ...base,
    ...rawUser,
    wallet: wallet ?? rawUser.wallet ?? base.wallet ?? null,
  };

  if (Array.isArray(rawUser.questHistory)) {
    merged.questHistory = rawUser.questHistory.map((entry) => ({ ...entry }));
  }

  if (Array.isArray(merged.referrals)) {
    merged.referrals = new Set(merged.referrals);
  } else if (merged.referrals instanceof Set) {
    // keep as-is
  } else if (merged.referrals != null) {
    merged.referrals = new Set([merged.referrals]);
  } else {
    merged.referrals = new Set();
  }

  merged.referralCount = merged.referrals.size;
  merged.socials = normalizeSocials(merged.socials);
  merged.subscriptionActive = Boolean(merged.subscriptionActive);
  merged.paid = Boolean(
    merged.paid != null ? merged.paid : merged.subscriptionActive ?? false
  );

  if (!merged.subscriptionTier) {
    merged.subscriptionTier = merged.tier || (merged.paid ? 'Premium' : 'Free');
  }
  if (!merged.tier) {
    merged.tier = merged.subscriptionTier;
  }

  if (merged.subscriptionStatus == null && merged.subscriptionActive) {
    merged.subscriptionStatus = 'active';
  }

  if (merged.subscriptionClaimedAt == null) {
    merged.subscriptionClaimedAt = null;
  }
  if (merged.subscriptionLastDelta == null) {
    merged.subscriptionLastDelta = 0;
  }
  if (merged.subscriptionSubscribedAt == null) {
    merged.subscriptionSubscribedAt = null;
  }
  if (merged.subscriptionPaidAt == null) {
    merged.subscriptionPaidAt = merged.lastPaymentAt ?? null;
  }
  merged.lastPaymentAt = merged.lastPaymentAt ?? null;

  return merged;
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
  payload.subscriptionPaidAt =
    payload.subscriptionPaidAt != null
      ? Number(payload.subscriptionPaidAt)
      : payload.lastPaymentAt ?? null;
  return payload;
}

function getOrCreateUser(wallet) {
  if (!wallet) return null;
  let user = users.get(wallet);
  if (!user) {
    const persisted = storage.getUser(wallet);
    user = persisted || {};
  }
  const normalized = ensureProgression(normalizeUserShape(user, wallet));
  users.set(wallet, normalized);
  if (normalized.referral_code) {
    referralCodes.set(normalized.referral_code, wallet);
  }
  return normalized;
}

function rememberUser(wallet, user) {
  if (!wallet || !user) return user;
  const normalized = ensureProgression(normalizeUserShape(user, wallet));
  users.set(wallet, normalized);
  if (normalized.referral_code) {
    referralCodes.set(normalized.referral_code, wallet);
  }
  storage.saveUser(normalized);
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
  const lastPaymentAt =
    user?.subscriptionPaidAt ??
    user?.lastPaymentAt ??
    (profile.subscriptionPaidAt != null
      ? Number(profile.subscriptionPaidAt)
      : profile.lastPaymentAt ?? null);
  const tier = (() => {
    const rawTier =
      user?.subscriptionTier ||
      profile.subscriptionTier ||
      profile.tier;
    if (rawTier) return rawTier;
    return paid ? 'Premium' : 'Free';
  })();

  return {
    tier,
    levelName: profile.levelName || 'Shellborn',
    levelSymbol: profile.levelSymbol || '🐚',
    xp: profile.xp ?? 0,
    xpIntoLevel: profile.xp ?? 0,
    totalXP: profile.totalXP ?? 0,
    nextXP: profile.nextXP ?? null,
    wallet: profile.wallet ?? wallet ?? null,
    paid,
    lastPaymentAt,
    subscriptionPaidAt:
      user?.subscriptionPaidAt ??
      (profile.subscriptionPaidAt != null
        ? Number(profile.subscriptionPaidAt)
        : lastPaymentAt ?? null),
    canClaim: paid && !claimedAt,
    claimedAt,
    lastClaimDelta,
  };
}

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

// CORS configuration allowing only local development origins with credentials
const normalizeOrigin = (origin) => origin.replace(/\/+$/, '');

const devOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

if (FRONTEND_URL && /localhost|127\.0\.0\.1/.test(FRONTEND_URL)) {
  devOrigins.push(FRONTEND_URL);
}

const allowedOrigins = new Set(devOrigins.filter(Boolean).map((origin) => normalizeOrigin(origin)));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      const normalized = normalizeOrigin(origin);
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

  if (code && !user.referrerWallet) {
    const refWallet = referralCodes.get(code);
    if (refWallet && refWallet !== w) {
      user.referred_by = code;
      user.referrerWallet = refWallet;
      let refUser = getOrCreateUser(refWallet);
      if (!(refUser.referrals instanceof Set)) {
        refUser.referrals = new Set();
      }
      if (!refUser.referrals.has(w)) {
        refUser.referrals.add(w);
        refUser.referralCount = refUser.referrals.size;
        refUser = grantXP(refUser, 50);
        refUser = rememberUser(refWallet, refUser);
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

  user = rememberUser(w, user);
  sess.user = user;

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
  user = rememberUser(sess.wallet, user);
  sess.user = user;
  res.json(serializeUser(user, { wallet: sess.wallet, authed: true }));
});

app.get('/api/v1/payments/status', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return sendOk(res, {
      paid: false,
      lastPaymentAt: null,
      subscriptionPaidAt: null,
    });
  }
  const user = getOrCreateUser(sess.wallet);
  sess.user = user;
  sendOk(res, {
    paid: Boolean(user.paid),
    lastPaymentAt:
      user.subscriptionPaidAt ?? user.lastPaymentAt ?? null,
    subscriptionPaidAt: user.subscriptionPaidAt ?? null,
  });
});

app.post('/api/v1/payments/verify', async (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return sendError(res, 401, 'unauthorized', 'Wallet session required', {
      verified: false,
    });
  }
  if (!TON_RECEIVE_ADDRESS) {
    return sendError(res, 500, 'not-configured', 'TON_RECEIVE_ADDRESS not configured', {
      verified: false,
    });
  }

  const body = req.body || {};
  const txHash = typeof body.txHash === 'string' ? body.txHash.trim() : '';
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  if (!txHash) {
    return sendError(res, 400, 'txhash-required', 'Transaction hash required', {
      verified: false,
    });
  }

  try {
    const verification = await verifyTonPayment({
      txHash,
      to: TON_RECEIVE_ADDRESS,
      minAmount: TON_MIN_PAYMENT_NANO,
      comment: comment || '7GC-SUB',
    });
    if (!verification?.verified) {
      return sendError(res, 422, 'payment-not-verified', 'Payment not verified', {
        verified: false,
        details: verification || null,
      });
    }

    const normalizedSessionWallet = normalizeWalletAddress(sess.wallet);
    const normalizedSender = normalizeWalletAddress(verification.from);
    if (!normalizedSender || normalizedSender !== normalizedSessionWallet) {
      return sendError(res, 403, 'wallet-mismatch', 'Payment wallet mismatch', {
        verified: false,
        from: verification?.from || null,
      });
    }

    let user =
      getOrCreateUser(sess.wallet) || createBaseProfile({ wallet: sess.wallet });
    user.paid = true;
    user.lastPaymentAt = Date.now();
    user.subscriptionPaidAt = user.lastPaymentAt;
    if (!user.subscriptionTier || user.subscriptionTier === 'Free') {
      user.subscriptionTier = 'Premium';
    }
    user.subscriptionStatus = 'active';
    user.subscriptionActive = true;
    if (!user.subscriptionSubscribedAt) {
      user.subscriptionSubscribedAt = user.lastPaymentAt;
    }
    if (!user.tier || user.tier === 'Free') {
      user.tier = user.subscriptionTier;
    }
    user = rememberUser(sess.wallet, user);
    sess.user = user;

    sendOk(
      res,
      {
        verified: true,
        paid: true,
        lastPaymentAt: user.lastPaymentAt,
        subscriptionPaidAt: user.subscriptionPaidAt ?? user.lastPaymentAt ?? null,
      },
      { message: 'Payment verified' }
    );
  } catch (err) {
    console.error('TON verification failed', err);
    const message = err?.message || 'Payment verification failed';
    sendError(res, 400, err?.code || 'verification-failed', message, {
      verified: false,
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
    return sendOk(res, status);
  }
  const user = getOrCreateUser(sess.wallet);
  sess.user = user;
  sendOk(res, buildSubscriptionStatus(user, sess.wallet));
});

app.post('/api/v1/subscription/claim', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return sendError(res, 401, 'unauthorized', 'Wallet session required');
  }

  let user = getOrCreateUser(sess.wallet) || createBaseProfile({ wallet: sess.wallet });
  if (!user.paid) {
    return sendError(res, 402, 'payment-required', 'Active subscription required');
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

  user = rememberUser(sess.wallet, user);
  sess.user = user;

  const status = buildSubscriptionStatus(user, sess.wallet);
  const message = xpDelta > 0 ? 'Subscription bonus granted' : 'Subscription bonus already claimed';
  sendOk(
    res,
    {
      xpDelta,
      status,
    },
    { message }
  );
});

app.post('/api/v1/subscription/subscribe', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return sendError(res, 401, 'unauthorized', 'Wallet session required');
  }

  const body = req.body || {};
  const tierRaw = typeof body.tier === 'string' ? body.tier.trim() : '';
  const normalizedTier = tierRaw ? tierRaw.toLowerCase() : 'premium';
  const prettyTier =
    normalizedTier.charAt(0).toUpperCase() + normalizedTier.slice(1).toLowerCase();

  let user = getOrCreateUser(sess.wallet) || createBaseProfile({ wallet: sess.wallet });
  user.subscriptionTier = prettyTier;
  user.tier = prettyTier;
  user.subscriptionStatus = 'active';
  user.subscriptionActive = true;
  if (!user.subscriptionSubscribedAt) {
    user.subscriptionSubscribedAt = Date.now();
  }
  if (!user.paid) {
    user.paid = true;
  }

  user = rememberUser(sess.wallet, user);
  sess.user = user;

  sendOk(
    res,
    {
      ok: true,
      status: buildSubscriptionStatus(user, sess.wallet),
    },
    { message: 'Subscription updated' }
  );
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
