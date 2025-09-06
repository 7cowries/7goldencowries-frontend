export const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE) ||
  process.env.REACT_APP_API_URL ||
  "";

// Prebuilt URLs for starting OAuth or embedding auth widgets
export const API_URLS = {
  twitterStart: `${API_BASE}/auth/twitter`,
  discordStart: `${API_BASE}/auth/discord`,
  // Used by the Telegram login widget (data-auth-url)
  telegramEmbedAuth: `${API_BASE}/auth/telegram/callback`,
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
  const res = await fetch(url, { credentials: 'include', cache: 'no-store', ...(options || {}) });
  if  (res.status === 304) return null;
  if (!res.ok) throw new Error('HTTP ' + res.status);
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
    return data;
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
export async function getMe({ signal } = {}) {
  const key = userKey("me");
  const cached = cacheGet(key);
  if (cached) return Promise.resolve(cached);
  return jsonFetch("/api/users/me", { signal }).then((data) => {
    if (data) cacheSet(key, data);
    return data;
  });
}

export async function postJSON(path, body, opts = {}) {
  return jsonFetch(path, { method: "POST", body: JSON.stringify(body ?? {}), ...opts });
}

export function claimQuest(id, opts = {}) {
  return postJSON(`/api/quests/${id}/claim`, {}, opts).then((res) => {
    clearUserCache();
    return res;
  });
}

export function submitQuestProof(id, url, opts = {}) {
  return postJSON(`/api/quests/${id}/proofs`, { url }, opts).then((res) => {
    clearUserCache();
    return res;
  });
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
  submitQuestProof,
  clearUserCache,
  getReferralInfo,
  createReferral,
  applyReferral,
  getReferralsList,
  postJSON,
  get: getJSON,
  getJSON,
  post: postJSON,
  withSignal,
};
