import React from 'react';
import IsleOrb from './IsleOrb';
import { useThemeContext } from '@/theme/ThemeContext';

const IslesMapCanvas: React.FC<{ isles: { name: string; locked?: boolean }[]; onSelect?: (name: string) => void }> = ({ isles, onSelect }) => {
  const { design } = useThemeContext();
  return (
    <div
      style={{
        position: 'relative',
        padding: '40px 20px',
        background: 'radial-gradient(circle at 50% 30%, rgba(12,60,110,0.5), rgba(4,18,38,0.7))',
        borderRadius: 24,
        overflow: 'hidden',
        border: design.borders.glass,
        boxShadow: design.effects.shadows.glass,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 60%, rgba(255,216,107,0.08), transparent 50%)' }} />
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 20 }}>
        {isles.map((isle) => (
          <div key={isle.name} style={{ display: 'grid', placeItems: 'center' }}>
            <IsleOrb name={isle.name} locked={isle.locked} onSelect={() => onSelect?.(isle.name)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default IslesMapCanvas;
