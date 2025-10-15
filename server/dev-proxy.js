require('dotenv').config({ path: '.env.local', override: true });
const express = require('express');
const cookieParser = require('cookie-parser');

const BACKEND = process.env.BACKEND_ORIGIN || 'https://sevengoldencowries-backend.onrender.com';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ type: ['application/json', '+json'] }));
app.use(cookieParser());

// Local "login": sets cookie 7gc.sid = "w:<wallet>"
app.post('/api/auth/wallet/session', (req, res) => {
  const wallet = String((req.body?.address || req.body?.wallet || '')).trim();
  if (!wallet) return res.status(400).json({ ok:false, error:'address-required' });
  res.cookie('7gc.sid', `w:${wallet}`, { httpOnly:true, sameSite:'lax', maxAge:1000*60*60*24*30, path:'/' });
  return res.json({ ok:true, address: wallet, session: 'set' });
});

// Log inbound API calls + cookies
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[DEV-PROXY] ${req.method} ${req.originalUrl} cookie(in)=`, req.headers.cookie || '(none)');
  }
  next();
});

function normalizedCookie(req) {
  const ck = req.headers.cookie || '';
  const m = /(?:^|;\s*)7gc\.sid=([^;]+)/.exec(ck);
  if (!m) return undefined;
  let val = m[1]; try { val = decodeURIComponent(val); } catch {}
  return `7gc.sid=${val}`; // ensures "w:<wallet>"
}

app.use('/api', async (req, res) => {
  try {
    const url = new URL(req.originalUrl, BACKEND).toString();

    // Build outbound headers
    const headers = {};
    for (const [k, v] of Object.entries(req.headers)) {
      const key = k.toLowerCase();
      if (['host','connection','content-length','cookie','accept-encoding'].includes(key)) continue;
      headers[key] = Array.isArray(v) ? v.join(',') : v;
    }
    const outCookie = normalizedCookie(req);
    if (outCookie) headers['cookie'] = outCookie;
    console.log('[DEV-PROXY] -> cookie(out)=', outCookie || '(none)');

    const method = req.method.toUpperCase();
    let body;
    if (!['GET','HEAD'].includes(method) && (headers['content-type']||'').includes('application/json')) {
      body = JSON.stringify(req.body ?? {});
    }

    const r = await fetch(url, { method, headers, body });

    // Copy safe response headers (strip length/encoding/cookie/connection)
    const skip = new Set(['set-cookie','content-length','transfer-encoding','content-encoding','connection','keep-alive']);
    const type = r.headers.get('content-type');
    if (type) res.setHeader('content-type', type);
    r.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (skip.has(k)) return;
      res.setHeader(key, value);
    });

    const buf = Buffer.from(await r.arrayBuffer());
    res.status(r.status).end(buf);
    console.log(`[DEV-PROXY] <= ${r.status} ${req.originalUrl}`);
  } catch (err) {
    console.error('[DEV-PROXY] fetch error:', err?.code || err?.message || err);
    res.status(502).json({ ok:false, error:'upstream_error', message:String(err?.code || err?.message || err) });
  }
});

const port = 3000;
app.listen(port, () => console.log(`Dev proxy listening on http://localhost:${port} -> ${BACKEND}`));
