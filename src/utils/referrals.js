// src/utils/referrals.js
// Client helpers for referral codes & stats
import { api } from "./api";

/**
 * Get or create my referral code.
 */
export async function getReferralCode() {
  const data = await api.get("/api/referral/me");
  return data?.code || data?.referralCode || data?.referral_code || "";
}

/**
 * Accept (claim) a referral code.
 * @param {string} code referral code to accept
 */
export async function acceptReferral(code) {
  return api.post("/api/referral/apply", { code }); // { status: 'linked'|'already_linked'|error }
}

/**
 * Fetch my referral stats & referees.
 */
export async function getReferralStats() {
  const data = await api.get("/api/referral/list");
  return {
    code: data?.code || data?.referralCode || "",
    referees: data?.entries || data?.referrals || [],
  };
}
