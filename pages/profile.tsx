import React from 'react';
import PageContainer from '@/components/ui/PageContainer';
import GlassCard from '@/components/ui/GlassCard';
import CowryBadge from '@/components/ui/CowryBadge';
import XPBarWave from '@/components/ui/XPBarWave';
import SectionHeader from '@/components/ui/SectionHeader';
import { useThemeContext } from '@/theme/ThemeContext';

const history = [
  { title: 'Check-in streak', status: 'Claimed', xp: 200 },
  { title: 'Isle lore share', status: 'Pending', xp: 180 },
];

export default function ProfilePage() {
  const { design } = useThemeContext();
  return (
    <PageContainer>
      <div style={{ display: 'grid', gap: 20 }}>
        <SectionHeader title="Profile" subtitle="Glass header with neon edges" />
        <GlassCard padding="24px" glow>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'center' }}>
            <CowryBadge level={12} size={96} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Oracle Voyager</div>
              <div style={{ color: design.colors.neutrals.muted }}>Legendary</div>
              <XPBarWave value={68} label="Level progress" />
            </div>
          </div>
        </GlassCard>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[{ label: 'XP', value: '128,400' }, { label: 'Streak', value: '14 days' }, { label: 'Badges', value: '12' }].map(
            (stat) => (
              <GlassCard key={stat.label} padding="16px">
                <div style={{ color: design.colors.neutrals.muted }}>{stat.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{stat.value}</div>
              </GlassCard>
            )
          )}
        </div>

        <SectionHeader title="Quest history" />
        <div style={{ display: 'grid', gap: 10 }}>
          {history.map((item) => (
            <GlassCard key={item.title} padding="14px">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ color: design.colors.neutrals.muted }}>{item.status}</div>
                </div>
                <div style={{ color: design.colors.gold.neon }}>{item.xp} XP</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
