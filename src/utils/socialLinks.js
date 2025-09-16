// src/utils/socialLinks.js
// Helpers for linking/unlinking socials (Twitter, Telegram, Discord)
import { clearUserCache, postJSON } from "./api";

/**
 * Unlink a connected social account.
 * @param {'twitter'|'telegram'|'discord'} provider
 * @param {Object} [opts]
 * @param {Object} [opts.body]
 * @returns {Promise<any>}
 */
export async function unlinkSocial(provider, opts = {}) {
  const { body, ...fetchOpts } = opts || {};
  const res = await postJSON(
    `/api/social/${provider}/unlink`,
    body ?? {},
    fetchOpts
  );
  clearUserCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("profile-updated"));
  }
  return res;
}

/**
 * Resync (refresh) a connected social account.
 * Useful if handles change.
 * @param {'twitter'|'telegram'|'discord'} provider
 */
export async function resyncSocial(provider, opts = {}) {
  const { body, ...fetchOpts } = opts || {};
  return postJSON(`/api/social/${provider}/resync`, body ?? {}, fetchOpts);
}
