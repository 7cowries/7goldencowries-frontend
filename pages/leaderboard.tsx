import React from 'react';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import LeaderboardRow from '@/components/ui/LeaderboardRow';
import GlassCard from '@/components/ui/GlassCard';
import CowryBadge from '@/components/ui/CowryBadge';
import { useThemeContext } from '@/theme/ThemeContext';

const data = [
  { rank: 1, name: 'CoralQueen', xp: 54000 },
  { rank: 2, name: 'TideRunner', xp: 48200 },
  { rank: 3, name: 'MarinerX', xp: 46000 },
  { rank: 4, name: 'DepthSeeker', xp: 43000 },
];

export default function LeaderboardPage() {
  const { design } = useThemeContext();
  return (
    <PageContainer>
      <div style={{ display: 'grid', gap: 20 }}>
        <SectionHeader title="Leaderboard" subtitle="Gold podium and frosted table" />
        <GlassCard padding="16px" glow>
          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {data.slice(0, 3).map((item) => (
              <div key={item.rank} style={{ textAlign: 'center', padding: '12px 16px' }}>
                <CowryBadge level={item.rank} />
                <div style={{ color: design.colors.neutrals.muted }}>{item.name}</div>
                <div style={{ color: design.colors.gold.neon, fontWeight: 700 }}>{item.xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        </GlassCard>
        <div style={{ display: 'grid', gap: 10 }}>
          {data.map((item) => (
            <LeaderboardRow key={item.rank} rank={item.rank} name={item.name} xp={item.xp} percent={(item.xp / data[0].xp) * 100} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
