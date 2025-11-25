import React from 'react';

const IsleOrb = ({ isle, onSelect }) => (
  <button
    className="glass-panel"
    style={{
      borderRadius: '50%',
      width: 120,
      height: 120,
      display: 'grid',
      placeItems: 'center',
      background: isle.locked
        ? 'linear-gradient(145deg, rgba(12,60,110,0.6), rgba(4,18,38,0.9))'
        : 'linear-gradient(145deg, rgba(255,216,107,0.35), rgba(12,60,110,0.35))',
      border: isle.locked ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,216,107,0.6)',
      color: '#eaf5ff',
      cursor: 'pointer',
    }}
    onClick={() => onSelect?.(isle)}
  >
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{isle.name}</div>
      <div className="small-label">{isle.locked ? 'Locked' : 'Explore'}</div>
    </div>
  </button>
);

export default IsleOrb;
