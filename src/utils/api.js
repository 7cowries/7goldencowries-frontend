// src/utils/api.js
// Tiny fetch helper for calling the Render backend from the Vercel frontend.

const API_BASE = (
  process.env.REACT_APP_API_URL ||
  // optional global override (handy in previews)
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
    credentials: "include", // send/receive cookies for OAuth sessions
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await safeJson(res);
    const msg = data?.error || data?.message || res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return safeJson(res);
}

// Try several possible endpoints until one responds OK
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

/** GET /health */
export const getHealth = () => request("/health");

/** GET /api/profile?wallet=... */
export function getProfile(wallet) {
  if (!wallet) throw new Error("wallet is required");
  const qs = encodeURIComponent(wallet);
  return request(`/api/profile?wallet=${qs}`);
}

/** GET quests list (supports several mounts) */
export function getQuests() {
  return tryPaths(["/api/quests", "/api/quest", "/quests"]);
}

/** GET leaderboard (supports several mounts) */
export function getLeaderboard() {
  return tryPaths(["/api/leaderboard", "/leaderboard"]);
}

/** Generic POST helper */
export function postJSON(path, payload) {
  return request(path, { method: "POST", body: payload });
}

// ---- compatibility (older imports still used in some files) -----------------
export const apiGet  = (path) => request(path);
export const apiPost = (path, payload) => request(path, { method: "POST", body: payload });

// Export the resolved base for debugging / TestAPI page
export { API_BASE };
