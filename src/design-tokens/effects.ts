export const shadows = {
  xl: '0 25px 80px rgba(0, 0, 0, 0.45)',
  glow: '0 0 25px rgba(255, 216, 107, 0.4)',
  glass: '0 15px 45px rgba(4, 18, 38, 0.65)',
};

export const blurs = {
  glass: '12px',
};

export const radii = {
  lg: '20px',
  full: '999px',
};

export const transitions = {
  soft: 'all 260ms ease',
  bounce: 'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export const glassPresets = {
  panel: {
    background: 'linear-gradient(135deg, rgba(255, 216, 107, 0.08), rgba(4, 18, 38, 0.6))',
    border: '1px solid rgba(255, 239, 159, 0.3)',
    backdropFilter: 'blur(12px)',
    boxShadow: `${shadows.glass}, ${shadows.glow}`,
  },
};
