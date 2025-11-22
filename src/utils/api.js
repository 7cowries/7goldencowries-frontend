// src/utils/api.js
// Centralized API client with a single configurable base URL.

const ENV_API_BASE =
  (process.env.REACT_APP_API_BASE || process.env.NEXT_PUBLIC_API_BASE || "").trim();

/**
 * Normalize a base URL from environment variables. Supports:
 *   • Absolute URLs (https://example.com)
 *   • Relative prefixes (/api, api)
 *   • Blank value for same-origin requests
 */
function normalizeBase(raw) {
  if (!raw) return "";
  const value = raw.replace(/\s+/g, "");
  if (/^https?:\/\//i.test(value)) {
    return value.replace(/\/+$/, "");
  }
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  return withSlash.replace(/\/+$/, "");
}

export const API_BASE = normalizeBase(ENV_API_BASE);

export const API_URLS = {
  health: "/api/health",
  me: "/api/me",
  twitterStart: "/api/auth/twitter/start",
  discordStart: "/api/auth/discord/start",
  telegramEmbedAuth: "/api/auth/telegram/callback",
  auth: {
    walletSession: "/api/auth/wallet/session",
    logout: "/api/auth/session/logout",
  },
  quests: {
    list: "/api/quests",
    claim: "/api/quests/claim",
    submitProof: "/api/quests/proof",
  },
  referrals: {
    list: "/api/referrals/",
    claim: "/api/referrals/claim",
  },
  subscriptions: {
    status: "/subscriptions/status",
    subscribe: "/subscriptions/subscribe",
    claimBonus: "/subscriptions/claim-bonus",
  },
  leaderboard: "/api/leaderboard",
  tokenSale: {
    start: "/api/token-sale/start",
  },
  wallet: {
    bind: "/api/auth/wallet/session",
  },
};

const defaultHeaders = {
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

function joinPath(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!b) return p;
  // Avoid /api/api/... when base already ends with /api
  if (b.endsWith("/api") && p.startsWith("/api")) {
    return `${b}${p.replace(/^\/api/, "")}`;
  }
  return `${b}${p}`;
}

async function request(method, path, { body, signal } = {}) {
  const url = joinPath(API_BASE, path);
  const options = {
    method,
    credentials: "include",
    signal,
    ...(method !== "GET"
      ? { headers: defaultHeaders, body: body ? JSON.stringify(body) : undefined }
      : {}),
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`${method} ${path} ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getJSON(path, options) {
  return request("GET", path, options);
}

export function postJSON(path, body, options) {
  return request("POST", path, { ...options, body });
}

/* ---------------- High-level helpers ---------------- */

let _meCache = null;

export async function getMe({ force = false, signal } = {}) {
  if (!force && _meCache) return _meCache;
  _meCache = await getJSON(API_URLS.me, { signal });
  return _meCache;
}

export function clearUserCache() {
  _meCache = null;
  try {
    sessionStorage.removeItem("me");
    localStorage.removeItem("me");
  } catch {
    // ignore storage errors
  }
}

export async function disconnectSession(signal) {
  try {
    await postJSON(API_URLS.auth.logout, {}, { signal });
  } finally {
    clearUserCache();
  }
  return { ok: true };
}

export async function bindWallet(address, options = {}) {
  return postJSON(API_URLS.wallet.bind, { address }, options);
}

/* ---------------- Quests ---------------- */

export function getQuests(options) {
  return getJSON(API_URLS.quests.list, options);
}

export function claimQuest(key, options) {
  return postJSON(API_URLS.quests.claim, { key }, options);
}

export function submitProof(key, proof, options) {
  return postJSON(API_URLS.quests.submitProof, { key, proof }, options);
}

/* ---------------- Referrals ---------------- */

export function listReferrals(options) {
  return getJSON(API_URLS.referrals.list, options);
}

export function claimReferralReward(refCode, options) {
  return postJSON(API_URLS.referrals.claim, { refCode }, options);
}

/* ---------------- Subscriptions ---------------- */

export function getSubscriptionStatus(options) {
  return getJSON(API_URLS.subscriptions.status, options);
}

export function subscribeToTier({ tier, txHash, tonPaid, usdPaid }, options) {
  return postJSON(
    API_URLS.subscriptions.subscribe,
    { tier, txHash, tonPaid, usdPaid },
    options
  );
}

export function claimSubscriptionBonus(options) {
  return postJSON(API_URLS.subscriptions.claimBonus, {}, options);
}

export const claimSubscriptionReward = claimSubscriptionBonus;

/* ---------------- Leaderboard ---------------- */

export function getLeaderboard(options) {
  return getJSON(API_URLS.leaderboard, options);
}

/* ---------------- Token sale ---------------- */

export function startTokenSalePurchase(payload, options) {
  return postJSON(API_URLS.tokenSale.start, payload, options);
}

/* ---------------- Tier multiplier helpers ---------------- */

export function tierMultiplier(tier) {
  switch ((tier || "").toLowerCase()) {
    case "tier 3":
      return 1.5;
    case "tier 2":
      return 1.25;
    case "tier 1":
      return 1.1;
    default:
      return 1.0;
  }
}

// Simple facade for debugging / tests
export const api = {
  base: API_BASE,
  urls: API_URLS,
  getJSON,
  postJSON,
};
