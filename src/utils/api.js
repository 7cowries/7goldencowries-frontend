import { guardedBind } from './bind-guard';
/* global globalThis */
function normalizeBase(rawValue) {
  const value = typeof rawValue === "string" ? rawValue.trim() : "";
  if (!value) return "";

  const stripTrailing = (input) =>
    input.endsWith("/") ? input.replace(/\/+$/, "") : input;

  if (/^https?:\/\//i.test(value)) {
    return stripTrailing(value);
  }

  if (value.startsWith("/")) {
    return stripTrailing(value);
  }

  return stripTrailing(`/${value}`);
}

function normalizeErrorCode(value) {
  if (value == null) return undefined;
  const str = String(value).trim();
  if (!str) return undefined;
  return str.toLowerCase().replace(/[\s_]+/g, "-");
}

export class ApiError extends Error {
  constructor({ message, code, error, status, details, cause } = {}) {
    const fallbackMessage = message || "Request failed";
    super(fallbackMessage);
    this.name = "ApiError";
    const normalizedCode =
      normalizeErrorCode(code || error) || "request-failed";
    this.code = normalizedCode;
    this.error = normalizedCode;
    if (status != null) {
      this.status = status;
    }
    if (cause) {
      this.cause = cause;
    }
    if (details !== undefined) {
      this.details = details;
    }
    this.message = fallbackMessage;
  }

  toJSON() {
    return {
      error: this.error,
      code: this.code,
      message: this.message,
      status: this.status ?? null,
    };
  }
}

const RAW_API_BASE =
  (typeof window !== "undefined" && window.__API_BASE) ||
  process.env.REACT_APP_API_URL ||
  "";

export const API_BASE = ""; // via vercel.json rewrite

const DEFAULT_API_PREFIX = "/api";

function parseBaseComponents(base) {
  const value = typeof base === "string" ? base : "";
  if (!value) {
    return { isAbsolute: false, origin: "", path: "" };
  }
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const path = url.pathname.replace(/\/+$/, "");
      return { isAbsolute: true, origin: url.origin, path };
    } catch (err) {
      return { isAbsolute: false, origin: "", path: value };
    }
  }
  return { isAbsolute: false, origin: "", path: value.replace(/\/+$/, "") };
}

const BASE_COMPONENTS = parseBaseComponents(API_BASE);

export const API_URLS = {
  twitterStart: resolvePath("/api/auth/twitter/start"),
  discordStart: resolvePath("/api/auth/discord/start"),
  telegramEmbedAuth: resolvePath("/api/auth/telegram/callback"),
};

export function withSignal(ms = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(id),
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function combinePaths(basePath, targetPath) {
  const normalizedBase =
    !basePath || basePath === "/"
      ? ""
      : `/${basePath.replace(/^\/+/u, "").replace(/\/+$/u, "")}`;
  const normalizedTarget = targetPath.startsWith("/")
    ? targetPath
    : `/${targetPath}`;

  if (!normalizedBase) {
    return normalizedTarget;
  }

  if (
    normalizedTarget === normalizedBase ||
    normalizedTarget.startsWith(`${normalizedBase}/`)
  ) {
    return normalizedTarget;
  }

  return `${normalizedBase}${normalizedTarget}`;
}

function resolvePath(path = "") {
  const raw = typeof path === "string" ? path : "";
  if (!raw) {
    if (BASE_COMPONENTS.isAbsolute) {
      return `${BASE_COMPONENTS.origin}${BASE_COMPONENTS.path || ""}`;
    }
    return API_BASE || DEFAULT_API_PREFIX;
  }
  if (/^https?:\/\//i.test(raw)) return raw;

  if (BASE_COMPONENTS.isAbsolute) {
    const combined = combinePaths(
      BASE_COMPONENTS.path,
      raw.startsWith("/") ? raw : `/${raw}`
    );
    return `${BASE_COMPONENTS.origin}${combined}`;
  }

  if (API_BASE) {
    return combinePaths(API_BASE, raw.startsWith("/") ? raw : `/${raw}`);
  }

  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  if (
    normalized === DEFAULT_API_PREFIX ||
    normalized.startsWith(`${DEFAULT_API_PREFIX}/`)
  ) {
    return normalized;
  }
  return `${DEFAULT_API_PREFIX}${normalized}`;
}

function shouldRetry(res) {
  return !!res && (res.status === 502 || res.status === 503 || res.status === 504);
}

async function readErrorBody(res) {
  if (!res) {
    return { data: null, text: "" };
  }
  try {
    const clone = typeof res.clone === "function" ? res.clone() : res;
    const data = await clone.json();
    return { data, text: "" };
  } catch (_) {
    try {
      const clone = typeof res.clone === "function" ? res.clone() : res;
      const text = await clone.text();
      return { data: null, text };
    } catch (err) {
      return { data: null, text: "" };
    }
  }
}

async function buildHttpError(res) {
  const status = res?.status ?? 0;
  const { data, text } = await readErrorBody(res);
  let details = null;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    details = normalizeResponse(data);
  }

  const payloadMessage = (() => {
    if (details) {
      const fields = ["message", "detail", "error"];
      for (const field of fields) {
        const value = details[field];
        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
      }
    }
    if (typeof text === "string" && text.trim()) {
      return text.trim();
    }
    if (typeof data === "string" && data.trim()) {
      return data.trim();
    }
    return "";
  })();

  const derivedCode =
    (details && (details.code || details.error)) ||
    (status ? `http-${status}` : "request-failed");
  const normalizedCode = normalizeErrorCode(derivedCode) || "request-failed";
  const message =
    payloadMessage ||
    (status ? `Request failed with status ${status}` : "Request failed");

  return new ApiError({
    message,
    code: normalizedCode,
    error: normalizedCode,
    status,
    details: details || (text ? { text } : null),
  });
}

const inflightRequests = new Map();

function safeStringify(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (value instanceof URLSearchParams) return value.toString();
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (err) {
      return String(value);
    }
  }
  return String(value);
}

