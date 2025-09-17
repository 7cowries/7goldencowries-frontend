const { LEVELS, deriveLevel } = require('../../config/progression.js');

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  if (n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
}

function applyProgression(user = {}, totalXPInput = 0) {
  const level = deriveLevel(totalXPInput);
  let levelIndex = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (level.totalXP >= LEVELS[i].min) {
      levelIndex = i;
    } else {
      break;
    }
  }
  const nextLevel = LEVELS[levelIndex + 1] || null;
  const xpIntoLevel = Number(level.xpIntoLevel || 0);
  const nextXP = Number(level.nextNeed || 0);
  const levelProgress = clamp01(level.progress);

  const next = {
    ...user,
    totalXP: level.totalXP,
    xp: xpIntoLevel,
    nextXP,
    nextNeed: nextXP,
    xpIntoLevel,
    level: level.levelName,
    levelName: level.levelName,
    levelSymbol: level.levelSymbol,
    levelProgress,
    progress: levelProgress,
    levelTier: level.levelTier,
    levelIndex,
    nextLevelTotalXP: nextLevel ? nextLevel.min : null,
  };

  if (next.tier == null && user && user.subscriptionTier != null) {
    next.tier = user.subscriptionTier;
  }

  return next;
}

function ensureProgression(user) {
  if (!user || typeof user !== 'object') {
    return applyProgression({}, 0);
  }
  const baseXP =
    user.totalXP ??
    user.total_xp ??
    user.progressTotal ??
    user.progressXP ??
    user.total ??
    user.xp ??
    0;
  return applyProgression({ ...user }, baseXP);
}

function grantXP(user, delta) {
  const totalBefore =
    user?.totalXP ??
    user?.total_xp ??
    user?.progressTotal ??
    user?.progressXP ??
    user?.total ??
    user?.xp ??
    0;
  const nextTotal = Math.max(0, Number(totalBefore) || 0) + (Number(delta) || 0);
  return applyProgression({ ...user }, nextTotal);
}

module.exports = {
  LEVELS,
  deriveLevel,
  ensureProgression,
  grantXP,
};
