// src/utils/api.js
// Tiny fetch helper for calling the Render backend from the Vercel frontend.

const API_BASE = (
  process.env.REACT_APP_API_URL ||
  (typeof window !== "undefined" ? window.__API_URL__ : undefined) ||
  "http://localhost:5000"
)?.replace(/\/+$/, "") || "http://localhost:5000";

// ---- internals --------------------------------------------------------------

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
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
    try {
      return await request(p, opts);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("No endpoint responded");
}

// ---- public API -------------------------------------------------------------

export const getHealth = () => request("/health");

export function getProfile(wallet) {
  if (!wallet) throw new Error("wallet is required");
  const qs = encodeURIComponent(wallet);
  return request(`/api/profile?wallet=${qs}`);
}

export function getQuests() {
  return tryPaths(["/api/quests", "/api/quest", "/quests"]);
}

export function getLeaderboard() {
  return tryPaths(["/api/leaderboard", "/leaderboard"]);
}

export function postJSON(path, payload) {
  return request(path, { method: "POST", body: payload });
}

// ---- compatibility exports for existing imports -----------------------------
export const apiGet  = (path) => request(path);
export const apiPost = (path, payload) => request(path, { method: "POST", body: payload });

// Some files import `{ api }` — provide a shim object:
export const api = {
  get: apiGet,
  post: apiPost,
  getHealth,
  getProfile,
  getQuests,
  getLeaderboard,
  base: API_BASE,
};

// Export the resolved base
export { API_BASE };
