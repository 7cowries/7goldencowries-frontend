export const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE) ||
  process.env.REACT_APP_API_URL ||
  "";

async function jsonFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} – ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getJSON(path, opts) {
  return jsonFetch(path, opts);
}

export function getQuests({ signal } = {}) {
  return jsonFetch("/api/quests", { signal });
}

export function getLeaderboard({ signal } = {}) {
  return jsonFetch("/api/leaderboard", { signal });
}

export function getMe({ signal } = {}) {
  return jsonFetch("/api/users/me", { signal });
}

export async function postJSON(path, body, opts = {}) {
  return jsonFetch(path, { method: "POST", body: JSON.stringify(body ?? {}), ...opts });
}

export const api = {
  base: API_BASE,
  getQuests,
  getLeaderboard,
  postJSON,
  get: getJSON,
  getJSON,
  post: postJSON,
};
