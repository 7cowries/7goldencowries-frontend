import React from 'react';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import ReferralRow from '@/components/referrals/ReferralRow';
import GlassCard from '@/components/ui/GlassCard';
import { useThemeContext } from '@/theme/ThemeContext';

const referrals = [
  { name: 'Voyager_01', status: 'claimable', reward: 200 },
  { name: 'Navigator_02', status: 'pending', reward: 120 },
];

export default function ReferralPage() {
  const { design } = useThemeContext();
  return (
    <PageContainer>
      <div style={{ display: 'grid', gap: 20 }}>
        <SectionHeader title="Referral" subtitle="Neon gold referral code" />
        <GlassCard padding="16px" glow>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: design.colors.neutrals.muted }}>Your Code</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: design.colors.gold.neon }}>OCEAN-GOLD-77</div>
            </div>
            <button style={{ padding: '12px 16px', borderRadius: 12, background: design.gradients.gold, color: '#0a1a2d', fontWeight: 700 }}>
              Copy & Share
            </button>
          </div>
        </GlassCard>
        <div style={{ display: 'grid', gap: 10 }}>
          {referrals.map((item) => (
            <ReferralRow key={item.name} name={item.name} status={item.status} reward={item.reward} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
