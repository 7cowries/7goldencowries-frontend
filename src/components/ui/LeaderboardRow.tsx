import React from 'react';
import XPBarWave from './XPBarWave';
import GlassCard from './GlassCard';
import { useThemeContext } from '@/theme/ThemeContext';

interface LeaderboardRowProps {
  rank: number;
  name: string;
  xp: number;
  percent: number;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ rank, name, xp, percent }) => {
  const { design } = useThemeContext();
  return (
    <GlassCard padding="12px" className="leaderboard-row">
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px', alignItems: 'center', gap: 12 }}>
        <div style={{ fontWeight: 700, color: design.colors.gold.neon }}>#{rank}</div>
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <XPBarWave value={percent} />
        </div>
        <div style={{ textAlign: 'right', color: design.colors.neutrals.muted }}>{xp.toLocaleString()} XP</div>
      </div>
    </GlassCard>
  );
};

export default LeaderboardRow;
