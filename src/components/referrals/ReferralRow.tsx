import React from 'react';
import GlassCard from '../ui/GlassCard';
import { useThemeContext } from '@/theme/ThemeContext';

interface ReferralRowProps {
  name: string;
  status: string;
  reward: number;
  onClaim?: () => void;
}

const ReferralRow: React.FC<ReferralRowProps> = ({ name, status, reward, onClaim }) => {
  const { design } = useThemeContext();
  const claimable = status === 'claimable';
  return (
    <GlassCard padding="12px">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ color: design.colors.neutrals.muted }}>{status}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: design.colors.gold.neon }}>{reward} XP</span>
          <button
            onClick={onClaim}
            disabled={!claimable}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: claimable ? design.gradients.gold : 'rgba(255,255,255,0.05)',
              color: claimable ? '#0a1a2d' : design.colors.neutrals.muted,
            }}
          >
            {claimable ? 'Claim' : 'Pending'}
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default ReferralRow;
