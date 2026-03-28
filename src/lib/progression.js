import { LEVELS } from "../config/progression";

export const ISLES = [
  { key: "shellborn", name: "Shellborn Shoals", lore: "First tide where every explorer begins." },
  { key: "wave-seeker", name: "Wave Seeker Reef", lore: "Social quests awaken the reef currents." },
  { key: "tide-whisperer", name: "Tide Whisperer Atoll", lore: "Partner missions reveal hidden routes." },
  { key: "current-binder", name: "Current Binder Passage", lore: "Onchain mastery bends the sea lanes." },
  { key: "pearl-bearer", name: "Pearl Bearer Basin", lore: "Referral and premium loops deepen rewards." },
  { key: "isle-champion", name: "Champion Crown Isle", lore: "Competition and consistency forge champions." },
  { key: "cowrie-ascendant", name: "Cowrie Ascendant Sanctum", lore: "The mythic summit of the Seven Isles." },
];

const slug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function getLevelIndex(levelLike) {
  const normalized = slug(levelLike);
  const index = LEVELS.findIndex(
    (level) => slug(level.key) === normalized || slug(level.name) === normalized
  );
  return index >= 0 ? index : 0;
}

export function deriveProgressionFromXP(totalXPInput = 0) {
  const totalXP = Math.max(0, Number(totalXPInput) || 0);
  const currentIndex = LEVELS.findIndex((level, index) => {
    const next = LEVELS[index + 1];
    return !next || totalXP < Number(next.min || 0);
  });

  const index = currentIndex >= 0 ? currentIndex : 0;
  const current = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const min = Number(current?.min || 0);
  const nextMin = next ? Number(next.min || min) : null;
  const span = nextMin == null ? null : Math.max(1, nextMin - min);
  const intoLevel = Math.max(0, totalXP - min);
  const ratio = span == null ? 1 : Math.max(0, Math.min(1, intoLevel / span));

  return {
    index,
    levelName: current?.name || "Shellborn",
    levelKey: current?.key || "shellborn",
    levelEmoji: current?.emoji || "🐚",
    nextXP: nextMin,
    xpIntoLevel: intoLevel,
    xpToNext: nextMin == null ? 0 : Math.max(0, nextMin - totalXP),
    progressRatio: ratio,
    progressPercent: Math.round(ratio * 1000) / 10,
    isle: ISLES[index] || ISLES[0],
  };
}

export function deriveProgressionFromProfile(profile = {}) {
  const rawXP =
    profile.totalXP ??
    profile.total_xp ??
    profile.xp ??
    profile.points ??
    0;
  const base = deriveProgressionFromXP(rawXP);

  const explicitProgress = Number(
    profile.levelProgress ?? profile.progress ?? profile.level_progress
  );
  const hasExplicitProgress = Number.isFinite(explicitProgress);
  const normalizedRatio = hasExplicitProgress
    ? explicitProgress > 1
      ? Math.max(0, Math.min(1, explicitProgress / 100))
      : Math.max(0, Math.min(1, explicitProgress))
    : base.progressRatio;

  const levelIndex = getLevelIndex(profile.levelName ?? profile.level ?? base.levelName);
  const isle = ISLES[levelIndex] || base.isle;

  return {
    ...base,
    index: levelIndex,
    levelName: LEVELS[levelIndex]?.name || base.levelName,
    levelKey: LEVELS[levelIndex]?.key || base.levelKey,
    levelEmoji: LEVELS[levelIndex]?.emoji || base.levelEmoji,
    isle,
    progressRatio: normalizedRatio,
    progressPercent: Math.round(normalizedRatio * 1000) / 10,
  };
}
