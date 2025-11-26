import React from 'react';
import GlassCard from '../ui/GlassCard';
import XPBarWave from '../ui/XPBarWave';
import { useThemeContext } from '@/theme/ThemeContext';

interface StakingPanelProps {
  balance: number;
  apr: number;
  multiplier: number;
}

const StakingPanelHybrid: React.FC<StakingPanelProps> = ({ balance, apr, multiplier }) => {
  const { design } = useThemeContext();
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <GlassCard>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700 }}>Stake TON</div>
              <div style={{ color: design.colors.neutrals.muted }}>Web3 dashboard styling</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.08)' }}>APR {apr}%</span>
              <span style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(255,239,159,0.12)', color: design.colors.gold.neon }}>
                x{multiplier}
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ color: design.colors.neutrals.muted }}>Amount (TON)</label>
            <input
              type="number"
              placeholder="0"
              style={{
                padding: '12px',
                borderRadius: 12,
                border: design.borders.glass,
                background: 'rgba(255, 255, 255, 0.04)',
                color: design.colors.neutrals.base,
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button style={{ padding: '12px 16px', borderRadius: 12, background: design.gradients.gold, color: '#0a1a2d', fontWeight: 700 }}>Stake</button>
            <button style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: design.colors.neutrals.base }}>Unstake</button>
          </div>
          <XPBarWave value={Math.min(100, (balance / 1000) * 100)} label={`Balance: ${balance.toFixed(2)} TON`} />
        </div>
      </GlassCard>
    </div>
  );
};

export default StakingPanelHybrid;
