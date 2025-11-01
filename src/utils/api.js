// src/utils/api.js

// Keep same-origin calls. In prod this is "/api" via rewrite; locally you can set it too.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

/** Canonical endpoints; helpers below will fall back if needed */
export const API_URLS = {
  health: "/api/health",
  me: "/api/me",
  auth: {
    walletSession: "/api/auth/wallet/session",
    logoutCandidates: [
      "/api/auth/logout",
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
    status: "/api/subscriptions/status",
    subscribe: "/api/subscriptions/upsert", // ← real BE route
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

async function req(method, path, body) {
  const url = `${API_BASE}${path}`;
  const init =
    method === "GET"
      ? { method, credentials: "include" }
      : {
          method,
          credentials: "include",
          headers: defaultHeaders,
          body: JSON.stringify(body || {}),
        };
  const res = await fetch(url, init);
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

/** Try candidates until one returns 2xx */
async function fetchFirst(method, candidates, body) {
  let lastErr;
  for (const p of candidates) {
    try {
      const r = await req(method, p, body);
      if (r.ok) return r.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    `No working endpoint among: ${candidates.join(", ")}${
      lastErr ? " — " + lastErr : ""
    }`,
  );
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
  ];
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
    ["/api/auth/logout", "/api/auth/wallet/logout", "/api/auth/session/logout"],
  ];
  for (const list of sets) {
    try {
      await fetchFirst("POST", list, {});
      clearUserCache();
      return { ok: true };
    } catch {}
  }
  clearUserCache();
  return { ok: false };
}

export async function bindWallet(address) {
  const candidates = [
    API_URLS.wallet.bind, // POST {address}
    "/api/auth/wallet",
  ];
  return fetchFirst("POST", candidates, { address });
}

/* Quests (backend may return [] if none seeded) */
export async function getQuests() {
  const candidates = [API_URLS.quests.list];
  return fetchFirst("GET", candidates);
}
export async function claimQuest(key) {
  const candidates = [API_URLS.quests.claim];
  return fetchFirst("POST", candidates, { key });
}
export async function submitProof(key, proof) {
  const candidates = [API_URLS.quests.submitProof];
  return fetchFirst("POST", candidates, { key, proof });
}

/* Referrals */
export async function claimReferralReward(refCode) {
  const candidates = [API_URLS.referrals.claim];
  return fetchFirst("POST", candidates, { refCode });
}

/* Subscriptions */
export async function getSubscriptionStatus() {
  const candidates = [
    API_URLS.subscriptions.status,
    "/api/subscription/status",
  ];
  return fetchFirst("GET", candidates);
}
export async function subscribeToTier({ tier, txHash, tonPaid, usdPaid }) {
  // The backend expects { tier, provider, tx_id } at /api/subscriptions/upsert.
  // Accept both shapes for convenience.
  const payload =
    txHash || tonPaid || usdPaid
      ? { tier, txHash, tonPaid, usdPaid }
      : { tier };
  const candidates = [
    API_URLS.subscriptions.subscribe,
    "/api/subscriptions/activate",
  ];
  return fetchFirst("POST", candidates, payload);
}
export async function claimSubscriptionBonus() {
  const candidates = [
    API_URLS.subscriptions.claimBonus,
    "/api/subscription/claim-bonus",
  ];
  return fetchFirst("POST", candidates, {});
}
// Back-compat alias some pages import:
export const claimSubscriptionReward = claimSubscriptionBonus;

/* Leaderboard */
export async function getLeaderboard() {
  const candidates = [API_URLS.leaderboard];
  return fetchFirst("GET", candidates);
}

/* Token sale */
export async function startTokenSalePurchase(payload) {
  const candidates = [API_URLS.tokenSale.start];
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
