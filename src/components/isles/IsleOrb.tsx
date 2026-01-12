import React from 'react';
import { useThemeContext } from '@/theme/ThemeContext';

interface IsleOrbProps {
  name: string;
  locked?: boolean;
  onSelect?: () => void;
}

const IsleOrb: React.FC<IsleOrbProps> = ({ name, locked, onSelect }) => {
  const { design } = useThemeContext();
  return (
    <button
      onClick={onSelect}
      style={{
        width: 110,
        height: 110,
        borderRadius: '50%',
        border: design.borders.glow,
        background: locked ? 'rgba(255,255,255,0.05)' : design.gradients.gold,
        color: locked ? design.colors.neutrals.muted : '#0a1a2d',
        boxShadow: design.effects.shadows.glow,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 6,
          borderRadius: '50%',
          background: design.gradients.ocean,
          border: design.borders.glass,
          display: 'grid',
          placeItems: 'center',
          color: design.colors.neutrals.base,
          textAlign: 'center',
          padding: 8,
        }}
      >
        {name}
      </div>
    </button>
  );
};

export default IsleOrb;
