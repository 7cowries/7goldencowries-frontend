import React from 'react';

const CowryBadge = ({ level = 1, label }) => (
  <div className="glow-ring" style={{ width: 96, height: 96 }}>
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'linear-gradient(145deg, #ffd86b, #ffef9f)',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        boxShadow: '0 12px 28px rgba(255,216,107,0.4)',
      }}
    >
      <span style={{ color: '#0d1827', fontWeight: 800, fontSize: 20 }}>Lv {level}</span>
      {label && (
        <span
          style={{
            position: 'absolute',
            bottom: -18,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            padding: '6px 12px',
            borderRadius: 999,
            color: '#eaf5ff',
            fontSize: 12,
            letterSpacing: 0.3,
          }}
        >
          {label}
        </span>
      )}
    </div>
  </div>
);

export default CowryBadge;
