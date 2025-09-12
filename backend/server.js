const express = require('express');
const cors = require('cors');
const { createRouter } = require('./src/routes/quests.js');
const fs = require('fs');
const crypto = require('crypto');

const FRONTEND_URL = process.env.FRONTEND_URL || '';

// Default profile returned when no wallet/session
const DEFAULT_ME = {
  wallet: null,
  xp: 0,
  level: 'Shellborn',
  levelName: 'Shellborn',
  levelSymbol: '🐚',
  nextXP: 100,
  twitterHandle: null,
  telegramId: null,
  discordId: null,
  subscriptionTier: 'Free',
  questHistory: [],
};

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
    res.setHeader('Set-Cookie', `sid=${sid}; Path=/; HttpOnly`);
  }
  return sessions.get(sid);
}

const app = express();
app.set('etag', false);

// CORS configuration allowing production + local dev origins with credentials
const allowedOrigins = [
  FRONTEND_URL,
  'https://7goldencowries.com',
  'https://www.7goldencowries.com',
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
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
  res.setHeader(
    'Set-Cookie',
    `referral_code=${encodeURIComponent(code)}; Max-Age=2592000; Path=/; HttpOnly; SameSite=None; Secure`
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
  let user = users.get(w);
  if (!user) {
    user = { ...DEFAULT_ME, wallet: w };
    users.set(w, user);
  }
  sess.user = user;

  if (code && !user.referrerWallet) {
    const refWallet = referralCodes.get(code);
    if (refWallet && refWallet !== w) {
      user.referred_by = code;
      user.referrerWallet = refWallet;
      const refUser = users.get(refWallet) || { ...DEFAULT_ME, wallet: refWallet };
      if (!refUser.referrals) refUser.referrals = new Set();
      if (!refUser.referrals.has(w)) {
        refUser.referrals.add(w);
        refUser.xp = (refUser.xp || 0) + 50;
        users.set(refWallet, refUser);
      }
    }
    res.setHeader(
      'Set-Cookie',
      'referral_code=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure'
    );
  }

  res.json({ ok: true });
});

app.get('/api/users/me', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return res.json(DEFAULT_ME);
  }
  let user = users.get(sess.wallet);
  if (!user) {
    user = { ...DEFAULT_ME, wallet: sess.wallet };
    users.set(sess.wallet, user);
  }
  if (!user.referral_code) {
    user.referral_code = Math.random().toString(36).slice(2, 10);
    referralCodes.set(user.referral_code, sess.wallet);
  }
  sess.user = user;
  res.json({ ...DEFAULT_ME, ...user, wallet: sess.wallet });
});

// Referral status for current session
app.get('/api/referral/status', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return res.json({ referral_code: null, referred_by: null, referrerWallet: null });
  }
  const user = users.get(sess.wallet) || {};
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

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
}
