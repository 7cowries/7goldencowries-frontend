export const API_BASE = ''; // via vercel.json rewrite to BE

const toJSON = async (res) => {
  if (!res) return null;
  const ct = res.headers?.get?.('content-type') || '';
  return ct.includes('application/json') ? await res.json() : await res.text();
};

const fetchJSON = (path, init = {}) =>
  fetch(`${API_BASE}${path}`, { credentials: 'include', ...init })
    .then(toJSON)
    .catch((err) => {
      if (err?.name === 'AbortError' || /aborted/i.test(err?.message||'')) return null;
      throw err;
    });

export const getJSON = (path, opts = {}) => fetchJSON(path, opts);

export const postJSON = (path, body = {}, opts = {}) =>
  fetchJSON(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    body: JSON.stringify(body),
    ...opts,
  });

export const getLeaderboard = () => getJSON('/api/leaderboard');

export const tierMultiplier = (tier) => {
  const map = { free: 1.0, 'tier-1': 1.1, 'tier-2': 1.25, 'tier-3': 1.5 };
  return map[String(tier||'free').toLowerCase()] ?? 1.0;
};
