/** @jest-environment node */
const http = require('http');
const app = require('../backend/server.js');
function call(method, path, body, jar = {}) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const headers = { 'Content-Type': 'application/json' };
      if (jar.sid) headers.Cookie = `sid=${jar.sid}`;
      const opts = {
        method,
        hostname: '127.0.0.1',
        port: server.address().port,
        path,
        headers,
      };
      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => {
          server.close();
          const sc = res.headers['set-cookie'];
          if (sc && sc[0]) {
            const m = /sid=([^;]+)/.exec(sc[0]);
            if (m) jar.sid = m[1];
          }
          let obj = null; try { obj = data ? JSON.parse(data) : null; } catch { obj = null; }
          resolve({ status: res.statusCode, body: obj, headers: res.headers });
        });
      });
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  });
}

describe('backend features', () => {
  test('tier multiplier applies', async () => {
    const jar = {};
    await call('POST', '/api/session/bind-wallet', { wallet: 'w1' }, jar);
    app.__users.get('w1').subscriptionTier = 'Tier3';
    await call('POST', '/api/quests/1/proofs', { wallet: 'w1', vendor: 'link', url: 'https://example.com' });
    const res = await call('POST', '/api/quests/1/claim', { wallet: 'w1' });
    expect(res.body.xpGain).toBe(13);
  });

  test('auth start aliases redirect', async () => {
    const res = await call('GET', '/api/auth/twitter/start');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/auth/twitter/start');
  });

  test('rate limit kicks in on 11th request', async () => {
    for (let i = 0; i < 10; i++) {
      const r = await call('POST', '/api/quests/2/proofs', { wallet: 'w2', vendor: 'link', url: 'https://example.com/' + i });
      expect(r.status).toBe(200);
    }
    const res = await call('POST', '/api/quests/2/proofs', { wallet: 'w2', vendor: 'link', url: 'https://example.com/11' });
    expect(res.status).toBe(429);
    expect(res.body.error).toBe('rate_limited');
  });

  test('/api/users/me returns normalized user', async () => {
    const jar = {};
    await call('POST', '/api/session/bind-wallet', { wallet: 'w3' }, jar);
    await call('POST', '/api/quests/3/proofs', { wallet: 'w3', vendor: 'link', url: 'https://example.com' });
    await call('POST', '/api/quests/3/claim', { wallet: 'w3' });
    const res = await call('GET', '/api/users/me', null, jar);
    expect(res.body.user.wallet).toBe('w3');
    expect(res.body.user.levelProgress).toBeGreaterThanOrEqual(0);
    expect(res.body.user.levelProgress).toBeLessThanOrEqual(1);
    expect(Array.isArray(res.body.user.questHistory)).toBe(true);
    expect(res.body.user.questHistory[0].questId).toBe(3);
  });
});
