import React from 'react';
import { useThemeContext } from '@/theme/ThemeContext';

interface XPBarWaveProps {
  value: number;
  label?: string;
}

const XPBarWave: React.FC<XPBarWaveProps> = ({ value, label }) => {
  const { design, animations } = useThemeContext();
  const percent = Math.min(100, Math.max(0, value));

  return (
    <div style={{ width: '100%', padding: '8px 0' }}>
      {label && <div style={{ fontSize: 12, color: design.colors.neutrals.muted, marginBottom: 4 }}>{label}</div>}
      <div
        style={{
          width: '100%',
          height: 16,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.05)',
          overflow: 'hidden',
          border: design.borders.glass,
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: design.gradients.gold,
            boxShadow: design.effects.shadows.glow,
            position: 'absolute',
            inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            transition: animations ? 'width 600ms ease' : undefined,
          }}
        >
          {animations && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 10% 50%, rgba(255,255,255,0.35), transparent 20%), radial-gradient(circle at 60% 50%, rgba(255,255,255,0.25), transparent 20%)',
                mixBlendMode: 'screen',
                animation: 'wave-move 2.8s linear infinite',
              }}
            />
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes wave-move { from { transform: translateX(-10%); } to { transform: translateX(10%); } }
      `}</style>
    </div>
  );
};

export default XPBarWave;
