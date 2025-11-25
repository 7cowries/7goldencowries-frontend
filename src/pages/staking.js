import React, { useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import GlassCard from '../components/ui/GlassCard';
import StakingPanelHybrid from '../components/staking/StakingPanelHybrid';

const StakingPage = () => {
  const [position, setPosition] = useState({ balance: 120, rewards: 480, multiplier: 1.6 });

  const onStake = (amount) => {
    const next = Number(amount || 0);
    if (!Number.isFinite(next)) return;
    setPosition((p) => ({ ...p, balance: p.balance + next }));
  };

  return (
    <PageContainer>
      <GlassCard title="Staking Dashboard" subtitle="Hybrid Web3 trading layout">
        <StakingPanelHybrid position={position} onStake={onStake} />
        <div className="card-grid">
          <GlassCard title="Multipliers" subtitle="Wave badges">
            <div className="flex-wrap">
              <div className="pill">x1.2 Daily</div>
              <div className="pill">x1.6 Weekly</div>
              <div className="pill">x2.0 Insider</div>
            </div>
          </GlassCard>
          <GlassCard title="Live Balance" subtitle="Shimmering ocean glass">
            <h2>{position.balance} TON</h2>
            <p className="small-label">Rewards {position.rewards} XP</p>
          </GlassCard>
        </div>
      </GlassCard>
    </PageContainer>
  );
};

export default StakingPage;
