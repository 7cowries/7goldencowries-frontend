const express = require('express');
const { bump } = require('../utils/limits');

function categoryFor(q) {
  if ([1, 2, 3].includes(q.id)) return 'Social';
  if (q.id === 4) return 'Partner';
  if (q.id === 5) return 'Onchain';
  if ([41, 42].includes(q.id)) return 'Daily';
  return 'All';
}

function createRouter(db = { prepare: () => ({ all: () => [], get: () => null, run: () => {} }) }, { awardQuest } = {}) {
  const router = express.Router();
  const proofs = new Map();

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

    if (!bump(`${req.ip}:${wallet}:proof`, { limit: 10, windowMs: 60000 })) {
      return res.status(429).json({ error: 'rate_limited' });
    }

    const allowedVendors = new Set(['twitter', 'telegram', 'discord', 'link']);
    if (!allowedVendors.has(vendor)) {
      return res.status(400).json({ error: 'unsupported vendor' });
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({ error: 'invalid url' });
    }

    const status = parsed.host ? 'approved' : 'pending';
    proofs.set(`${wallet}:${id}`, { wallet, questId: id, vendor, url, status, updated_at: new Date().toISOString() });

    try {
      db
        .prepare(
          'INSERT INTO quest_proofs (quest_id, wallet, vendor, url, status, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
        )
        .run(id, wallet, vendor, url, status);
    } catch (e) {
      /* ignore db errors in demo */
    }
    res.json({ status });
  });

  router.post('/:id/claim', async (req, res) => {
    const id = Number(req.params.id);
    const wallet = req.body && req.body.wallet;
    if (typeof wallet !== 'string' || !wallet.trim()) {
      return res.status(400).json({ error: 'wallet required' });
    }

    if (!bump(`${req.ip}:${wallet}:claim`, { limit: 10, windowMs: 60000 })) {
      return res.status(429).json({ error: 'rate_limited' });
    }

    const proof = proofs.get(`${wallet}:${id}`);
    if (!proof || proof.status !== 'approved') {
      return res.status(400).json({ error: 'proof_required' });
    }

    try {
      const result = await (awardQuest ? awardQuest(wallet, id) : Promise.resolve({ ok: true, xpGain: 0 }));
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  return router;
}

module.exports = { createRouter, categoryFor };
