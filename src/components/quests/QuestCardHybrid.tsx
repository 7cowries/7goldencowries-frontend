import React from 'react';
import GlassCard from '../ui/GlassCard';
import XPBarWave from '../ui/XPBarWave';
import { useThemeContext } from '@/theme/ThemeContext';

export type QuestCategory = 'Daily' | 'Partner' | 'Insider' | 'Social' | 'On-chain' | 'Referral';

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
  locked?: boolean;
  category: QuestCategory;
}

const QuestCardHybrid: React.FC<{ quest: Quest; onClaim?: (id: string) => void }> = ({ quest, onClaim }) => {
  const { design } = useThemeContext();
  return (
    <GlassCard padding="18px" className="quest-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: design.gradients.gold,
                boxShadow: design.effects.shadows.glow,
                opacity: quest.locked ? 0.6 : 1,
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{quest.title}</div>
              <div style={{ color: design.colors.neutrals.muted }}>{quest.description}</div>
            </div>
          </div>
          <XPBarWave value={quest.progress} label={`${quest.xp} XP`} />
        </div>
        <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
          <span style={{ color: design.colors.gold.neon, fontWeight: 700 }}>{quest.category}</span>
          <button
            onClick={() => onClaim?.(quest.id)}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: quest.locked ? 'rgba(255,255,255,0.05)' : design.gradients.gold,
              color: quest.locked ? design.colors.neutrals.muted : '#0a1a2d',
              boxShadow: quest.locked ? undefined : design.effects.shadows.glow,
              cursor: quest.locked ? 'not-allowed' : 'pointer',
            }}
            disabled={quest.locked}
          >
            {quest.locked ? 'Locked' : 'Claim XP'}
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default QuestCardHybrid;
