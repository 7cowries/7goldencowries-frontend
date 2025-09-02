// src/utils/referrals.js
// Client helpers for referral codes & stats
import { api } from "./api";

/**
 * Get or create my referral code.
 */
export async function getReferralCode() {
  const { data } = await api.get("/api/referrals/code");
  return data.code;
}

/**
 * Accept (claim) a referral code.
 * @param {string} code referral code to accept
 */
export async function acceptReferral(code) {
  const { data } = await api.post("/api/referrals/accept", { code });
  return data; // { status: 'linked'|'already_linked'|error }
}

/**
 * Fetch my referral stats & referees.
 */
export async function getReferralStats() {
  const { data } = await api.get("/api/referrals/stats");
  return data; // { code, referees: [...] }
}
