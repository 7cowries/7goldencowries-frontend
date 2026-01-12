import React from 'react';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import StakingPanelHybrid from '@/components/staking/StakingPanelHybrid';
import GlassCard from '@/components/ui/GlassCard';

export default function StakingPage() {
  return (
    <PageContainer>
      <div style={{ display: 'grid', gap: 20 }}>
        <SectionHeader title="Staking" subtitle="Hybrid Web3 trading dashboard" />
        <StakingPanelHybrid balance={320.5} apr={12} multiplier={2.5} />
        <GlassCard padding="14px">
          <div style={{ fontWeight: 700 }}>Live shimmer</div>
          <p style={{ margin: 0, color: 'rgba(232,241,255,0.7)' }}>
            Balances update in real-time with neon shimmer. Tune multipliers through quests and subscription tiers.
          </p>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
