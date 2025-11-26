export const ocean = {
  deep: '#041226',
  mid: '#08244a',
  light: '#0c3c6e',
  aura: 'radial-gradient(circle at 20% 20%, rgba(12, 60, 110, 0.4), transparent 40%), radial-gradient(circle at 80% 30%, rgba(8, 36, 74, 0.45), transparent 45%)',
};

export const gold = {
  neon: '#ffd86b',
  soft: '#ffef9f',
  amber: '#ffb347',
};

export const neutrals = {
  base: '#e8f1ff',
  muted: '#b6c8e4',
  overlay: 'rgba(8, 24, 48, 0.65)',
};

export const status = {
  success: '#6bffcb',
  warn: '#ffd86b',
  error: '#ff6b6b',
};

export const gradients = {
  ocean: `linear-gradient(135deg, ${ocean.deep}, ${ocean.mid}, ${ocean.light})`,
  gold: 'linear-gradient(120deg, #ffd86b, #ffef9f, #ffd86b)',
  glass: 'linear-gradient(145deg, rgba(255, 216, 107, 0.12), rgba(12, 60, 110, 0.18))',
};

export const borders = {
  glass: '1px solid rgba(255, 216, 107, 0.25)',
  glow: '1px solid rgba(255, 239, 159, 0.35)',
};

export const brand = {
  ocean,
  gold,
  neutrals,
  status,
  gradients,
  borders,
};

export default brand;
