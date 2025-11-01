// src/utils/api.js

// We build all paths WITH a leading /api/... and let Next.js rewrite /api → Render.
// To avoid accidental double-prefixing (/api/api), we normalize in one place here.

const PUBLIC_BASE = ""; // do NOT use NEXT_PUBLIC_API_BASE
export const RAW_API_BASE = PUBLIC_BASE; // back-compat for old imports
export const API_BASE = PUBLIC_BASE;

// Canonical endpoints (always start with /api/..)
export const API_URLS = {
  health: "/api/health",
  me: "/api/me",
  auth: {
    walletSession: "/api/auth/wallet/session",
    logoutCandidates: ["/api/auth/logout", "/api/auth/wallet/logout", "/api/auth/session/logout"],
  },
  quests: {
    list: "/api/quests",
    claim: "/api/quests/claim",
    submitProof: "/api/quests/proof",
  },
  referrals: { claim: "/api/referrals/claim" },
  subscriptions: {
    status: "/api/subscriptions/status",
    subscribe: "/api/subscriptions/subscribe",
    claimBonus: "/api/subscriptions/claim-bonus",
  },
  leaderboard: "/api/leaderboard",
  tokenSale: { start: "/api/token-sale/start" },
  wallet: { bind: "/api/auth/wallet/session" },
};

const defaultHeaders = {
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

// Normalize base+path (drops a duplicate /api if someone passed it in by mistake)
function joinPath(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  let p = path || "";
  // If base already ends with /api and path begins with /api, drop one /api
  if (b.endsWith("/api") && p.startsWith("/api")) {
    p = p.replace(/^\/api/, "");
  }
  const url = `${b}${p}`;
  return url.replace(/\/{2,}/g, "/"); // collapse accidental double slashes
}

async function req(method, path, body) {
  const url = joinPath(API_BASE, path);
  const opts = {
    method,
    credentials: "include",
    ...(method !== "GET" ? { headers: defaultHeaders, body: JSON.stringify(body || {}) } : {}),
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
    ["/api/auth/logout", "/api/auth/wallet/logout", "/api/auth/session/logout"],
  ];
  for (const list of sets) {
    try { await fetchFirst("POST", list, {}); clearUserCache(); return { ok: true }; }
    catch (_) {}
  }
  clearUserCache();
  return { ok: false };
}

export async function bindWallet(address) {
  const candidates = [
    API_URLS.wallet.bind,
    "/api/auth/wallet/session",
    "/api/auth/session/wallet",
    "/api/auth/wallet",
  ];
  return fetchFirst("POST", candidates, { address });
}

/* Quests */
export async function getQuests() {
  const candidates = [API_URLS.quests.list, "/api/quests"];
  return fetchFirst("GET", candidates);
}
export async function claimQuest(key) {
  const candidates = [API_URLS.quests.claim, "/api/quest/claim"];
  return fetchFirst("POST", candidates, { key });
}
export async function submitProof(key, proof) {
  const candidates = [API_URLS.quests.submitProof, "/api/quests/proof"];
  return fetchFirst("POST", candidates, { key, proof });
}

/* Referrals */
export async function claimReferralReward(refCode) {
  const candidates = [API_URLS.referrals.claim, "/api/referral/claim"];
  return fetchFirst("POST", candidates, { refCode });
}

/* Subscriptions */
export async function getSubscriptionStatus() {
  const candidates = [API_URLS.subscriptions.status, "/api/subscription/status"];
  return fetchFirst("GET", candidates);
}
export async function subscribeToTier({ tier, txHash, tonPaid, usdPaid }) {
  const candidates = [API_URLS.subscriptions.subscribe, "/api/subscriptions/activate"];
  return fetchFirst("POST", candidates, { tier, txHash, tonPaid, usdPaid });
}
export async function claimSubscriptionBonus() {
  const candidates = [API_URLS.subscriptions.claimBonus, "/api/subscription/claim-bonus"];
  return fetchFirst("POST", candidates, {});
}
// Back-compat alias:
export const claimSubscriptionReward = claimSubscriptionBonus;

/* Leaderboard */
export async function getLeaderboard() {
  const candidates = [API_URLS.leaderboard, "/api/leaderboard"];
  return fetchFirst("GET", candidates);
}

/* Token sale */
export async function startTokenSalePurchase(payload) {
  const candidates = [API_URLS.tokenSale.start, "/api/tokensale/start"];
  return fetchFirst("POST", candidates, payload);
}

/* Tier multiplier helpers */
export function tierMultiplier(tier) {
  switch ((tier || "").toLowerCase()) {
    case "tier 3": return 1.5;
    case "tier 2": return 1.25;
    case "tier 1": return 1.10;
    default: return 1.0;
  }
}
