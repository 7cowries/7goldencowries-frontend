import React from 'react';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import GlassCard from '@/components/ui/GlassCard';
import XPBarWave from '@/components/ui/XPBarWave';
import { useThemeContext } from '@/theme/ThemeContext';

export default function TokenSalePage() {
  const { design } = useThemeContext();
  return (
    <PageContainer>
      <div style={{ display: 'grid', gap: 20 }}>
        <SectionHeader title="Token Sale" subtitle="Trading-style TON dashboard" />
        <GlassCard padding="18px" glow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <div style={{ color: design.colors.neutrals.muted }}>TON</div>
              <input type="number" placeholder="0" style={{ width: '100%', padding: 12, borderRadius: 12, border: design.borders.glass, background: 'rgba(255,255,255,0.05)', color: design.colors.neutrals.base }} />
            </div>
            <div>
              <div style={{ color: design.colors.neutrals.muted }}>USD</div>
              <input type="number" placeholder="0" style={{ width: '100%', padding: 12, borderRadius: 12, border: design.borders.glass, background: 'rgba(255,255,255,0.05)', color: design.colors.neutrals.base }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button style={{ padding: '12px 16px', borderRadius: 12, background: design.gradients.gold, color: '#0a1a2d', fontWeight: 700, width: '100%' }}>
                Start Sale
              </button>
            </div>
          </div>
          <XPBarWave value={44} label="Live progress" />
        </GlassCard>
      </div>
    </PageContainer>
  );
}
