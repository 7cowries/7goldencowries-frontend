import React from 'react';

const XPBarWave = ({ progress = 0 }) => (
  <div className="wave-bar" aria-label="xp-bar">
    <div className="wave-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
  </div>
);

export default XPBarWave;
