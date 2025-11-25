function normalizeBase(raw) {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const noTrailing = trimmed.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(noTrailing)) return noTrailing;
  return noTrailing.startsWith("/") ? noTrailing : `/${noTrailing}`;
}

export const API_BASE = normalizeBase(
  process.env.REACT_APP_API_BASE || process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE
);
