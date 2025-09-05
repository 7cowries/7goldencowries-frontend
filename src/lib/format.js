export const clamp01 = (n) => Math.max(0, Math.min(1, Number(n) || 0));
export const abbrevWallet = (w='') => (w.length > 10 ? `${w.slice(0,4)}…${w.slice(-4)}` : w);
export function normalizeUser(raw = {}) {
  const wallet = String(raw.wallet || raw.address || raw.id || '');
  const xp = Number(raw.xp ?? raw.points ?? 0);
  const tier = raw.tier || raw.subscriptionTier || 'Free';
  const levelName = raw.levelName || raw.level || 'Unranked';
  const progress = raw.levelProgress ?? raw.progress ?? raw.pct ?? 0;
  return { wallet, xp, tier, levelName, progress: clamp01(progress) };
}
