// src/utils/socialLinks.js
// Helpers for linking/unlinking socials (Twitter, Telegram, Discord)
import { api } from "./api";

/**
 * Unlink a connected social account.
 * @param {'twitter'|'telegram'|'discord'} provider
 */
export async function unlinkSocial(provider) {
  const { data } = await api.post(`/api/social/${provider}/unlink`);
  return data; // { ok: true } or { error }
}

/**
 * Resync (refresh) a connected social account.
 * Useful if handles change.
 * @param {'twitter'|'telegram'|'discord'} provider
 */
export async function resyncSocial(provider) {
  const { data } = await api.post(`/api/social/${provider}/resync`);
  return data; // { ok: true, handle: '...' } or { error }
}
