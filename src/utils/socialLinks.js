import { clearUserCache, postJSON } from "./api";

function normalizeErrorCode(value) {
  if (value == null) return value;
  return String(value).trim().toLowerCase().replace(/_/g, "-");
}

function normalizeResponse(res) {
  if (!res || typeof res !== "object") return res;
  const next = { ...res };
  if ("error" in next && next.error != null) {
    next.error = normalizeErrorCode(next.error);
  }
  if ("code" in next && next.code != null) {
    next.code = normalizeErrorCode(next.code);
  }
  return next;
}

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
  return normalizeResponse(res);
}
