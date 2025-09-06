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
    const res = await fetch(`${API_BASE}${path}`, {
      method: opts.method || "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      signal: opts.signal || (controller && controller.signal),
      ...opts,
    });
    if (!res.ok) {
      let text = await res.text().catch(() => "");
      try {
        text = JSON.parse(text);
      } catch {
        // leave as string
      }
      const msg = typeof text === "string" ? text : JSON.stringify(text);
      const err = new Error(`HTTP ${res.status} ${res.statusText} – ${msg}`);
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) return null;
    return res.json();
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
    cacheSet(key, data);
    return data;
  });
}

export async function postJSON(path, body, opts = {}) {
  return jsonFetch(path, { method: "POST", body: JSON.stringify(body ?? {}), ...opts });
}

export function claimQuest(wallet, questId, opts = {}) {
  return postJSON("/api/quests/claim", { wallet, questId }, opts).then((res) => {
    clearUserCache();
    return res;
  });
}

export function submitProof(wallet, questId, url, opts = {}) {
  return postJSON("/api/quests/submit-proof", { wallet, questId, url }, opts).then(
    (res) => {
      clearUserCache();
      return res;
    }
  );
}

export function getProofStatus(wallet, questId, opts = {}) {
  const params = new URLSearchParams({ wallet: wallet || "", questId });
  return getJSON(`/api/quests/proof-status?${params.toString()}`, opts);
}

export function getProfile(wallet, opts = {}) {
  // wallet param reserved for future use; current endpoint uses session
  return getMe(opts);
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
  submitProof,
  getProofStatus,
  getProfile,
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