async function requestJSON(path, opts = {}) {
  const {
    method = "GET",
    body,
    headers,
    signal,
    timeout = 15000,
    retries = 1,
    dedupe = true,
    dedupeKey,
    ...rest
  } = opts;

  const url = resolvePath(path);
  const methodName = String(method || "GET").toUpperCase();
  const shouldDedupe = dedupe !== false && !signal;
  const keyBody = body === undefined ? "" : safeStringify(body);
  const key = shouldDedupe
    ? dedupeKey || `${methodName}:${url}:${keyBody}`
    : null;

  if (key && inflightRequests.has(key)) {
    return inflightRequests.get(key);
  }

  const execute = async () => {
    let attempt = 0;

    while (attempt <= retries) {
      const controller = signal ? null : new AbortController();
      const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;
      const finalSignal = signal || controller?.signal;

      const finalHeaders = { ...(headers || {}) };
      if (
        !Object.keys(finalHeaders).some(
          (key) => String(key).toLowerCase() === "content-type"
        )
      ) {
        finalHeaders["Content-Type"] = "application/json";
      }
      finalHeaders["Cache-Control"] = "no-store";

      const options = {
        method: methodName,
        credentials: "include",
        cache: "no-store",
        headers: finalHeaders,
        signal: finalSignal,
        ...rest,
      };

      if (body !== undefined) options.body = body;

      try {
        const res = await fetch(url, options);

        if (shouldRetry(res) && attempt < retries) {
          attempt += 1;
          if (timer) clearTimeout(timer);
          await sleep(400);
          continue;
        }

        if (res.status === 304) {
          if (timer) clearTimeout(timer);
          return null;
        }

        if (!res.ok) {
          if (timer) clearTimeout(timer);
          throw await buildHttpError(res);
        }

        if (res.status === 204) {
          if (timer) clearTimeout(timer);
          return null;
        }

        const data = await res.json();
        const normalized = normalizeResponse(data);
        if (timer) clearTimeout(timer);
        return normalized;
      } catch (err) {
        if (timer) clearTimeout(timer);

        if (err?.name === "AbortError") {
          throw err;
        }

        if (err instanceof ApiError) {
          throw err;
        }

        if (err instanceof TypeError) {
          if (attempt < retries) {
            attempt += 1;
            await sleep(400);
            continue;
          }
          throw new ApiError({
            message: "Network error: Failed to fetch",
            code: "network-error",
            error: "network-error",
            cause: err,
          });
        }

        if (err instanceof Error) {
          throw new ApiError({
            message: err.message,
            code: err.code,
            error: err.error,
            cause: err,
          });
        }

        throw new ApiError({ message: String(err) });
      }
    }

    throw new ApiError({ message: "Request failed" });
  };

  let pending = execute();
  if (key) {
    pending = pending.finally(() => {
      inflightRequests.delete(key);
    });
    inflightRequests.set(key, pending);
  }

  return pending;
}

// simple in-memory cache with 60s TTL
const _cache = new Map();
const CACHE_TTL = 60000;

function userKey(key) {
  const w =
    typeof window !== "undefined" && window.localStorage
      ? window.localStorage.getItem("wallet")
      : null;
  return w ? `${key}:${w}` : key;
}

function cacheGet(key) {
  const hit = _cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.t > CACHE_TTL) {
    _cache.delete(key);
    return null;
  }
  return hit.v;
}

function cacheSet(key, value) {
  _cache.set(key, { t: Date.now(), v: value });
}

export function clearUserCache() {
  ["quests", "me"].forEach((k) => _cache.delete(userKey(k)));
}

function normalizeResponse(res) {
  if (!res || typeof res !== "object") return res;
  if (Array.isArray(res)) return res;
  const next = { ...res };
  if ("error" in next && next.error != null) {
    next.error = normalizeErrorCode(next.error);
  }
  if ("code" in next && next.code != null) {
    next.code = normalizeErrorCode(next.code);
  }
  return next;
}

