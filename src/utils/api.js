// src/utils/api.js
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // <-- export for legacy imports

export const API_URLS = {
  health: "/api/health",
  me: "/api/me",
  auth: {
    walletSession: "/api/auth/wallet/session",
    logoutCandidates: ["/api/auth/logout", "/api/auth/wallet/logout", "/api/auth/session/logout"]
  },
  quests: { list: "/api/quests", claim: "/api/quests/claim", submitProof: "/api/quests/proof" },
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

const defaultHeaders = { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" };

async function req(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    ...(method !== "GET" ? { headers: defaultHeaders, body: JSON.stringify(body || {}) } : {}),
  });
  return res;
}

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

export async function getJSON(path){ const r=await req("GET",path); if(!r.ok) throw new Error(`GET ${path} ${r.status}`); return r.json(); }
export async function postJSON(path,body){ const r=await req("POST",path,body); if(!r.ok) throw new Error(`POST ${path} ${r.status}`); return r.json(); }

// ---- High-level helpers
let _meCache=null;
export async function getMe({force=false}={}) {
  if(!force && _meCache) return _meCache;
  const candidates=[API_URLS.me,"/api/user/me","/api/users/me","/api/profile","/me","/user/me","/users/me"];
  _meCache=await fetchFirst("GET",candidates); return _meCache;
}

export function clearUserCache(){ _meCache=null; try{sessionStorage.removeItem("me"); localStorage.removeItem("me");}catch{} }

export async function disconnectSession(){
  const sets=[API_URLS.auth.logoutCandidates, ["/auth/logout","/auth/wallet/logout","/auth/session/logout"]];
  for(const list of sets){ try{ await fetchFirst("POST", list, {}); clearUserCache(); return {ok:true}; } catch{} }
  clearUserCache(); return {ok:false};
}

export async function bindWallet(address){
  const candidates=[API_URLS.wallet.bind,"/auth/wallet/session","/auth/session/wallet","/api/auth/wallet"];
  // Support both {address} and {wallet} payload shapes
  return fetchFirst("POST", candidates, { address, wallet: address });
}

// Quests
export async function getQuests(){ return fetchFirst("GET",[API_URLS.quests.list,"/quests"]); }
export async function claimQuest(key){ return fetchFirst("POST",[API_URLS.quests.claim,"/quests/claim","/api/quest/claim"],{key}); }
export async function submitProof(key,proof){ return fetchFirst("POST",[API_URLS.quests.submitProof,"/quests/proof"],{key,proof}); }

// Referrals
export async function claimReferralReward(refCode){ return fetchFirst("POST",[API_URLS.referrals.claim,"/referrals/claim","/api/referral/claim"],{refCode}); }

// Subscriptions (live upsert)
export async function upsertSubscription({ tier, provider="TON", tx_id, tonPaid, usdPaid }){
  const body = { tier, provider, tx_id, tonPaid, usdPaid };
  const candidates = ["/api/subscriptions/upsert", API_URLS.subscriptions.subscribe, "/subscriptions/activate", "/api/subscriptions/activate"];
  return fetchFirst("POST", candidates, body);
}
export async function getSubscriptionStatus(){
  return fetchFirst("GET",[API_URLS.subscriptions.status,"/subscriptions/status","/api/subscription/status"]);
}
export async function claimSubscriptionBonus(){
  return fetchFirst("POST",[API_URLS.subscriptions.claimBonus,"/subscriptions/claim-bonus","/api/subscription/claim-bonus"],{});
}

// Back-compat for existing code:
export const subscribeToTier = upsertSubscription; // <-- alias expected by Subscription.jsx
export const claimSubscriptionReward = claimSubscriptionBonus; // legacy name

// Leaderboard
export async function getLeaderboard(){ return fetchFirst("GET",[API_URLS.leaderboard,"/leaderboard"]); }

// Token sale
export async function startTokenSalePurchase(payload){ return fetchFirst("POST",[API_URLS.tokenSale.start,"/token-sale/start","/api/tokensale/start"],payload); }

// Multipliers
export function tierMultiplier(tier){
  switch((tier||"").toLowerCase()){
    case "tier 3": return 1.5;
    case "tier 2": return 1.25;
    case "tier 1": return 1.10;
    default: return 1.0;
  }
}
