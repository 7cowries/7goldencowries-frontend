// src/utils/api.js
// Unified API helper for calling the Render backend from the Vercel frontend.

const API_BASE = (
  process.env.REACT_APP_API_URL ||
  window.__API_URL__ ||
  "http://localhost:5000"
).replace(/\/+$/, ""); // strip trailing slash

/* ----------------- internals ----------------- */

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
    credentials: "include", // send/receive cookies (OAuth, sessions)
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

/* ----------------- public API ----------------- */

/** Healthcheck */
export const getHealth = () => request("/health");

/** Profile */
export function getProfile(wallet) {
  if (!wallet) throw new Error("wallet is required");
  return request(`/api/profile?wallet=${encodeURIComponent(wallet)}`);
}

/** Quests */
export function getQuests() {
  // backend exposes GET /api/quest/quests
  return request("/api/quest/quests");
}

export function getCompleted(wallet) {
  return request(`/api/quest/completed/${encodeURIComponent(wallet)}`);
}

export function completeQuest(payload) {
  return request("/api/quest/complete", { method: "POST", body: payload });
}

/** Leaderboard */
export function getLeaderboard() {
  return request("/api/leaderboard");
}

/** Generic POST (fallback helper) */
export function postJSON(path, payload) {
  return request(path, { method: "POST", body: payload });
}

// Export base for debugging
export { API_BASE };
