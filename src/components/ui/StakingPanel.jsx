import React, { useState } from "react";

export default function StakingPanel({ balance = 0, multiplier = 1.2 }) {
  const [amount, setAmount] = useState(0);
  const [staked, setStaked] = useState(1200);

  const handleStake = () => {
    setStaked((prev) => prev + Number(amount || 0));
    setAmount(0);
  };

  const handleUnstake = () => {
    setStaked((prev) => Math.max(0, prev - Number(amount || 0)));
    setAmount(0);
  };

  return (
    <div className="staking-panel card">
      <div className="stat-row">
        <div>
          <div className="label">Wallet Balance</div>
          <strong>{balance.toLocaleString()} GCT</strong>
        </div>
        <div>
          <div className="label">Staked</div>
          <strong>{staked.toLocaleString()} GCT</strong>
        </div>
        <div>
          <div className="label">XP Multiplier</div>
          <strong>{multiplier}x</strong>
        </div>
      </div>
      <div className="staking-actions">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <div className="staking-buttons">
          <button className="btn" onClick={handleStake}>
            Stake
          </button>
          <button className="btn ghost" onClick={handleUnstake}>
            Unstake
          </button>
        </div>
      </div>
    </div>
  );
}
