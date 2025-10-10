/**
 * Unified cookie-aware API helper for 7GoldenCowries.
 * Works with Vercel rewrite to Render: fetches to /api/* and includes cookies.
 */

export const API_BASE = ''; // always use FE proxy (/api) via vercel.json

export default async function api(path, opts = {}) {
  const init = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  };
  if (init.body && typeof init.body === 'object') {
    init.body = JSON.stringify(init.body);
  }

  const url = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(url, init);

  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const err = new Error('API error');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Named helpers used across pages (sidebar etc.)
export const getMe = () => api('/api/me');
export const getLeaderboard = () => api('/api/leaderboard');
export const getPaymentsStatus = () => api('/api/v1/payments/status');
export const getReferrals = () => api('/api/ref/me');               // adjust if BE path differs
export const postSubscribe = (tier) => api('/api/subscriptions', {  // adjust if BE path differs
  method: 'POST',
  body: { tier }
});

// --- legacy convenience helpers ---
export const getJSON = (path, init = {}) => api(path, { method: 'GET', ...(init || {}) });
export const postJSON = (path, body = {}, init = {}) =>
  api(path, { method: 'POST', body, ...(init || {}) });
