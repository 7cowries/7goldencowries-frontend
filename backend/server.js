const express = require('express');
const cors = require('cors');
const { createRouter } = require('./src/routes/quests.js');
const { normalizeMe } = require('./src/utils/normalize');
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
let leaderboardCache = null;

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

function awardQuest(wallet, questId) {
  if (typeof wallet !== 'string' || !wallet.trim()) throw new Error('wallet required');
  let user = users.get(wallet);
  if (!user) {
    user = { ...DEFAULT_ME, wallet };
    users.set(wallet, user);
  }
  if (user.questHistory && user.questHistory.some((q) => q.questId === questId)) {
    return { ok: true, xpGain: 0, already: true };
  }
  const baseXP = 10;
  const tier = user.subscriptionTier || 'Free';
  const mult = tier === 'Tier3' ? 1.25 : tier === 'Tier2' ? 1.1 : tier === 'Tier1' ? 1.05 : 1;
  const gain = Math.round(baseXP * mult);
  user.xp = (user.xp || 0) + gain;
  if (!user.questHistory) user.questHistory = [];
  user.questHistory.push({
    questId,
    title: `Quest ${questId}`,
    xp: gain,
    completed_at: new Date().toISOString(),
  });
  if (user.questHistory.length > 50) {
    user.questHistory = user.questHistory.slice(-50);
  }
  leaderboardCache = null;
  return { ok: true, xpGain: gain };
}

const app = express();
app.set('etag', false);

// expose internals for tests
app.__users = users;
app.__sessions = sessions;

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
  const now = Date.now();
  if (sess.wallet === w && sess.lastBindAt && now - sess.lastBindAt < 4000) {
    return res.json({ ok: true });
  }
  sess.lastBindAt = now;
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

const authProviders = new Set(['twitter', 'telegram', 'discord']);
app.get('/api/auth/:provider/start', (req, res) => {
  const { provider } = req.params;
  if (!authProviders.has(provider)) return res.status(404).end();
  res.redirect(302, `/auth/${provider}/start`);
});

app.get('/auth/:provider/callback', (req, res) => {
  const { provider } = req.params;
  if (!authProviders.has(provider)) return res.status(404).end();
  const sess = getSession(req, res);
  let user = sess.user;
  if (!user && sess.wallet) {
    user = users.get(sess.wallet) || { ...DEFAULT_ME, wallet: sess.wallet };
    users.set(sess.wallet, user);
    sess.user = user;
  }
  if (user) {
    if (provider === 'twitter') user.twitterHandle = req.query.handle || null;
    if (provider === 'telegram') {
      user.telegramId = req.query.id || null;
      user.telegramHandle = req.query.username || null;
    }
    if (provider === 'discord') {
      user.discordId = req.query.id || null;
    }
  }
  let dest = `/profile?connected=${provider}`;
  if (req.query.guildMember !== undefined) dest += `&guildMember=${req.query.guildMember}`;
  res.redirect(302, dest);
});

app.get('/api/users/me', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return res.json(normalizeMe());
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
  const me = normalizeMe(user);
  me.history = (user.questHistory || [])
    .slice()
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    .slice(0, 50)
    .map((q) => ({ questId: q.questId, title: q.title, xp: q.xp, completed_at: q.completed_at }));
  res.json(me);
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

// Attach quests router
app.use('/api/quests', createRouter(null, { awardQuest, getUser: (w) => users.get(w), normalizeMe }));

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
}
