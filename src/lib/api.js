export const API_BASE = process.env.REACT_APP_API_URL || "";

async function apiFetch(path, { method = 'GET', body, wallet } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const w = wallet || (typeof localStorage !== 'undefined' ? localStorage.getItem('wallet') : '');
  if (w) headers['x-wallet'] = w;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

export const getProgression = () => apiFetch('/api/meta/progression');
export const getMe = (wallet) => apiFetch('/api/users/me', { wallet });
export const getQuests = (wallet) => apiFetch('/api/quests', { wallet });
export const claimQuest = (wallet, questId) =>
  apiFetch('/api/quests/claim', { method: 'POST', wallet, body: { questId } });
