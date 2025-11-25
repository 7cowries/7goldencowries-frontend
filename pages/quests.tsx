import React, { useMemo, useState } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import QuestCardHybrid, { Quest, QuestCategory } from '@/components/quests/QuestCardHybrid';
import XPBarWave from '@/components/ui/XPBarWave';
import GlassCard from '@/components/ui/GlassCard';
import { useThemeContext } from '@/theme/ThemeContext';

const sampleQuests: Quest[] = [
  { id: 'q1', title: 'Check-in', description: 'Log in daily for streak XP', xp: 200, progress: 80, category: 'Daily' },
  { id: 'q2', title: 'Partner mint', description: 'Mint partner NFT', xp: 420, progress: 40, category: 'Partner' },
  { id: 'q3', title: 'Share lore', description: 'Post isle lore on socials', xp: 160, progress: 60, category: 'Social' },
  { id: 'q4', title: 'Bridge TON', description: 'On-chain transfer', xp: 360, progress: 20, category: 'On-chain', locked: true },
];

export default function QuestsPage() {
  const { design } = useThemeContext();
  const [category, setCategory] = useState<QuestCategory>('Daily');

  const quests = useMemo(() => sampleQuests.filter((q) => q.category === category), [category]);

  return (
    <PageContainer>
      <div style={{ display: 'grid', gap: 20 }}>
        <SectionHeader title="Quests" subtitle="Hybrid quest cards with ocean XP" />
        <GlassCard padding="16px" glow>
          <XPBarWave value={72} label="Season XP" />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(['Daily', 'Partner', 'Insider', 'Social', 'On-chain', 'Referral'] as QuestCategory[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setCategory(tab)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: design.borders.glass,
                  background: category === tab ? 'rgba(255,239,159,0.18)' : 'rgba(255,255,255,0.05)',
                  color: category === tab ? design.colors.gold.neon : design.colors.neutrals.base,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </GlassCard>

        <div style={{ display: 'grid', gap: 12 }}>
          {quests.map((quest) => (
            <QuestCardHybrid key={quest.id} quest={quest} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
