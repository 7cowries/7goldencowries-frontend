const express = require('express');
const { createRouter } = require('./src/routes/quests.js');
const fs = require('fs');

const FRONTEND_URL = process.env.FRONTEND_URL || '';

const app = express();
app.set('etag', false);
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

// Placeholder: attach additional routes here
// e.g., app.use('/api/quests', createRouter(db));

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
}
