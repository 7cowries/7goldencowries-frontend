export const clampProgress = (n) => Math.max(0, Math.min(100, Number(n) || 0));
export const abbreviateWallet = (w = '') =>
  w && w.length > 10 ? `${w.slice(0,6)}…${w.slice(-4)}` : (w || '');
export function normalizeUser(raw = {}) {
  return {
    wallet: String(raw.wallet || raw.address || raw.id || ''),
    xp: Number(raw.xp ?? raw.points ?? 0),
    tier: raw.tier || raw.subscriptionTier || 'Free',
    levelName: raw.levelName || raw.level || 'Unranked',
    progress: clampProgress(raw.levelProgress ?? raw.progress ?? raw.pct ?? 0),
  };
}
// legacy aliases
export const clamp01 = (n) => clampProgress(n) / 100;
export const abbrevWallet = abbreviateWallet;
