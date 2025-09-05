// src/utils/socialLinks.js
// Helpers for linking/unlinking socials (Twitter, Telegram, Discord)
import { api } from "./api";

/**
 * Unlink a connected social account.
 * @param {'twitter'|'telegram'|'discord'} provider
 */
export async function unlinkSocial(provider) {
  return api.post(`/api/social/${provider}/unlink`); // { ok: true } or { error }
}

/**
 * Resync (refresh) a connected social account.
 * Useful if handles change.
 * @param {'twitter'|'telegram'|'discord'} provider
 */
export async function resyncSocial(provider) {
  return api.post(`/api/social/${provider}/resync`); // { ok: true, handle: '...' }
}
