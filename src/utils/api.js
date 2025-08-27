// src/utils/api.js
// Tiny fetch helper for calling the Render backend from the Vercel frontend.

const API_BASE =
  (
    process.env.REACT_APP_API_URL ||
    (typeof window !== "undefined" ? window.__API_URL__ : undefined) ||
    "http://localhost:5000"
  )?.replace(/\/+$/, "") || "http://localhost:5000";

/* ---------------- internals ---------------- */

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

async function request(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await safeJson(res);
    const msg = data?.error || data?.message || res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return safeJson(res);
}

async function tryPaths(paths, opts) {
  let lastErr;
  for (const p of paths) {
    try { return await request(p, opts); } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("No endpoint responded");
}

/* ---------------- public API ---------------- */

export const getHealth = () => request("/health");

/** Profile */
export function getProfile(wallet) {
  if (!wallet) throw new Error("wallet is required");
  return request(`/api/profile?wallet=${encodeURIComponent(wallet)}`);
}

/** Quests list (current mount + fallbacks) */
export function getQuests() {
  return tryPaths([
    "/api/quest/quests",  // ✅ current backend mount
    "/api/quests",
    "/quests",
  ]);
}

/** Completed quests for a wallet -> { completed: number[] } */
export function getCompleted(wallet) {
  const w = encodeURIComponent(wallet);
  return tryPaths([
    `/api/quest/completed/${w}`,            // ✅ current backend mount
    `/completed/${w}`,                      // legacy
    `/api/quests/completed?wallet=${w}`,    // legacy
  ]);
}

/** Complete a quest -> { message, xpGain } */
export function completeQuest(payload) {
  return tryPaths(
    [
      "/api/quest/complete",  // ✅ current backend mount
      "/api/quests/complete",
      "/complete",
    ],
    { method: "POST", body: payload }
  );
}

/** Leaderboard */
export function getLeaderboard() {
  return tryPaths([
    "/api/leaderboard",
    "/leaderboard",
  ]);
}

/** Generic POST (rarely needed directly) */
export function postJSON(path, payload) {
  return request(path, { method: "POST", body: payload });
}

/* ---- compatibility shims for existing imports ---- */
export const apiGet  = (path) => request(path);
export const apiPost = (path, payload) => request(path, { method: "POST", body: payload });

// Some files import `{ api }` — provide a shim object:
export const api = {
  get: apiGet,
  post: apiPost,
  getHealth,
  getProfile,
  getQuests,
  getCompleted,
  completeQuest,
  getLeaderboard,
  base: API_BASE,
};

// Export the resolved base
export { API_BASE };
