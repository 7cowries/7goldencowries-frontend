import React from 'react';
import GlassCard from './GlassCard';
import { useThemeContext } from '@/theme/ThemeContext';

interface TierCardProps {
  name: string;
  price: string;
  perks: string[];
  cta?: string;
}

const TierCardHybrid: React.FC<TierCardProps> = ({ name, price, perks, cta = 'Subscribe' }) => {
  const { design, animations } = useThemeContext();
  return (
    <GlassCard padding="20px" className="tier-card" glow>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{name}</div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 14,
              border: design.borders.glass,
              background: 'rgba(255, 239, 159, 0.15)',
              color: design.colors.gold.neon,
              animation: animations ? 'glow-border 2s ease-in-out infinite' : undefined,
            }}
          >
            {price}
          </div>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, color: design.colors.neutrals.muted }}>
          {perks.map((perk) => (
            <li key={perk}>{perk}</li>
          ))}
        </ul>
        <button
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            background: design.gradients.gold,
            color: '#0a1a2d',
            fontWeight: 700,
            boxShadow: design.effects.shadows.glow,
          }}
        >
          {cta}
        </button>
      </div>
      <style jsx>{`
        @keyframes glow-border { 0%, 100% { box-shadow: 0 0 0 0 rgba(255, 216, 107, 0.4); } 50% { box-shadow: 0 0 0 6px rgba(255, 216, 107, 0.0); } }
      `}</style>
    </GlassCard>
  );
};

export default TierCardHybrid;
