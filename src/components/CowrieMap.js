import React from 'react';

const levels = [
  { name: 'Shell of Curiosity', symbol: '🐚' },
  { name: 'Wisdom', symbol: '🧭' },
  { name: 'Courage', symbol: '🛡' },
  { name: 'Integrity', symbol: '⚖' },
  { name: 'Creativity', symbol: '🎨' },
  { name: 'Compassion', symbol: '❤️' },
  { name: 'Resilience', symbol: '🔱' },
  { name: 'Vision', symbol: '👁' }
];

const CowrieMap = ({ currentLevel }) => {
  const currentIndex = levels.findIndex(l => l.name === currentLevel);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '2rem',
      background: '#001f3f',
      padding: '1rem',
      borderRadius: '10px'
    }}>
      <h3 style={{ color: '#FFDC00', marginBottom: 8 }}>🗺 Seven Isles of Tides</h3>
      {levels.map((lvl, index) => (
        <div key={lvl.name} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: index <= currentIndex ? 1 : 0.4,
          transform: index === currentIndex ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.4s ease',
        }}>
          <span style={{
            fontSize: '1.5rem'
          }}>{lvl.symbol}</span>
          <span style={{
            color: index <= currentIndex ? '#FFDC00' : '#ccc',
            fontWeight: index === currentIndex ? 'bold' : 'normal'
          }}>
            {lvl.name}
            {index === currentIndex && ' — You are here'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CowrieMap;
