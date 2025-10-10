export const API_BASE = ''; // vercel rewrites /api -> backend

const swallowAbort = (e) => (e?.name === 'AbortError' || e?.code === 'ABORT_ERR');

const toJSON = async (res) => {
  if (!res) return null;
  if (res.status === 204) return null;
  try { return await res.json(); }
  catch (e) { if (swallowAbort(e)) return null; throw e; }
};

export const getJSON = (path, init = {}) =>
  fetch(path.startsWith('/api') ? path : `${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    method: init.method || 'GET',
  })
  .then(toJSON)
  .catch((e) => { if (swallowAbort(e)) return null; throw e; });

export const postJSON = (path, body = {}, init = {}) =>
  fetch(path.startsWith('/api') ? path : `${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    body: JSON.stringify(body),
    ...init,
  })
  .then(toJSON)
  .catch((e) => { if (swallowAbort(e)) return null; throw e; });

export const getLeaderboard = async () => {
  const r = await getJSON('/api/leaderboard');
  return Array.isArray(r?.data) ? r.data : (Array.isArray(r) ? r : []);
};

export const tierMultiplier = (tier) => {
  const m = { free: 1.0, 'tier 1': 1.1, 'tier 2': 1.25, 'tier 3': 1.5, 'tier 4': 2.0 };
  if (!tier) return 1.0;
  const k = String(tier).toLowerCase();
  return m[k] ?? 1.0;
};

export default { API_BASE, getJSON, postJSON, getLeaderboard, tierMultiplier };
