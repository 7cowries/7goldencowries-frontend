// src/utils/api.js
export const API_BASE = "";

/** Canonical endpoints (used first); helpers below will auto-fallback to alternates if 404 */
export const API_URLS = {
  health: "/api/health",
  me: "/api/me",
  auth: {
    walletSession: "/api/auth/wallet/session",
    logoutCandidates: ["/api/auth/logout", "/api/auth/wallet/logout", "/api/auth/session/logout"]
  },
  quests: {
    list: "/api/quests",
    claim: "/api/quests/claim",
    submitProof: "/api/quests/proof"
  },
  referrals: { claim: "/api/referrals/claim" },
  subscriptions: {
    status: "/api/subscriptions/status",
    subscribe: "/api/subscriptions/subscribe",
    claimBonus: "/api/subscriptions/claim-bonus"
  },
  leaderboard: "/api/leaderboard",
  tokenSale: { start: "/api/token-sale/start" },
  wallet: { bind: "/api/auth/wallet/session" }
};

const defaultHeaders = {
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

async function req(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    ...(method !== "GET" ? { headers: defaultHeaders, body: JSON.stringify(body || {}) } : {}),
  });
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
    } catch (e) { lastErr = e; }
  }
  throw new Error(`No working endpoint among: ${candidates.join(", ")}${lastErr ? " — " + lastErr : ""}`);
}

/* -------- High-level helpers (with fallbacks) -------- */

// Cache for /me
let _meCache = null;

export async function getMe({ force = false } = {}) {
  if (!force && _meCache) return _meCache;
  const candidates = [
    API_URLS.me,
    "/api/user/me",
    "/api/users/me",
    "/api/profile",
    "/me",
    "/user/me",
    "/users/me",
  ];
  _meCache = await fetchFirst("GET", candidates);
  return _meCache;
}

export function clearUserCache() {
  _meCache = null;
  try { sessionStorage.removeItem("me"); localStorage.removeItem("me"); } catch {}
}

export async function disconnectSession() {
  const sets = [
    API_URLS.auth.logoutCandidates,
    ["/auth/logout", "/auth/wallet/logout", "/auth/session/logout"],
  ];
  for (const list of sets) {
    try { await fetchFirst("POST", list, {}); clearUserCache(); return { ok: true }; }
    catch (_) {}
  }
  clearUserCache();
  return { ok: false };
}

export async function bindWallet(wallet) {
  const candidates = [
    API_URLS.wallet.bind,
    "/auth/wallet/session",
    "/auth/session/wallet",
    "/api/auth/wallet",
  ];
  return fetchFirst("POST", candidates, { wallet });
}

/* Quests */
export async function getQuests() {
  const candidates = [API_URLS.quests.list, "/quests"];
  return fetchFirst("GET", candidates);
}
export async function claimQuest(key) {
  const candidates = [API_URLS.quests.claim, "/quests/claim", "/api/quest/claim"];
  return fetchFirst("POST", candidates, { key });
}
export async function submitProof(key, proof) {
  const candidates = [API_URLS.quests.submitProof, "/quests/proof"];
  return fetchFirst("POST", candidates, { key, proof });
}

/* Referrals */
export async function claimReferralReward(refCode) {
  const candidates = [API_URLS.referrals.claim, "/referrals/claim", "/api/referral/claim"];
  return fetchFirst("POST", candidates, { refCode });
}

/* Subscriptions */
export async function getSubscriptionStatus() {
  const candidates = [API_URLS.subscriptions.status, "/subscriptions/status", "/api/subscription/status"];
  return fetchFirst("GET", candidates);
}
export async function subscribeToTier({ tier, txHash, tonPaid, usdPaid }) {
  const candidates = [API_URLS.subscriptions.subscribe, "/subscriptions/activate", "/api/subscriptions/activate"];
  return fetchFirst("POST", candidates, { tier, txHash, tonPaid, usdPaid });
}
export async function claimSubscriptionBonus() {
  const candidates = [API_URLS.subscriptions.claimBonus, "/subscriptions/claim-bonus", "/api/subscription/claim-bonus"];
  return fetchFirst("POST", candidates, {});
}
// Back-compat alias some pages import:
export const claimSubscriptionReward = claimSubscriptionBonus;

/* Leaderboard */
export async function getLeaderboard() {
  const candidates = [API_URLS.leaderboard, "/leaderboard"];
  return fetchFirst("GET", candidates);
}

/* Token sale */
export async function startTokenSalePurchase(payload) {
  const candidates = [API_URLS.tokenSale.start, "/token-sale/start", "/api/tokensale/start"];
  return fetchFirst("POST", candidates, payload);
}

/* Tier multiplier helpers */
export function tierMultiplier(tier) {
  switch ((tier || "").toLowerCase()) {
    case "tier 3": return 1.5;
    case "tier 2": return 1.25;
    case "tier 1": return 1.10;
    default: return 1.0; // Free / unknown
  }
}
