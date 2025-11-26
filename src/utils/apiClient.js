
const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  process.env.BACKEND_ORIGIN ||
  'https://sevengoldencowries-backend.onrender.com';

import { API_BASE as CONFIG_API_BASE } from "../config";


const API = normalizeBase(CONFIG_API_BASE);

function normalizeBase(raw) {
  if (!raw) return "";
  const trimmed = `${raw}`.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/+$/, "");
  return trimmed.startsWith("/") ? trimmed.replace(/\/+$/, "") : `/${trimmed.replace(/\/+$/, "")}`;
}

function join(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  let p = `${path || ""}`;

  if (!b) return p;
  if (!p) return b;

  // Avoid /api/api/ when caller passes /api/* paths and base already ends with /api
  if (b.endsWith("/api") && p.startsWith("/api")) {
    p = p.replace(/^\/api/, "");
  }

  if (p.startsWith("/")) return `${b}${p}`;
  return `${b}/${p}`;
}

export async function apiGet(path, opts = {}) {
  const res = await fetch(join(API, path), {
    credentials: "include",
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function apiPost(path, body, opts = {}) {
  const res = await fetch(join(API, path), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    body: JSON.stringify(body),
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
