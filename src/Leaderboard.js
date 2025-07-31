import React, { useEffect, useState } from 'react';
import './Leaderboard.css';

const API = process.env.REACT_APP_API_URL;

const lore = {
  "Shellborn": "Born from tide and shell — a humble beginning.",
  "Wave Seeker": "Chaser of Naiā’s whisper across waves.",
  "Tide Whisperer": "Speaks the sea’s secrets — calm yet deep.",
  "Current Binder": "Bends the ocean’s will — silent but strong.",
  "Pearl Bearer": "Carries hidden virtue within.",
  "Isle Champion": "Defender of the Isles — storm-tested.",
  "Cowrie Ascendant": "Myth reborn. Tidewalker. Legend."
};

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch(`${API}/leaderboard`)
      .then(res => res.json())
      .then(data => setLeaders(data.top || []))
      .catch(console.error);
  }, []);

  return (
    <div className="leaderboard-wrapper">
      <h1>🏆 Cowrie Leaderboard</h1>
      <p className="subtitle">Top explorers across the Seven Isles</p>

      {leaders.length === 0 ? (
        <p className="loading">Loading leaderboard...</p>
      ) : (
        <div className="leaderboard-list">
          {leaders.map((user, i) => (
            <div key={user.wallet} className={`leader-card ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
              <div className="rank-badge">#{user.rank}</div>
              <div className="user-info">
                <img
                  src={`/images/badges/level-${user.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                  alt={user.name}
                  onError={(e) => e.target.src = '/images/badges/unranked.png'}
                  className="user-badge"
                />
                <div className="user-meta">
                  <p><strong>{shorten(user.wallet)}</strong> {user.twitter && <span> | 🐦 @{user.twitter}</span>}</p>
                  <p>{user.tier} • {user.name}</p>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${user.progress.toFixed(1)}%` }}></div>
                    </div>
                    <small>{user.xp} XP — {lore[user.name]}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function shorten(addr) {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export default Leaderboard;
