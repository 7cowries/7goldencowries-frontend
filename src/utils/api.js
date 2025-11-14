// src/utils/api.js

// All frontend API calls go directly to the Render backend.
const PUBLIC_BASE = "https://sevengoldencowries-backend.onrender.com";

export const RAW_API_BASE = PUBLIC_BASE;
export const API_BASE = PUBLIC_BASE;

export const API_URLS = {
  health: "/api/health",
  me: "/api/me",
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
  },
  referrals: { claim: "/api/referrals/claim" },
  subscriptions: {
    status: "/subscriptions/status",         // root-level route works in curl
    subscribe: "/subscriptions/subscribe",
    claimBonus: "/subscriptions/claim-bonus",
  },
  leaderboard: "/api/leaderboard",
  tokenSale: { start: "/api/token-sale/start" },
  wallet: { bind: "/api/auth/wallet/session" },
};

const defaultHeaders = {
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

function joinPath(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  let p = path || "";

  if (!b) return p;
  if (!p) return b;

  if (b.endsWith("/api") && p.startsWith("/api")) {
    p = p.replace(/^\/api/, "");
  }

  if (p.startsWith("/")) return `${b}${p}`;
  return `${b}/${p}`;
}

async function req(method, path, body) {
  const url = joinPath(API_BASE, path);
  const opts = {
    method,
    credentials: "include",
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

/** Try a list of candidate paths until one returns 200–299 */
async function fetchFirst(method, candidates, body) {
  let lastErr;
  for (const p of candidates) {
    try {
      const r = await req(method, p, body);
      if (r.ok) return r.json();
      // remember last non-OK response as an Error-like message
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

/* -------- High-level helpers -------- */

let _meCache = null;

export async function getMe({ force = false } = {}) {
  if (!force && _meCache) return _meCache;

  // Prefer /api/me, but fall back to /me if needed
  const candidates = [API_URLS.me, "/me"];
  _meCache = await fetchFirst("GET", candidates);
  return _meCache;
}

export function clearUserCache() {
  _meCache = null;
  try {
    sessionStorage.removeItem("me");
    localStorage.removeItem("me");
  } catch {}
}

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
    } catch (_) {}
  }
  clearUserCache();
  return { ok: false };
}

export async function bindWallet(address) {
  const candidates = [
    API_URLS.wallet.bind,
    "/api/auth/wallet",
    "/api/auth/session/wallet",
  ];
  return fetchFirst("POST", candidates, { address });
}

/* Quests */
export async function getQuests() {
  const candidates = [
    API_URLS.quests.list,
    "/api/quests",
    "/quests",
  ];
  return fetchFirst("GET", candidates);
}

// IMPORTANT: use the canonical /api/quests/claim only,
// so real backend errors surface instead of "No working endpoint among"
export async function claimQuest(key) {
  return postJSON(API_URLS.quests.claim, { key });
}

export async function submitProof(key, proof) {
  return postJSON(API_URLS.quests.submitProof, { key, proof });
}

/* Referrals */

// Canonical POST /api/referrals/claim
export async function claimReferralReward(refCode) {
  return postJSON(API_URLS.referrals.claim, { refCode });
}

/* Subscriptions */

// Canonical GET /subscriptions/status (no preflight issues)
export async function getSubscriptionStatus() {
  return getJSON(API_URLS.subscriptions.status);
}

// Canonical POST /subscriptions/subscribe
export async function subscribeToTier({ tier, txHash, tonPaid, usdPaid }) {
  const payload = { tier, txHash, tonPaid, usdPaid };
  return postJSON(API_URLS.subscriptions.subscribe, payload);
}

// Canonical POST /subscriptions/claim-bonus
export async function claimSubscriptionBonus() {
  return postJSON(API_URLS.subscriptions.claimBonus, {});
}

export const claimSubscriptionReward = claimSubscriptionBonus;

/* Leaderboard */
export async function getLeaderboard() {
  const candidates = [API_URLS.leaderboard, "/api/leaderboard", "/leaderboard"];
  return fetchFirst("GET", candidates);
}

/* Token sale */
export async function startTokenSalePurchase(payload) {
  const candidates = [
    API_URLS.tokenSale.start,
    "/api/tokensale/start",
    "/token-sale/start",
    "/tokensale/start",
  ];
  return fetchFirst("POST", candidates, payload);
}

/* Tier multiplier helpers */
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
