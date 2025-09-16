const clamp01 = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  if (n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
};

const LEVELS = [
  { key: 'shellborn', name: 'Shellborn', symbol: '🐚', minXP: 0 },
  { key: 'wave-seeker', name: 'Wave Seeker', symbol: '🌊', minXP: 100 },
  { key: 'tide-whisperer', name: 'Tide Whisperer', symbol: '🌀', minXP: 400 },
  { key: 'current-binder', name: 'Current Binder', symbol: '🪙', minXP: 1000 },
  { key: 'pearl-bearer', name: 'Pearl Bearer', symbol: '🫧', minXP: 2000 },
  { key: 'isle-champion', name: 'Isle Champion', symbol: '🏝️', minXP: 3500 },
  { key: 'cowrie-ascendant', name: 'Cowrie Ascendant', symbol: '👑', minXP: 6000 },
];

function calculateProgression(rawXP = 0) {
  const totalXP = Math.max(0, Number(rawXP) || 0);
  let levelIndex = LEVELS.length - 1;
  for (let i = 0; i < LEVELS.length; i += 1) {
    const nextLevel = LEVELS[i + 1];
    if (!nextLevel || totalXP < nextLevel.minXP) {
      levelIndex = i;
      break;
    }
  }

  const level = LEVELS[levelIndex];
  const nextLevel = LEVELS[levelIndex + 1] || null;
  const xpIntoLevel = totalXP - level.minXP;
  const xpToNext = nextLevel ? nextLevel.minXP - level.minXP : null;

  const levelProgress = xpToNext ? clamp01(xpIntoLevel / xpToNext) : 1;
  const nextXP = xpToNext ?? Math.max(xpIntoLevel, 1);

  return {
    totalXP,
    xp: xpIntoLevel,
    nextXP,
    levelProgress,
    levelName: level.name,
    level: level.name,
    levelSymbol: level.symbol,
    levelIndex,
    levelTier: level.key,
    nextLevelTotalXP: nextLevel ? nextLevel.minXP : null,
  };
}

function applyProgression(user, totalXP) {
  const progression = calculateProgression(totalXP);
  const next = {
    ...user,
    totalXP: progression.totalXP,
    xp: progression.xp,
    nextXP: progression.nextXP,
    level: progression.levelName,
    levelName: progression.levelName,
    levelSymbol: progression.levelSymbol,
    levelProgress: progression.levelProgress,
    levelTier: progression.levelTier,
  };
  if (user && user.tier != null) {
    next.tier = user.tier;
  }
  return next;
}

function ensureProgression(user) {
  const baseXP =
    user?.totalXP ?? user?.total_xp ?? user?.xp ?? user?.progressXP ?? 0;
  return applyProgression(user || {}, baseXP);
}

function grantXP(user, delta) {
  const totalBefore =
    user?.totalXP ?? user?.total_xp ?? user?.xp ?? user?.progressXP ?? 0;
  const nextTotal = Math.max(0, Number(totalBefore) || 0) + (Number(delta) || 0);
  return applyProgression(user || {}, nextTotal);
}

module.exports = {
  LEVELS,
  calculateProgression,
  ensureProgression,
  grantXP,
};