export function getJSON(path, opts = {}) {
  // quick client-side cache for subscription status to avoid stampede
  try {
    if (path === "/api/v1/subscription/status") {
      if (!globalThis.__subStatusCache) globalThis.__subStatusCache = { t: 0, v: null };
      const now = Date.now();
      if (globalThis.__subStatusCache.v !== null && (now - globalThis.__subStatusCache.t) < 2000) {
        return Promise.resolve(globalThis.__subStatusCache.v);
      }
    }
  } catch (e) {
    // noop - fail safe
  }

  return requestJSON(path, opts).then((r) => {
    try {
      if (path === "/api/v1/subscription/status") {
        if (!globalThis.__subStatusCache) globalThis.__subStatusCache = { t: 0, v: null };
        globalThis.__subStatusCache.t = Date.now();
        globalThis.__subStatusCache.v = r;
      }
    } catch (e) {}
    return r;
  });
}


export function postJSON(path, body, opts = {}) {
  return requestJSON(path, {
    ...opts,
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export function getQuests({ signal } = {}) {
  const key = userKey("quests");
  const cached = cacheGet(key);
  if (cached) return Promise.resolve(cached);
  return getJSON("/api/quests", { signal }).then((data) => {
    cacheSet(key, data);
    return data;
  });
}

export function getLeaderboard({ signal } = {}) {
  const cached = cacheGet("leaderboard");
  if (cached) return Promise.resolve(cached);
  return getJSON("/api/leaderboard", { signal }).then((data) => {
    cacheSet("leaderboard", data);
    return data; // { entries, total }
  });
}

/**
 * Shape returned from GET /api/me.
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
export async function getMe({ signal, force } = {}) {
  const key = userKey("me");
  if (!force) {
    const cached = cacheGet(key);
    if (cached) return Promise.resolve(cached);
  }
  return getJSON("/api/users/me", { signal })
    .catch((err) => {
      // Older deployments exposed the profile at /api/me; fall back if the new route is missing
      if (err instanceof ApiError && err.status === 404) {
        return getJSON("/api/me", { signal });
      }
      throw err;
    })
    .then((data) => {
      const user = data && typeof data === "object" && "user" in data ? data.user : data;
      if (user) cacheSet(key, user);
      return user;
    });
      }
      throw err;
    })
    .then((data) => {
      const user = data && typeof data === "object" && "user" in data ? data.user : data;
      if (user) cacheSet(key, user);
      return user;
    });
}

export function claimQuest(id, opts = {}) {
  return postJSON(`/api/quests/${id}/claim`, {}, opts).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return normalizeResponse(res);
  });
}

export function claimSubscriptionReward({ questId } = {}, opts = {}) {
  return postJSON(
    "/api/v1/subscription/claim",
    questId ? { questId } : {},
    opts
  ).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return normalizeResponse(res);
  });
}

export function claimSubscriptionBonus(opts = {}) {
  return postJSON("/api/v1/subscription/claim", {}, opts).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return normalizeResponse(res);
  });
}

export function claimReferralReward({ questId } = {}, opts = {}) {
  return postJSON(
    "/api/referral/claim",
    questId ? { questId } : {},
    opts
  ).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return normalizeResponse(res);
  });
}

export function submitProof(id, { url }, opts = {}) {
  return postJSON(`/api/quests/${id}/proofs`, { url }, opts).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return normalizeResponse(res);
  });
}

export function disconnectSession(opts = {}) {
  return postJSON("/api/session/disconnect", {}, opts).then((res) => {
    clearUserCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }
    return normalizeResponse(res);
  });
}

// UI-only helper for showing projected XP; backend still awards the truth.
export function tierMultiplier(tier) {
  const t = String(tier || "").toLowerCase();
  if (t.includes("tier 3")) return 1.25;
  if (t.includes("tier 2")) return 1.1;
  return 1.0; // Free or unknown
}

export function bindWallet(wallet, opts = {}) {
  return guardedBind(wallet, opts).then((res) => {
    clearUserCache();
    return res;
  });
}

export function startTokenSalePurchase({ wallet, amount }, opts = {}) {
  return postJSON(
    "/api/v1/token-sale/purchase",
    { wallet, amount },
    opts
  );
}

export function getSubscriptionStatus(opts = {}) {
  return getJSON("/api/v1/subscription/status", opts);
}

export function subscribeToTier({ wallet, tier }, opts = {}) {
  return postJSON(
    "/api/v1/subscription/subscribe",
    { wallet, tier },
    opts
  );
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

export function getReferralStatus(opts = {}) {
  return getJSON("/api/referral/status", opts);
}

export const api = {
  base: API_BASE,
  getQuests,
  getLeaderboard,
  getMe,
  bindWallet,
  disconnectSession,
  startTokenSalePurchase,
  getSubscriptionStatus,
  subscribeToTier,
  claimSubscriptionBonus,
  startTelegram,
  startDiscord,
  startTwitter,
  claimQuest,
  claimSubscriptionReward,
  claimReferralReward,
  submitProof,
  clearUserCache,
  getReferralInfo,
  createReferral,
  applyReferral,
  getReferralsList,
  getReferralStatus,
  postJSON,
  get: getJSON,
  getJSON,
  post: postJSON,
  withSignal,
  ApiError,
};
