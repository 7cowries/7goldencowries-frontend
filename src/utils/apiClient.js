const API = process.env.REACT_APP_API_URL || process.env.BACKEND_ORIGIN || 'https://sevengoldencowries-backend.onrender.com';

export async function apiGet(path, opts={}) {
  const res = await fetch(API + path, { credentials: 'include', ...opts });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
export async function apiPost(path, body, opts={}) {
  const res = await fetch(API + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    body: JSON.stringify(body),
    ...opts
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
