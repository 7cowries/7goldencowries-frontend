import React from 'react';

const LevelChip = ({ value, variant = 'default' }) => {
  const palette = {
    default: 'rgba(255,255,255,0.08)',
    gold: 'linear-gradient(120deg, rgba(255,216,107,0.4), rgba(255,239,159,0.35))',
    aqua: 'linear-gradient(120deg, rgba(0,194,255,0.3), rgba(12,60,110,0.3))',
  };
  return (
    <span
      className="pill"
      style={{
        background: palette[variant] || palette.default,
        borderColor: 'rgba(255,255,255,0.16)',
        color: '#eaf5ff',
        fontWeight: 700,
      }}
    >
      {value}
    </span>
  );
};

export default LevelChip;
