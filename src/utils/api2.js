/**
 * Minimal, cookie-aware API shim.
 * Pages can import from '../utils/api2' and get consistent behavior.
 */
export const API_BASE = ''; // always go through FE proxy /api/*

async function http(path, opts = {}) {
  const init = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  };
  // auto-serialize body if object
  if (init.body && typeof init.body === 'object') init.body = JSON.stringify(init.body);

  const res = await fetch(path.startsWith('/') ? path : `/${path}`, init);
  // No-store BE endpoints return JSON. Try to parse; fall back to text.
  const ctype = res.headers.get('content-type') || '';
  const data = ctype.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const err = new Error('API error');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Common endpoints the sidebar pages use */
export const getMe = () => http('/api/me');
export const getLeaderboard = () => http('/api/leaderboard');
export const getPaymentsStatus = () => http('/api/v1/payments/status');
export const getReferrals = () => http('/api/ref/me');      // adjust if your BE uses another path
export const postSubscribe = (tier) => http('/api/subscriptions', { method: 'POST', body: { tier }});

/** Generic helper if a page needs a one-off call */
export const api = http;
