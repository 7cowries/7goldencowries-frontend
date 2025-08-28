// src/utils/api.js
// Tiny fetch helper for calling the Render backend from the Vercel frontend.

const API_BASE =
  (
    process.env.REACT_APP_API_URL ||
    (typeof window !== "undefined" && (window.__API_BASE || window.__API_URL__)) ||
    "http://localhost:5000"
  )?.replace(/\/+$/, "") || "http://localhost:5000";

// -------- internals --------

const DEFAULT_TIMEOUT_MS = 12000;

function withTimeout(promise, ms = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort("timeout"), ms);
  return {
    exec: (fn) => fn(ctrl.signal).finally(() => clearTimeout(t)),
    signal: ctrl.signal,
  };
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

function toQS(query) {
  if (!query) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") sp.append(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function request(path, { method = "GET", body, headers, timeoutMs } = {}) {
  const { exec } = withTimeout(null, timeoutMs ?? DEFAULT_TIMEOUT_MS);
  return exec(async (signal) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    const data = await safeJson(res);
    if (!res.ok) {
      const msg = data?.error || data?.message || res.statusText || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  });
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
  throw lastErr || new Error("No endpoint responded");
}

// -------- public API --------

// Health (backend has "/" not "/health")
export const getHealth = () => request("/");

// Profile
export function getProfile(wallet, { bust } = {}) {
  if (!wallet) throw new Error("wallet is required");
  const q = toQS({ wallet, t: bust ? Date.now() : undefined });
  return request(`/api/profile${q}`);
}

// Quests list (support current + legacy mounts)
export function getQuests() {
  return tryPaths([
    "/api/quest/quests",  // current
    "/api/quests",        // legacy
    "/quests",            // legacy
  ]);
}

// Completed quests for a wallet -> { completed: number[] }
export function getCompleted(wallet) {
  const w = encodeURIComponent(wallet);
  return tryPaths([
    `/api/quest/completed/${w}`,            // current
    `/completed/${w}`,                      // legacy
    `/api/quests/completed?wallet=${w}`,    // legacy
  ]);
}

// Complete a quest -> { message, xpGain }
export function completeQuest(payload) {
  return tryPaths(
    [
      "/api/quest/complete",  // current
      "/api/quests/complete",
      "/complete",
    ],
    { method: "POST", body: payload }
  );
}

// Leaderboard (backend exposes /leaderboard; keep /api/leaderboard fallback)
export function getLeaderboard() {
  return tryPaths([
    "/leaderboard",
    "/api/leaderboard",
  ]);
}

// Discord: fetch login URL (Profile uses this, then window.location = resp.url)
export function getDiscordLogin({ state }) {
  return tryPaths([
    `/api/discord/login${toQS({ state })}`,
  ]);
}

// Generic POST (rarely needed directly)
export function postJSON(path, payload) {
  return request(path, { method: "POST", body: payload });
}

// ---- compatibility shims for existing imports ----
export const apiGet  = (path) => request(path);
export const apiPost = (path, payload) => request(path, { method: "POST", body: payload });

// Some files import `{ api }` — provide a shim object:
export const api = {
  base: API_BASE,
  get: apiGet,
  post: apiPost,
  getHealth,
  getProfile,
  getQuests,
  getCompleted,
  completeQuest,
  getLeaderboard,
  getDiscordLogin,
};

// Export the resolved base for direct imports
export { API_BASE };