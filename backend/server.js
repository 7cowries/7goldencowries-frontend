const express = require('express');
const cors = require('cors');
const { createRouter } = require('./src/routes/quests.js');
const fs = require('fs');
const crypto = require('crypto');

const FRONTEND_URL = process.env.FRONTEND_URL || '';

const DEFAULT_ME = {
  anon: true,
  wallet: null,
  xp: 0,
  level: 1,
  levelSymbol: 'Shellborn',
  nextXP: 100,
  subscriptionTier: 'Free',
  socials: {
    twitterHandle: null,
    telegramId: null,
    discordId: null,
    discordGuildMember: false,
  },
  referral_code: null,
};

const sessions = new Map();

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
app.use(cors({ origin: FRONTEND_URL || false }));
app.use(express.json());
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
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

app.get(['/ref/:code', '/referrals/:code'], (req, res) => {
  const { code } = req.params;
  const url = `${FRONTEND_URL}/?ref=${encodeURIComponent(code)}`;
  res.redirect(302, url);
});

app.post('/api/session/bind-wallet', (req, res) => {
  const sess = getSession(req, res);
  const wallet = req.body && req.body.wallet;
  if (typeof wallet !== 'string' || !wallet.trim()) {
    return res.status(400).json({ error: 'wallet required' });
  }
  sess.wallet = wallet.trim();
  res.json({ ok: true });
});

app.get('/api/users/me', (req, res) => {
  const sess = getSession(req, res);
  if (!sess.wallet) {
    return res.json(DEFAULT_ME);
  }
  const data = sess.user || {};
  if (!data.referral_code) {
    data.referral_code =
      data.referral_code || Math.random().toString(36).slice(2, 10);
  }
  sess.user = data;
  const me = {
    ...DEFAULT_ME,
    anon: false,
    wallet: sess.wallet,
    ...data,
    socials: {
      ...DEFAULT_ME.socials,
      ...(data.socials || {}),
    },
    referral_code: data.referral_code,
  };
  res.json(me);
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
