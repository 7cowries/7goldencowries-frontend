const express = require('express');

function categoryFor(q) {
  if ([1, 2, 3].includes(q.id)) return 'Social';
  if (q.id === 4) return 'Partner';
  if (q.id === 5) return 'Onchain';
  if ([41, 42].includes(q.id)) return 'Daily';
  return 'All';
}

function createRouter(db, { awardQuest, clearUserCache } = {}) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const rows = db.prepare('SELECT id, title, type, xp, active, sort, url FROM quests').all();
    const quests = rows.map((q) => ({ ...q, category: categoryFor(q) }));
    res.json({ quests });
  });

  router.post('/:id/proofs', (req, res) => {
    const id = Number(req.params.id);
    const { wallet, vendor, url } = req.body || {};

    if (typeof wallet !== 'string' || !wallet.trim()) {
      return res.status(400).json({ error: 'wallet required' });
    }
    if (typeof vendor !== 'string' || !vendor.trim()) {
      return res.status(400).json({ error: 'vendor required' });
    }
    if (typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'url required' });
    }

    const allowedVendors = new Set(['twitter', 'telegram', 'discord', 'link']);
    if (!allowedVendors.has(vendor)) {
      return res.status(400).json({ error: 'unsupported vendor' });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'invalid url' });
    }

    const quest = db.prepare('SELECT id FROM quests WHERE id = ?').get(id);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });
    db.prepare('INSERT INTO quest_proofs (quest_id, wallet, vendor, url, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)').run(id, wallet, vendor, url);
    res.json({ ok: true });
  });

  router.post('/:id/claim', async (req, res) => {
    const id = Number(req.params.id);
    const wallet = req.body && req.body.wallet;
    try {
      const result = await (awardQuest ? awardQuest(id, wallet) : Promise.resolve({ xp: 0 }));
      if (clearUserCache && wallet) clearUserCache(wallet);
      res.json({ xp: result.xp, status: 'ok', alreadyClaimed: result.alreadyClaimed });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  return router;
}

module.exports = { createRouter, categoryFor };
