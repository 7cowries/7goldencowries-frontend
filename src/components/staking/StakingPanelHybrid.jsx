import React from 'react';
import LevelChip from '../ui/LevelChip';

const StakingPanelHybrid = ({ position, onStake }) => (
  <div className="glass-panel">
    <div className="glass-inner" style={{ gap: 12 }}>
      <div className="flex-between">
        <h3>Staking Balance</h3>
        <LevelChip variant="gold" value={`x${position.multiplier} Boost`} />
      </div>
      <p className="small-label">Live balance shimmer</p>
      <div className="flex-wrap">
        <div className="pill">{position.balance} TON staked</div>
        <div className="pill">Rewards: {position.rewards} XP</div>
      </div>
      <div className="flex-between" style={{ gap: 12 }}>
        <input
          className="input-glass"
          placeholder="Amount to stake"
          type="number"
          min="0"
          onChange={(e) => onStake?.(e.target.value)}
        />
        <button className="btn-primary" onClick={() => onStake?.(position.balance)}>Stake</button>
      </div>
    </div>
  </div>
);

export default StakingPanelHybrid;
