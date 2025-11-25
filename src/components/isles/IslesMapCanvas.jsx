import React from 'react';
import IsleOrb from './IsleOrb';

const IslesMapCanvas = ({ isles, onSelect }) => (
  <div
    className="glass-panel"
    style={{
      background: 'radial-gradient(circle at 50% 20%, rgba(12,60,110,0.5), transparent 50%), rgba(255,255,255,0.04)',
    }}
  >
    <div className="glass-inner" style={{ alignItems: 'center' }}>
      <h3>Isles Map</h3>
      <div className="flex-wrap" style={{ justifyContent: 'center' }}>
        {isles.map((isle) => (
          <IsleOrb key={isle.name} isle={isle} onSelect={onSelect} />
        ))}
      </div>
    </div>
  </div>
);

export default IslesMapCanvas;
