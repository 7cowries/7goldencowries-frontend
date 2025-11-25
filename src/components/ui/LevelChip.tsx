import React from 'react';
import { useThemeContext } from '@/theme/ThemeContext';

const LevelChip: React.FC<{ level: number; label?: string }> = ({ level, label }) => {
  const { design } = useThemeContext();
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 999,
        border: design.borders.glass,
        background: 'rgba(255, 239, 159, 0.12)',
        color: design.colors.gold.neon,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: design.gradients.gold, boxShadow: design.effects.shadows.glow }} />
      {label || 'Level'} {level}
    </div>
  );
};

export default LevelChip;
