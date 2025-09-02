// src/utils/socialQuests.js
// Handles client calls for Telegram & Discord join verification quests
import { api } from "./api";

/**
 * Verify Telegram join.
 * @param {'group'|'channel'} [target] optional
 */
export async function verifyTelegramJoin(target) {
  const { data } = await api.post(
    "/api/quests/telegram/join/verify",
    target ? { target } : {}
  );
  return data; // { ok, results: [...] }
}

/**
 * Verify Discord join quest.
 */
export async function verifyDiscordJoin() {
  const { data } = await api.post("/api/quests/discord/join/verify");
  return data; // { status, xp } or { error }
}
