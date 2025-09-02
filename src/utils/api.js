// src/utils/api.js
// Unified fetch helper for calling the Render backend from Vercel (or local).
// - Always sends credentials (cookies) so sessions work cross-origin.
// - Has timeouts, JSON safety, and multiple endpoint fallbacks.

const API_BASE = (
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && (window.__API_BASE || window.__API_URL__)) ||
  'http://localhost:5000'
).replace(/\/+$/, ''); // trim trailing slashes

// ---------- internals ----------

const DEFAULT_TIMEOUT_MS = 12000;

function withTimeout(ms = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort('timeout'), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(t) };
}

async function asJson(res) {
  if (res.status === 204) return null;
  try { return await res.json(); } catch { return null; }
}

function qs(query) {
  if (!query) return '';
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') sp.append(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

async function request(path, { method = 'GET', body, headers, timeoutMs } = {}) {
  const { signal, clear } = withTimeout(timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
    const data = await asJson(res);
    if (!res.ok) {
      const msg = data?.error || data?.message || res.statusText || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } finally {
    clear();
  }
}

async function tryPaths(paths, opts) {
  let lastErr;
  for (const p of paths) {
    try {
      return await request(p, opts);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('No endpoint responded');
}

// ---------- public API ----------

// Health
export const getHealth = () =>
  tryPaths(['/api/health', '/health', '/'], {});

// Session-based profile (reads cookie session; no wallet param)
export const getMe = () =>
  tryPaths(['/api/users/me', '/users/me'], {});

// Wallet-query profile (explicit wallet string)
export function getProfile(wallet, { bust } = {}) {
  if (!wallet) throw new Error('wallet is required');
  return request(`/api/profile${qs({ wallet, t: bust ? Date.now() : undefined })}`);
}

// Quests list
export const getQuests = () =>
  tryPaths(['/api/quest/quests', '/api/quests', '/quests'], {});

// Completed quests for a wallet -> { completed: number[] }
export const getCompleted = (wallet) => {
  const w = encodeURIComponent(wallet);
  return tryPaths(
    [`/api/quest/completed/${w}`, `/api/quests/completed?wallet=${w}`, `/completed/${w}`],
    {}
  );
};

// Complete a quest -> { message, xpGain }
export const completeQuest = (payload) =>
  tryPaths(
    ['/api/quest/complete', '/api/quests/complete', '/complete'],
    { method: 'POST', body: payload }
  );

// Leaderboard
export const getLeaderboard = () =>
  tryPaths(['/leaderboard', '/api/leaderboard'], {});

// Discord login URL (flexible: your router may mount under /auth or /api)
export const getDiscordLogin = ({ state }) =>
  tryPaths(
    [
      `/auth/discord/login${qs({ state })}`,
      `/auth/discord/start${qs({ state })}`,
      `/api/discord/login${qs({ state })}`,
    ],
    {}
  );

// Generic helpers (sometimes useful directly)
export const getJSON  = (path) => request(path);
export const postJSON = (path, payload) => request(path, { method: 'POST', body: payload });

// ---- legacy named exports kept for compatibility (older imports) ----
export const apiGet  = (path) => request(path);
export const apiPost = (path, payload) => request(path, { method: 'POST', body: payload });

// Back-compat shim for modules importing `{ api }`
export const api = {
  base: API_BASE,
  get: getJSON,
  post: postJSON,
  getHealth,
  getMe,
  getProfile,
  getQuests,
  getCompleted,
  completeQuest,
  getLeaderboard,
  getDiscordLogin,
};

// Expose resolved base
export { API_BASE };
