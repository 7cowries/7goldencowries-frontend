// Minimal, safe API helper used by user-facing pages.
// - Always sends cookies (credentials: 'include')
// - No AbortController; no "signal is aborted without reason" noise
// - Uses /api/* so vercel.json rewrite proxies to Render BE

const BASE = ''; // via vercel rewrite -> https://sevengoldencowries-backend.onrender.com

function isJson(res) {
  const t = res.headers.get('content-type') || '';
  return t.includes('application/json');
}

async function handle(res) {
  if (!res.ok) {
    const text = isJson(res) ? JSON.stringify(await res.json()).slice(0,500) : (await res.text()).slice(0,500);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return isJson(res) ? res.json() : res.text();
}

export async function getMe() {
  // Prefer new /api/me, fall back to old /api/users/me if present
  try {
    const r = await fetch(`${BASE}/api/me`, { credentials: 'include' });
    if (r.status === 404) throw new Error('try_legacy');
    return handle(r);
  } catch (e) {
    if (String(e.message).includes('try_legacy')) {
      const r2 = await fetch(`${BASE}/api/users/me`, { credentials: 'include' });
      return handle(r2);
    }
    // swallow DOM aborts, return a benign shape instead of throwing
    if (e && (e.name === 'AbortError' || String(e.message).includes('aborted'))) {
      return { ok:false, aborted:true };
    }
    throw e;
  }
}

export async function postWalletSession(address) {
  const r = await fetch(`${BASE}/api/auth/wallet/session`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  return handle(r);
}

export async function getHealth() {
  const r = await fetch(`${BASE}/api/health`, { credentials: 'include' });
  return handle(r);
}
