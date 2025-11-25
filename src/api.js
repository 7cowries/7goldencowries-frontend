import { API_BASE } from "./config";

function resolveUrl(endpoint) {
  if (!endpoint) return endpoint;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

async function handleResponse(res) {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg += data?.error ? `: ${data.error}` : "";
    } catch (_) {
      // swallow
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function apiGet(endpoint) {
  let res;
  try {
    res = await fetch(resolveUrl(endpoint), { credentials: "include" });
  } catch (err) {
    throw new Error(`Network error: ${err.message}`);
  }
  return handleResponse(res);
}

export async function apiPost(endpoint, body) {
  let res;
  try {
    res = await fetch(resolveUrl(endpoint), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`Network error: ${err.message}`);
  }
  return handleResponse(res);
}
