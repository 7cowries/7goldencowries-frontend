const express = require('express');
const { createRouter } = require('./src/routes/quests');

const FRONTEND_URL = process.env.FRONTEND_URL || '';

const app = express();
app.set('etag', false);
app.use(express.json());
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/referrals/:code', (req, res) => {
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
