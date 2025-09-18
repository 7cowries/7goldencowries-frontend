const LEVELS = [
  { key: 'shellborn',        name: 'Shellborn',        symbol: '🐚', min: 0 },
  { key: 'wave-seeker',      name: 'Wave Seeker',      symbol: '🌊', min: 10_000 },
  { key: 'tide-whisperer',   name: 'Tide Whisperer',   symbol: '🌀', min: 30_000 },
  { key: 'current-binder',   name: 'Current Binder',   symbol: '🪙', min: 60_000 },
  { key: 'pearl-bearer',     name: 'Pearl Bearer',     symbol: '🫧', min: 100_000 },
  { key: 'isle-champion',    name: 'Isle Champion',    symbol: '🏝️', min: 150_000 },
  { key: 'cowrie-ascendant', name: 'Cowrie Ascendant', symbol: '👑', min: 250_000 },
];

function deriveLevel(totalXPInput) {
  const total = Math.max(0, Number(totalXPInput) || 0);
  let idx = LEVELS.length - 1;
  for (let i = 0; i < LEVELS.length; i += 1) {
    const next = LEVELS[i + 1];
    if (!next || total < next.min) {
      idx = i;
      break;
    }
  }

  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] || null;
  const span = next ? next.min - current.min : 1;
  const into = total - current.min;
  const progress = next ? Math.min(1, Math.max(0, into / span)) : 1;

  return {
    totalXP: total,
    levelName: current.name,
    levelSymbol: current.symbol,
    levelTier: current.key,
    progress,
    xpIntoLevel: into,
    nextNeed: next ? span : into || 1,
  };
}

const api = { LEVELS, deriveLevel };

exports.LEVELS = LEVELS;
exports.deriveLevel = deriveLevel;
exports.default = api;

// Support ES module consumers if needed.
exports.__esModule = true;
