export const API_BASE = ''; // use Vercel rewrite to Render BE

const toJSON = async (res) => {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg += `: ${j.message || JSON.stringify(j)}`; } catch {}
    throw new Error(msg);
  }
  return res.json();
};

export const getJSON = (path, opts = {}) =>
  fetch(`${API_BASE}${path}`, { credentials: 'include', ...opts }).then(toJSON);

export const postJSON = (path, body = {}, opts = {}) =>
  fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
    ...opts
  }).then(toJSON);

// Pages expect these; keep simple + resilient.
export const getLeaderboard = async () => {
  try { return await getJSON('/api/referrals/leaderboard'); }
  catch { return []; } // don't break UI if BE not ready
};

// Safe default multiplier; adjust here when BE exposes a config.
export const tierMultiplier = (tier) => {
  if (typeof tier === 'number') return tier || 1;
  const map = { bronze: 1, silver: 1, gold: 1, platinum: 1, diamond: 1 };
  return map[String(tier || '').toLowerCase()] ?? 1;
};
