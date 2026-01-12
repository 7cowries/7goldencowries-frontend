import React from 'react';
import PageContainer from '@/components/ui/PageContainer';
import GlassCard from '@/components/ui/GlassCard';
import CowryBadge from '@/components/ui/CowryBadge';
import XPBarWave from '@/components/ui/XPBarWave';
import SectionHeader from '@/components/ui/SectionHeader';
import { useThemeContext } from '@/theme/ThemeContext';

const heroStats = [
  { label: 'Total XP', value: '128,400' },
  { label: 'Quests cleared', value: '342' },
  { label: 'Isles unlocked', value: '4/7' },
];

export default function HomePage() {
  const { design } = useThemeContext();
  return (
    <PageContainer>
      <div style={{ display: 'grid', gap: 24 }}>
        <GlassCard padding="28px" glow>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, color: design.colors.neutrals.muted }}>Hybrid Ocean</div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '0.04em', color: design.colors.gold.soft }}>
                Golden Cowry Odyssey
              </div>
              <p style={{ color: design.colors.neutrals.muted, maxWidth: 520 }}>
                Ride the deep-ocean gradient, claim quests, and ascend through neon gold tides. Crafted for v1.4 with particles,
                glass, and cinematic Web3 energy.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button style={{ padding: '14px 18px', borderRadius: 14, background: design.gradients.gold, color: '#0a1a2d', fontWeight: 800 }}>
                  Begin Questline
                </button>
                <button style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', color: design.colors.neutrals.base }}>
                  View Isles Map
                </button>
              </div>
            </div>
            <div style={{ justifySelf: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle, rgba(255,216,107,0.18), transparent 60%)', filter: 'blur(18px)' }} />
              <CowryBadge level={9} size={120} />
            </div>
          </div>
        </GlassCard>

        <SectionHeader title="Ocean Momentum" subtitle="Live progression in the Hybrid Ocean" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {heroStats.map((stat) => (
            <GlassCard key={stat.label} padding="18px" glow>
              <div style={{ color: design.colors.neutrals.muted, fontSize: 12 }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{stat.value}</div>
              <XPBarWave value={70} />
            </GlassCard>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
