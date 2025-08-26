// src/utils/format.js
export function prettifyLabel(input = "") {
  if (!input) return "";
  // collapse underscores/dashes to single spaces
  const spaced = String(input).replace(/[_-]+/g, " ");
  // smart-case: keep hex-ish / addresses as-is except spacing removal
  const looksLikeAddress = /^0x[a-f0-9]{6,}|^[A-Z0-9]{3,}(\.\.\.)?[A-Za-z0-9]{2,}$/i.test(spaced.trim());
  if (looksLikeAddress) return spaced.trim();

  // Title-case for human labels
  return spaced
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (s) => s.toUpperCase());
}
