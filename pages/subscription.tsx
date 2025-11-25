import React from 'react';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import TierCardHybrid from '@/components/ui/TierCardHybrid';
import GlassCard from '@/components/ui/GlassCard';

const tiers = [
  { name: 'Starter', price: '15 TON', perks: ['Daily quests', 'Base XP', 'Starter badge'] },
  { name: 'Pro', price: '35 TON', perks: ['Partner quests', '2x XP', 'Cowry glow ring'] },
  { name: 'Elite', price: '70 TON', perks: ['Insider quests', '3x XP', 'Gold perimeter animation'] },
];

export default function SubscriptionPage() {
  return (
    <PageContainer>
      <div style={{ display: 'grid', gap: 20 }}>
        <SectionHeader title="Subscription" subtitle="Glass tiers with TON conversion" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {tiers.map((tier) => (
            <TierCardHybrid key={tier.name} name={tier.name} price={tier.price} perks={tier.perks} />
          ))}
        </div>
        <GlassCard padding="16px">
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 700 }}>History</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              <div>01/02 • Starter</div>
              <div>12/11 • Pro</div>
              <div>09/18 • Elite</div>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
