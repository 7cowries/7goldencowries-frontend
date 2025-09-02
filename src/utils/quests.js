import { api } from "./api";

// Start a link quest by id or code
export async function startLinkQuest(idOrCode) {
  const { data } = await api.post(`/api/quests/${idOrCode}/link/start`);
  if (data?.redirectUrl) window.open(data.redirectUrl, "_blank", "noopener");
  return data; // { redirectUrl, minSeconds, nonce } or { status:'already_completed' }
}

// Finish after countdown
export async function finishLinkQuest(idOrCode) {
  const { data } = await api.post(`/api/quests/${idOrCode}/link/finish`);
  return data; // { status, xp }
}

// Verify Telegram join
export async function verifyTelegramJoin() {
  const { data } = await api.post("/api/quests/telegram/join/verify");
  return data; // { status, xp }
}

// Verify Discord join
export async function verifyDiscordJoin() {
  const { data } = await api.post("/api/quests/discord/join/verify");
  return data; // { status, xp }
}
