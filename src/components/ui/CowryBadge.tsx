import React from 'react';
import { useThemeContext } from '@/theme/ThemeContext';

const CowryBadge: React.FC<{ level?: number; size?: number }> = ({ level = 1, size = 68 }) => {
  const { design, animations } = useThemeContext();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        background: design.gradients.gold,
        boxShadow: `${design.effects.shadows.glow}, inset 0 0 25px rgba(0,0,0,0.35)`,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        style={{
          width: size - 16,
          height: size - 16,
          borderRadius: '50%',
          background: design.gradients.ocean,
          border: design.borders.glass,
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: size / 3,
            height: size / 3,
            borderRadius: '50%',
            background: design.gradients.gold,
            boxShadow: design.effects.shadows.glow,
            animation: animations ? 'pulse 2.4s ease-in-out infinite' : undefined,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 6,
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: '50%',
            opacity: 0.8,
            animation: animations ? 'spin 12s linear infinite' : undefined,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '2px 10px',
          borderRadius: 999,
          background: 'rgba(255, 239, 159, 0.2)',
          border: design.borders.glass,
          color: design.colors.gold.neon,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: '0.06em',
        }}
      >
        L{level}
      </div>
      <style jsx>{`
        @keyframes pulse { 0% { transform: scale(0.94); } 50% { transform: scale(1.06); } 100% { transform: scale(0.94); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CowryBadge;
