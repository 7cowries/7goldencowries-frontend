import React from 'react';

const TierCardHybrid = ({ tier, onSelect }) => (
  <div className="glass-panel">
    <div className="glass-inner" style={{ gap: 8 }}>
      <div className="flex-between">
        <h3>{tier.name}</h3>
        <span className="badge-gold">{tier.price} TON</span>
      </div>
      <p className="small-label">{tier.perks}</p>
      <button className="btn-primary" onClick={() => onSelect?.(tier)}>Subscribe</button>
    </div>
  </div>
);

export default TierCardHybrid;
