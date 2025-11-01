// src/utils/api.js

// raw env from Next (Vercel)
export const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

// normalized base
// examples:
//  ""      -> ""
//  "/api"  -> "/api"
//  "https://sevengoldencowries-backend.onrender.com" -> that
export const API_BASE = RAW_API_BASE.trim().replace(/\/$/, "") || "";

/**
 * Build the final URL to call.
 * Important: when API_BASE === "/api" and the path already starts with "/api/",
 * we must NOT produce "/api/api/...". We just return the path.
 */
function buildUrl(path) {
  if (!API_BASE) return path;
  if (API_BASE === "/api" && path.startsWith("/api/")) {
    return path; // avoid /api/api/...
  }
  return `${API_BASE}${path}`;
}

const defaultHeaders = {
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

async function req(method, path, body) {
  const url = buildUrl(path);
  const init =
    method === "GET"
      ? {
          method,
          credentials: "include",
        }
      : {
          method,
          credentials: "include",
          headers: defaultHeaders,
          body: JSON.stringify(body || {}),
        };

  const res = await fetch(url, init);
  return res;
}

// ---- canonical FE <-> BE routes we prefer ----
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
  referrals: {
    claim: "/api/referrals/claim",
  },
  subscriptions: {
    status: "/api/subscriptions/status",
    subscribe: "/api/subscriptions/subscribe",
    claimBonus: "/api/subscriptions/claim-bonus",
    upsert: "/api/subscriptions/upsert",
  },
  leaderboard: "/api/leaderboard",
  tokenSale: {
    start: "/api/token-sale/start",
  },
  wallet: {
    bind: "/api/auth/wallet/session",
  },
};

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
 * Try candidates until one works (200-299).
 * Used to stay compatible with older BE deployments.
 */
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
    }`
  );
}

// ---- user / session ----
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
  try {
    sessionStorage.removeItem("me");
  } catch {}
  try {
    localStorage.removeItem("me");
  } catch {}
}

export async function disconnectSession() {
  const candidateSets = [
    API_URLS.auth.logoutCandidates,
    ["/auth/logout", "/auth/wallet/logout", "/auth/session/logout"],
  ];
  for (const list of candidateSets) {
    try {
      await fetchFirst("POST", list, {});
      clearUserCache();
      return { ok: true };
    } catch (_) {}
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
  return fetchFirst("POST", candidates, { address: wallet, wallet });
}

// ---- quests ----
export async function getQuests() {
  const candidates = [API_URLS.quests.list, "/quests"];
  return fetchFirst("GET", candidates);
}

export async function claimQuest(key) {
  const candidates = [
    API_URLS.quests.claim,
    "/quests/claim",
    "/api/quest/claim",
  ];
  return fetchFirst("POST", candidates, { key });
}

export async function submitProof(key, proof) {
  const candidates = [API_URLS.quests.submitProof, "/quests/proof"];
  return fetchFirst("POST", candidates, { key, proof });
}

// ---- referrals ----
export async function claimReferralReward(refCode) {
  const candidates = [
    API_URLS.referrals.claim,
    "/referrals/claim",
    "/api/referral/claim",
  ];
  return fetchFirst("POST", candidates, { refCode });
}

// ---- subscriptions ----
export async function getSubscriptionStatus() {
  const candidates = [
    API_URLS.subscriptions.status,
    "/subscriptions/status",
    "/api/subscription/status",
  ];
  return fetchFirst("GET", candidates);
}

export async function subscribeToTier({ tier, txHash, tonPaid, usdPaid }) {
  // our BE has /api/subscriptions/upsert wired
  const body = {
    tier,
    txHash,
    tonPaid,
    usdPaid,
  };
  const candidates = [
    API_URLS.subscriptions.subscribe,
    API_URLS.subscriptions.upsert,
    "/subscriptions/activate",
    "/api/subscriptions/activate",
  ];
  return fetchFirst("POST", candidates, body);
}

export async function claimSubscriptionBonus() {
  const candidates = [
    API_URLS.subscriptions.claimBonus,
    "/subscriptions/claim-bonus",
    "/api/subscription/claim-bonus",
  ];
  return fetchFirst("POST", candidates, {});
}

// Back-compat name some pages use
export const claimSubscriptionReward = claimSubscriptionBonus;

// ---- leaderboard ----
export async function getLeaderboard() {
  const candidates = [API_URLS.leaderboard, "/leaderboard"];
  return fetchFirst("GET", candidates);
}

// ---- token sale ----
export async function startTokenSalePurchase(payload) {
  const candidates = [
    API_URLS.tokenSale.start,
    "/token-sale/start",
    "/api/tokensale/start",
  ];
  return fetchFirst("POST", candidates, payload);
}

// ---- helpers ----
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

