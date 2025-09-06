/** @jest-environment node */
const express = require('express');
const http = require('http');
const { createRouter } = require('../backend/src/routes/quests.js');

function call(app, method, path, body) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const opts = {
        method,
        hostname: '127.0.0.1',
        port: server.address().port,
        path,
        headers: { 'Content-Type': 'application/json' },
      };
      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => {
          server.close();
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        });
      });
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  });
}

describe('quests API', () => {
  test('GET /api/quests returns category mapping', async () => {
    const quests = [{ id: 1, title: 'q1', type: 'link', xp: 10, active: 1, sort: 0, url: 'u' }];
    const db = {
      prepare: () => ({
        all: () => quests,
        get: (id) => quests.find((q) => q.id === id),
        run: () => {},
      }),
    };
    const app = express();
    app.use(express.json());
    app.use('/api/quests', createRouter(db));
    const res = await call(app, 'GET', '/api/quests');
    expect(res.body.quests[0].category).toBe('Social');
  });

  test('POST /api/quests/:id/proofs inserts proof', async () => {
    const proofs = [];
    const db = {
      prepare: (sql) => {
        if (sql.startsWith('SELECT')) {
          return { get: () => ({ id: 1 }) };
        }
        return {
          run: (questId, wallet, vendor, url) => {
            proofs.push({ questId, wallet, vendor, url });
          },
        };
      },
    };
    const app = express();
    app.use(express.json());
    app.use('/api/quests', createRouter(db));
    const res = await call(app, 'POST', '/api/quests/1/proofs', {
      url: 'u',
    });
    expect(res.status).toBe(200);
    expect(proofs[0]).toEqual({ questId: 1, wallet: undefined, vendor: undefined, url: 'u' });
  });
});
