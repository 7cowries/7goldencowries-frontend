// src/utils/api.js
// Centralized API client built around a single configurable base URL.

const RAW_API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "";

function normalizeBase(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return "";
  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(withoutTrailingSlash)) return withoutTrailingSlash;
  return withoutTrailingSlash.startsWith("/")
    ? withoutTrailingSlash
    : `/${withoutTrailingSlash}`;
}

export const API_BASE = normalizeBase(RAW_API_BASE);

// Canonical endpoints; these should match backend routes.
export const API_URLS = {
  base: API_BASE,
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
    claim: "/api/referrals/claim",
    list: "/api/referrals/",
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
  const p = path || "";
  if (!b) return p;
  if (!p) return b;
  if (b.endsWith("/api") && p.startsWith("/api")) {
    return `${b}${p.replace(/^\/api/, "")}`;
  }
  if (p.startsWith("/")) return `${b}${p}`;
  return `${b}/${p}`;
}

async function req(method, path, { body, signal, headers } = {}) {
  const url = joinPath(API_BASE, path);
  const opts = {
    method,
    credentials: "include",
    signal,
    ...(method !== "GET"
      ? { headers: { ...defaultHeaders, ...(headers || {}) }, body: JSON.stringify(body || {}) }
      : { headers: headers || {} }),
  };
  const res = await fetch(url, opts);
  return res;
}

export async function getJSON(path, options = {}) {
  const { signal } = options;
  const r = await req("GET", path, { signal });
  if (!r.ok) throw new Error(`GET ${path} ${r.status}`);
  return r.json();
}

export async function postJSON(path, body, options = {}) {
  const { signal, headers } = options;
  const r = await req("POST", path, { body, signal, headers });
  if (!r.ok) throw new Error(`POST ${path} ${r.status}`);
  return r.json();
}

/* ---------------- High-level helpers ---------------- */

let _meCache = null;

export function clearUserCache() {
  _meCache = null;
  try {
    sessionStorage.removeItem("me");
    localStorage.removeItem("me");
  } catch {
    // ignore storage errors
  }
}

export async function getMe({ force = false, signal } = {}) {
  if (!force && _meCache) return _meCache;
  _meCache = await getJSON(API_URLS.me, { signal });
  return _meCache;
}

export async function disconnectSession() {
  try {
    await postJSON(API_URLS.auth.logout, {});
    clearUserCache();
    return { ok: true };
  } catch (err) {
    clearUserCache();
    return { ok: false, error: err?.message };
  }
}

export async function bindWallet(address, options = {}) {
  const payload = { address };
  return postJSON(API_URLS.wallet.bind, payload, options);
}

/* ---------------- Quests ---------------- */

export async function getQuests(options = {}) {
  return getJSON(API_URLS.quests.list, options);
}

export async function claimQuest(key, options = {}) {
  return postJSON(API_URLS.quests.claim, { key }, options);
}

export async function submitProof(key, proof, options = {}) {
  return postJSON(API_URLS.quests.submitProof, { key, proof }, options);
}

/* ---------------- Referrals ---------------- */

export async function claimReferralReward(refCode, options = {}) {
  return postJSON(API_URLS.referrals.claim, { refCode }, options);
}

export async function getReferralEntries(options = {}) {
  return getJSON(API_URLS.referrals.list, options);
}

/* ---------------- Subscriptions ---------------- */

export async function getSubscriptionStatus(options = {}) {
  return getJSON(API_URLS.subscriptions.status, options);
}

export async function subscribeToTier({ tier, txHash, tonPaid, usdPaid }, options = {}) {
  const payload = { tier, txHash, tonPaid, usdPaid };
  return postJSON(API_URLS.subscriptions.subscribe, payload, options);
}

export async function claimSubscriptionBonus(options = {}) {
  return postJSON(API_URLS.subscriptions.claimBonus, {}, options);
}

export const claimSubscriptionReward = claimSubscriptionBonus;

/* ---------------- Leaderboard ---------------- */

export async function getLeaderboard(options = {}) {
  return getJSON(API_URLS.leaderboard, options);
}

/* ---------------- Token sale ---------------- */

export async function startTokenSalePurchase(payload, options = {}) {
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
