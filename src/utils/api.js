export const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE) ||
  process.env.REACT_APP_API_URL ||
  "";

// Prebuilt URLs for starting OAuth or embedding auth widgets
export const API_URLS = {
  twitterStart: `${API_BASE}/auth/twitter`,
  discordStart: `${API_BASE}/auth/discord`,
  // Used by the Telegram login widget (data-auth-url)
  telegramEmbedAuth: `${API_BASE}/auth/telegram/callback`,
};

export function withSignal(ms = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(id),
  };
}

export async function jsonFetch(path, opts = {}) {
  const controller = opts.signal ? null : new AbortController();
  const id = controller ? setTimeout(() => controller.abort(), opts.timeout || 15000) : null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: opts.method || "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      signal: opts.signal || (controller && controller.signal),
      ...opts,
    });
    if (!res.ok) {
      let text = await res.text().catch(() => "");
      try {
        text = JSON.stringify(JSON.parse(text));
      } catch {}
      throw new Error(`HTTP ${res.status} ${res.statusText} – ${text}`);
    }
    if (res.status === 204) return null;
    return res.json();
  } finally {
    if (id) clearTimeout(id);
  }
}

export function getJSON(path, opts) {
  return jsonFetch(path, opts);
}

export function getQuests({ signal } = {}) {
  return jsonFetch("/api/quests", { signal });
}

export function getLeaderboard({ signal } = {}) {
  return jsonFetch("/api/leaderboard", { signal });
}

/**
 * Shape returned from GET /api/users/me.
 * @typedef {Object} MeResponse
 * @property {string} wallet
 * @property {number} xp
 * @property {string} level
 * @property {number} levelProgress
 * @property {Object} socials
 * @property {{connected:boolean, username:(string|null)}} socials.telegram
 * @property {{connected:boolean, username:(string|null), id:(string|null)}} socials.twitter
 * @property {{connected:boolean, username:(string|null), id:(string|null)}} socials.discord
 */

/**
 * Fetch the current user's profile.
 * @param {Object} [opts]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<MeResponse>}
 */
export async function getMe({ signal } = {}) {
  return jsonFetch("/api/users/me", { signal });
}

export async function postJSON(path, body, opts = {}) {
  return jsonFetch(path, { method: "POST", body: JSON.stringify(body ?? {}), ...opts });
}

export function claimQuest(id, opts = {}) {
  return postJSON("/api/quests/claim", { questId: id }, opts);
}

export function bindWallet(wallet, opts = {}) {
  return postJSON("/api/session/bind-wallet", { wallet }, opts);
}

export function getSubscription(opts = {}) {
  return getJSON("/api/subscription", opts);
}

export function startTelegram(opts = {}) {
  return postJSON("/api/auth/telegram/start", {}, opts);
}

export function startDiscord(opts = {}) {
  return postJSON("/api/auth/discord/start", {}, opts);
}

export function startTwitter(opts = {}) {
  return postJSON("/api/auth/twitter/start", {}, opts);
}

export function getReferralInfo(opts = {}) {
  return getJSON("/api/referral/me", opts);
}

export function createReferral(opts = {}) {
  return postJSON("/api/referral/create", {}, opts);
}

export function applyReferral(code, opts = {}) {
  return postJSON("/api/referral/apply", { code }, opts);
}

export function getReferralsList(opts = {}) {
  return getJSON("/api/referral/list", opts);
}

export const api = {
  base: API_BASE,
  getQuests,
  getLeaderboard,
  getMe,
  bindWallet,
  getSubscription,
  startTelegram,
  startDiscord,
  startTwitter,
  claimQuest,
  getReferralInfo,
  createReferral,
  applyReferral,
  getReferralsList,
  postJSON,
  get: getJSON,
  getJSON,
  post: postJSON,
  withSignal,
};
