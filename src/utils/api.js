export const API_BASE = (() => {
  const raw =
    (typeof window !== "undefined" && window.__API_BASE) ||
    process.env.REACT_APP_API_URL ||
    "";
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) {
    console.warn(
      "[api] Ignoring cross-origin API_BASE; falling back to same-origin requests."
    );
    return "";
  }
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
})();

export const API_URLS = {
  twitterStart: `${API_BASE}/api/auth/twitter/start`,
  discordStart: `${API_BASE}/api/auth/discord/start`,
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function resolvePath(path = "") {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE}${path}` || path;
  return `${API_BASE}/${path}`;
}

function shouldRetry(res) {
  return !!res && (res.status === 502 || res.status === 503 || res.status === 504);
}

async function buildHttpError(res) {
  let msg = `HTTP ${res.status}`;
  try {
    const data = await res.clone().json();
    const detail = data?.error ?? data?.message ?? JSON.stringify(data);
    if (detail && detail !== "{}" && detail !== "null") {
      msg += `: ${detail}`;
    }
  } catch (err) {
    try {
      const text = await res.clone().text();
      if (text) msg += `: ${text}`;
    } catch (_) {
      /* ignore */
    }
  }
  const error = new Error(msg);
  error.status = res.status;
  return error;
}

async function requestJSON(path, opts = {}) {
  const {
    method = "GET",
    body,
    headers,
    signal,
    timeout = 15000,
    retries = 1,
    ...rest
  } = opts;

  const url = resolvePath(path);
  let attempt = 0;

  while (attempt <= retries) {
    const controller = signal ? null : new AbortController();
    const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;
    const finalSignal = signal || controller?.signal;

    const options = {
      method,
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      signal: finalSignal,
      ...rest,
    };

    if (body !== undefined) options.body = body;

    try {
      const res = await fetch(url, options);

      if (shouldRetry(res) && attempt < retries) {
        attempt += 1;
        if (timer) clearTimeout(timer);
        await sleep(400);
        continue;
      }

      if (res.status === 304) {
        if (timer) clearTimeout(timer);
        return null;
      }

      if (!res.ok) {
        if (timer) clearTimeout(timer);
        throw await buildHttpError(res);
      }

      if (res.status === 204) {
        if (timer) clearTimeout(timer);
        return null;
      }

      const data = await res.json();
      if (timer) clearTimeout(timer);
      return data;
    } catch (err) {
      if (timer) clearTimeout(timer);

      if (err?.name === "AbortError") {
        throw err;
      }

      if (err instanceof TypeError) {
        if (attempt < retries) {
          attempt += 1;
          await sleep(400);
          continue;
        }
        const networkError = new Error("Network error: Failed to fetch");
        networkError.cause = err;
        throw networkError;
      }

      if (err instanceof Error) {
        throw err;
      }

      throw new Error(String(err));
    }
  }

  throw new Error("Request failed");
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

function normalizeErrorCode(value) {
  if (value == null) return value;
  return String(value).trim().toLowerCase().replace(/_/g, "-");
}

function normalizeResponse(res) {
  if (!res || typeof res !== "object") return res;
  const next = { ...res };
  if ("error" in next && next.error != null) {
    next.error = normalizeErrorCode(next.error);
  }
  if ("code" in next && next.code != null) {
    next.code = normalizeErrorCode(next.code);
  }
  return next;
}

export function getJSON(path, opts = {}) {
  return requestJSON(path, opts);
}

export function postJSON(path, body, opts = {}) {
  return requestJSON(path, {
    ...opts,
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export function getQuests({ signal } = {}) {
  const key = userKey("quests");
  const cached = cacheGet(key);
  if (cached) return Promise.resolve(cached);
  return getJSON("/api/quests", { signal }).then((data) => {
    cacheSet(key, data);
    return data;
  });
}

export function getLeaderboard({ signal } = {}) {
  const cached = cacheGet("leaderboard");
  if (cached) return Promise.resolve(cached);
  return getJSON("/api/leaderboard", { signal }).then((data) => {
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
  return getJSON("/api/users/me", { signal }).then((data) => {
    const user = data && typeof data === "object" && "user" in data ? data.user : data;
    if (user) cacheSet(key, user);
    return user;
  });
}

export function claimQuest(id, opts = {}) {
  return postJSON(`/api/quests/${id}/claim`, {}, opts).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return normalizeResponse(res);
  });
}

export function claimSubscriptionReward({ questId } = {}, opts = {}) {
  return postJSON(
    "/api/v1/subscription/claim",
    questId ? { questId } : {},
    opts
  ).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return normalizeResponse(res);
  });
}

export function claimSubscriptionBonus(opts = {}) {
  return postJSON("/api/v1/subscription/claim", {}, opts).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return res;
  });
}

export function claimReferralReward({ questId } = {}, opts = {}) {
  return postJSON(
    "/api/referral/claim",
    questId ? { questId } : {},
    opts
  ).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return normalizeResponse(res);
  });
}

export function submitProof(id, { url }, opts = {}) {
  return postJSON(`/api/quests/${id}/proofs`, { url }, opts).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return normalizeResponse(res);
  });
}

export function disconnectSession(opts = {}) {
  return postJSON("/api/session/disconnect", {}, opts).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return normalizeResponse(res);
  });
}

// UI-only helper for showing projected XP; backend still awards the truth.
export function tierMultiplier(tier) {
  const t = String(tier || "").toLowerCase();
  if (t.includes("tier 3")) return 1.25;
  if (t.includes("tier 2")) return 1.1;
  return 1.0; // Free or unknown
}

export function bindWallet(wallet, opts = {}) {
  return postJSON("/api/session/bind-wallet", { wallet }, opts).then((res) => {
    clearUserCache();
    return res;
  });
}

export function startTokenSalePurchase({ wallet, amount }, opts = {}) {
  return postJSON(
    "/api/v1/token-sale/purchase",
    { wallet, amount },
    opts
  );
}

export function getSubscription(opts = {}) {
  return getJSON("/api/v1/subscription", opts);
}

export function getSubscriptionStatus(opts = {}) {
  return getJSON("/api/v1/subscription/status", opts);
}

export function subscribeToTier({ wallet, tier }, opts = {}) {
  return postJSON(
    "/api/v1/subscription/subscribe",
    { wallet, tier },
    opts
  );
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
  disconnectSession,
  startTokenSalePurchase,
  getSubscription,
  getSubscriptionStatus,
  subscribeToTier,
  claimSubscriptionBonus,
  startTelegram,
  startDiscord,
  startTwitter,
  claimQuest,
  claimSubscriptionReward,
  claimReferralReward,
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
