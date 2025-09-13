export const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE) ||
  process.env.REACT_APP_API_URL ||
  "";

// Ensure the API base URL is configured. This avoids accidentally
// pointing requests at the current origin which can be confusing in
// development and misconfigured in production.  The value should be
// supplied via `REACT_APP_API_URL` or injected into `window.__API_BASE`.
// Throwing here makes the failure obvious during start‑up rather than at
// the first network request.
if (!API_BASE) {
  throw new Error(
    "REACT_APP_API_URL is required – set it in your environment or .env file"
  );
}

// Prebuilt URLs for starting OAuth or embedding auth widgets
export const API_URLS = {
  twitterStart: `${API_BASE}/api/auth/twitter/start`,
  discordStart: `${API_BASE}/api/auth/discord/start`,
  // Used by the Telegram login widget (data-auth-url)
  telegramEmbedAuth: `${API_BASE}/api/auth/telegram/callback`,
};

export function withSignal(ms = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(id),
  };
}

export async function fetchJson(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      credentials: "include",
      cache: "no-store",
      ...(options || {}),
    });
  } catch (err) {
    const msg = `Network error: ${err.message}`;
    if (typeof window !== "undefined" && window.alert) {
      window.alert(msg);
    }
    throw new Error(msg);
  }

  if (res.status === 304) return null;

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      const detail = data?.error ?? JSON.stringify(data);
      if (detail && detail !== "{}") msg += `: ${detail}`;
    } catch (_) {
      try {
        const text = await res.text();
        if (text) msg += `: ${text}`;
      } catch (_) {
        /* ignore */
      }
    }
    if (typeof window !== "undefined" && window.alert) {
      window.alert(msg);
    }
    throw new Error(msg);
  }

  return res.status === 204 ? null : await res.json();
}

// simple in-memory cache with 60s TTL
const _cache = new Map();
const CACHE_TTL = 60000;

function userKey(key) {
  const w =
    typeof window !== "undefined" && window.localStorage
      ? window.localStorage.getItem("wallet")
      : null;
  return w ? `${key}:${w}` : key;
}

function cacheGet(key) {
  const hit = _cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.t > CACHE_TTL) {
    _cache.delete(key);
    return null;
  }
  return hit.v;
}

function cacheSet(key, value) {
  _cache.set(key, { t: Date.now(), v: value });
}

export function clearUserCache() {
  ["quests", "me"].forEach((k) => _cache.delete(userKey(k)));
}

export async function jsonFetch(path, opts = {}) {
  const controller = opts.signal ? null : new AbortController();
  const id = controller ? setTimeout(() => controller.abort(), opts.timeout || 15000) : null;
  try {
    return await fetchJson(`${API_BASE}${path}`, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      signal: opts.signal || (controller && controller.signal),
      ...opts,
    });
  } finally {
    if (id) clearTimeout(id);
  }
}

export function getJSON(path, opts) {
  return jsonFetch(path, opts);
}

export function getQuests({ signal } = {}) {
  const key = userKey("quests");
  const cached = cacheGet(key);
  if (cached) return Promise.resolve(cached);
  return jsonFetch("/api/quests", { signal }).then((data) => {
    cacheSet(key, data);
    return data;
  });
}

export function getLeaderboard({ signal } = {}) {
  const cached = cacheGet("leaderboard");
  if (cached) return Promise.resolve(cached);
  return jsonFetch("/api/leaderboard", { signal }).then((data) => {
    cacheSet("leaderboard", data);
    return data; // { entries, total }
  });
}

/**
 * Shape returned from GET /api/users/me.
 * @typedef {Object} MeResponse
 * @property {string} wallet
 * @property {number} xp
 * @property {string} level
 * @property {number} levelProgress
 * @property {Object} socials
 * @property {{connected:boolean, username:(string|null)}} socials.telegram
 * @property {{connected:boolean, username:(string|null), id:(string|null)}} socials.twitter
 * @property {{connected:boolean, username:(string|null), id:(string|null)}} socials.discord
 */

/**
 * Fetch the current user's profile.
 * @param {Object} [opts]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<MeResponse>}
 */
export async function getMe({ signal, force } = {}) {
  const key = userKey("me");
  if (!force) {
    const cached = cacheGet(key);
    if (cached) return Promise.resolve(cached);
  }
  return jsonFetch("/api/users/me", { signal }).then((data) => {
    const user = data && typeof data === 'object' && 'user' in data ? data.user : data;
    if (user) cacheSet(key, user);
    return user;
  });
}

export async function postJSON(path, body, opts = {}) {
  return jsonFetch(path, { method: "POST", body: JSON.stringify(body ?? {}), ...opts });
}

export function claimQuest(id, opts = {}) {
  return postJSON(`/api/quests/${id}/claim`, {}, opts).then((res) => {
    clearUserCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('profile-updated'));
    }
    return res;
  });
}

export function submitProof(
  id,
  { wallet, vendor = "link", url },
  opts = {}
) {
  return postJSON(`/api/quests/${id}/proofs`, { wallet, vendor, url }, opts).then(
    (res) => {
    clearUserCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('profile-updated'));
    }
    return res;
  });
}

// UI-only helper for showing projected XP; backend still awards the truth.
export function tierMultiplier(tier) {
  const t = String(tier || '').toLowerCase();
  if (t.includes('tier 3')) return 1.25;
  if (t.includes('tier 2')) return 1.10;
  return 1.0; // Free or unknown
}

export function bindWallet(wallet, opts = {}) {
  return postJSON("/api/session/bind-wallet", { wallet }, opts).then((res) => {
    clearUserCache();
    return res;
  });
}

export function getSubscription(opts = {}) {
  return getJSON("/api/subscription", opts);
}

export function startTelegram(opts = {}) {
  return postJSON("/api/auth/telegram/start", {}, opts);
}

export function startDiscord(opts = {}) {
  return postJSON("/api/auth/discord/start", {}, opts);
}

export function startTwitter(opts = {}) {
  return postJSON("/api/auth/twitter/start", {}, opts);
}

export function getReferralInfo(opts = {}) {
  return getJSON("/api/referral/me", opts);
}

export function createReferral(opts = {}) {
  return postJSON("/api/referral/create", {}, opts);
}

export function applyReferral(code, opts = {}) {
  return postJSON("/api/referral/apply", { code }, opts);
}

export function getReferralsList(opts = {}) {
  return getJSON("/api/referral/list", opts);
}

export function getReferralStatus(opts = {}) {
  return getJSON("/api/referral/status", opts);
}

export const api = {
  base: API_BASE,
  getQuests,
  getLeaderboard,
  getMe,
  bindWallet,
  getSubscription,
  startTelegram,
  startDiscord,
  startTwitter,
  claimQuest,
  submitProof,
  clearUserCache,
  getReferralInfo,
  createReferral,
  applyReferral,
  getReferralsList,
  getReferralStatus,
  postJSON,
  get: getJSON,
  getJSON,
  post: postJSON,
  withSignal,
};
