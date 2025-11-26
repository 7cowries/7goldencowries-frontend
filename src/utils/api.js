// src/utils/api.js

// All frontend API calls go directly to the Render backend (production).
// Prefer environment configuration but fall back to the hosted backend.
import { API_BASE as CONFIG_API_BASE } from "../config";

const PUBLIC_BASE =
  CONFIG_API_BASE || "https://sevengoldencowries-backend.onrender.com";

export const RAW_API_BASE = PUBLIC_BASE;
export const API_BASE = PUBLIC_BASE;

// Central list of canonical endpoints. Prefer these everywhere.
// Only add fallbacks when we *know* they exist.
export const API_URLS = {
  // Social OAuth starts
  twitterStart: joinPath(API_BASE, "/api/auth/twitter/start"),
  discordStart: joinPath(API_BASE, "/api/auth/discord/start"),
  telegramEmbedAuth: joinPath(API_BASE, "/api/auth/telegram/callback"),

  health: "/api/health",
  me: "/api/auth/me",

  auth: {
    walletSession: "/api/auth/wallet/session",
    logoutCandidates: [
      "/api/v1/auth/logout",
      "/api/auth/wallet/logout",
      "/api/auth/session/logout",
    ],
  },

  quests: {
    list: "/api/quests",
    claim: "/api/quests/claim",
    submitProof: "/api/quests/proof",
    verify: {
      twitterFollow: "/api/quests/verify/twitter/follow",
      twitterRetweet: "/api/quests/verify/twitter/retweet",
      twitterQuote: "/api/quests/verify/twitter/quote",
    },
  },

  referrals: {
    claim: "/api/referrals/claim",
  },

  subscriptions: {
    // Canonical v1 endpoints
    status: "/api/v1/subscription/status",
    subscribe: "/api/v1/subscription/subscribe",
    claimBonus: "/api/v1/subscription/claim",
  },

  leaderboard: "/api/leaderboard",

  tokenSale: {
    // Canonical token sale start endpoint under /api/v1
    start: "/api/v1/token-sale/start",
  },

  wallet: {
    bind: "/api/auth/wallet/session",
  },
};

const defaultHeaders = {
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

/**
 * Join base + path safely, with some protection for double /api.
 */
function joinPath(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  let p = path || "";

  if (!b) return p;
  if (!p) return b;

  // Avoid /api/api/... when base already ends with /api and path starts with /api
  if (b.endsWith("/api") && p.startsWith("/api")) {
    p = p.replace(/^\/api/, "");
  }

  if (p.startsWith("/")) return `${b}${p}`;
  return `${b}/${p}`;
}

async function req(method, path, body, options = {}) {
  const url = joinPath(API_BASE, path);
  const opts = {
    method,
    credentials: "include",
    signal: options.signal,
    ...(method !== "GET"
      ? { headers: defaultHeaders, body: JSON.stringify(body || {}) }
      : {}),
  };

  const res = await fetch(url, opts);
  return res;
}

export async function getJSON(path) {
  const r = await req("GET", path);
  if (!r.ok) throw new Error(`GET ${path} ${r.status}`);
  return r.json();
}

export async function postJSON(path, body) {
  const r = await req("POST", path, body);
  if (!r.ok) throw new Error(`POST ${path} ${r.status}`);
  return r.json();
}

/**
 * Try a list of candidate paths until one returns 200–299.
 * Only use this where we *really* need to probe multiple legacy paths.
 */
async function fetchFirst(method, candidates, body, options = {}) {
  let lastErr;
  for (const p of candidates) {
    try {
      const r = await req(method, p, body, options);
      if (r.ok) return r.json();
      lastErr = new Error(`${method} ${p} ${r.status}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    `No working endpoint among: ${candidates.join(", ")}${
      lastErr ? " — " + lastErr : ""
    }`
  );
}

/* ---------------- High-level helpers ---------------- */

let _meCache = null;

/**
 * Fetch the current session-aware user profile.
 * Prefer /api/me, but fall back to /me if it exists.
 */
export async function getMe({ force = false } = {}) {
  if (!force && _meCache) return _meCache;

  const candidates = [API_URLS.me, "/api/me", "/me"];
  _meCache = await fetchFirst("GET", candidates);
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

/**
 * Try a few logout endpoints; succeed as soon as one works.
 */
export async function disconnectSession() {
  const sets = [
    API_URLS.auth.logoutCandidates,
    ["/api/v1/auth/logout", "/api/auth/wallet/logout", "/api/auth/session/logout"],
  ];

  for (const list of sets) {
    try {
      await fetchFirst("POST", list, {});
      clearUserCache();
      return { ok: true };
    } catch (_) {
      // keep trying
    }
  }

  clearUserCache();
  return { ok: false };
}

/**
 * Bind a TON wallet to the current backend session.
 * We probe both /api/... and root /auth/... variants in case the
 * routes are mounted differently.
 */
export async function bindWallet(address) {
  const payload = { address };

  const candidates = [
    API_URLS.wallet.bind,          // /api/auth/wallet/session
    "/api/auth/wallet",           // legacy
    "/api/auth/session/wallet",   // legacy
    "/auth/wallet/session",       // non-/api mount
    "/auth/wallet",               // extra fallback
  ];

  return fetchFirst("POST", candidates, payload);
}

/* ---------------- Quests ---------------- */

export async function getQuests() {
  // Quests list has a single canonical endpoint; keep some safe fallbacks.
  const candidates = [API_URLS.quests.list, "/api/quests", "/quests"];
  return fetchFirst("GET", candidates);
}

/**
 * IMPORTANT: use the canonical /api/quests/claim only so that
 * real backend errors surface clearly (400, 401, etc.).
 */
export async function claimQuest(key) {
  return postJSON(API_URLS.quests.claim, { key });
}

export async function verifyTwitterFollow({ questId, handle, url }) {
  const payload = { questId, handle, url };
  const candidates = [
    API_URLS.quests.verify.twitterFollow,
    "/quests/verify/twitter/follow",
  ];
  return fetchFirst("POST", candidates, payload);
}

export async function verifyTwitterRetweet({ questId, url }) {
  const payload = { questId, url };
  const candidates = [
    API_URLS.quests.verify.twitterRetweet,
    "/quests/verify/twitter/retweet",
  ];
  return fetchFirst("POST", candidates, payload);
}

export async function verifyTwitterQuote({ questId, url, text }) {
  const payload = { questId, url, text };
  const candidates = [
    API_URLS.quests.verify.twitterQuote,
    "/quests/verify/twitter/quote",
  ];
  return fetchFirst("POST", candidates, payload);
}

export async function submitProof(key, proof) {
  return postJSON(API_URLS.quests.submitProof, { key, proof });
}

/* ---------------- Referrals ---------------- */

export async function claimReferralReward(refCode) {
  // Canonical POST /api/referrals/claim
  return postJSON(API_URLS.referrals.claim, { refCode });
}

/* ---------------- Subscriptions ---------------- */

export async function getSubscriptionStatus({ signal } = {}) {
  // Canonical GET /api/v1/subscription/status
  const candidates = [API_URLS.subscriptions.status, "/subscriptions/status"];
  return fetchFirst("GET", candidates, undefined, { signal });
}

export async function subscribeToTier({ tier, txHash, tonPaid, usdPaid, wallet }) {
  const payload = { tier, txHash, tonPaid, usdPaid, wallet };
  const candidates = [API_URLS.subscriptions.subscribe, "/subscriptions/subscribe"];
  return fetchFirst("POST", candidates, payload);
}

export async function claimSubscriptionBonus() {
  const candidates = [API_URLS.subscriptions.claimBonus, "/subscriptions/claim-bonus"];
  return fetchFirst("POST", candidates, {});
}

// Alias used elsewhere in the app
export const claimSubscriptionReward = claimSubscriptionBonus;

/* ---------------- Leaderboard ---------------- */

export async function getLeaderboard() {
  const candidates = [API_URLS.leaderboard, "/api/leaderboard", "/leaderboard"];
  return fetchFirst("GET", candidates);
}

/* ---------------- Token sale ---------------- */

/**
 * Start a token sale contribution flow.
 *
 * We deliberately call a *single* canonical endpoint so that any problems
 * show up as a simple "POST /api/token-sale/start 4xx/5xx" instead of
 * "No working endpoint among ...".
 */
export async function startTokenSalePurchase(payload) {
  const candidates = [API_URLS.tokenSale.start, "/api/token-sale/start"];
  return fetchFirst("POST", candidates, payload);
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
