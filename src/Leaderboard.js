import React, { useEffect, useState } from 'react';
import './Leaderboard.css';
import { getLeaderboard } from './utils/api';

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
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let mounted = true;
    getLeaderboard()
      .then((data) => {
        if (!mounted) return;
        setLeaders(Array.isArray(data?.entries) ? data.entries : []);
        setTotal(Number(data?.total ?? 0));
      })
      .catch((e) => {
        if (mounted) setError(e.message || 'Failed to load leaderboard');
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="leaderboard-wrapper">
      <h1>🏆 <span className="yolo-gradient">Cowrie Leaderboard</span></h1>
      <p className="subtitle">Top explorers across the Seven Isles</p>

      {error ? (
        <p className="error">{error}</p>
      ) : leaders.length === 0 ? (
        <p className="loading">Loading leaderboard...</p>
      ) : (
        <div className="leaderboard-list">
          {leaders.map((user, i) => (
            <div
              key={user.wallet}
              className={`leader-card ${
                i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''
              } ${user.wallet === currentWallet ? 'you' : ''}`}
            >
              <div className="rank-badge">#{user.rank}</div>
              <div className="user-info">
                {(() => {
                  const lvl = (user.levelName || user.name || 'Shellborn');
                  const slug = lvl.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <img
                      src={`/images/badges/level-${slug}.png`}
                      alt={lvl}
                      onError={(e) => (e.target.src = '/images/badges/unranked.png')}
                      className="user-badge"
                    />
                  );
                })()}
                <div className="user-meta">
                  <p>
                    <strong>{shorten(user.wallet)}</strong>
                    {user.twitterHandle ? <span> | 🐦 @{user.twitterHandle}</span> : null}
                  </p>
                  <div className="chips">
                    <span className="chip">{user.tier}</span>
                    <span className="chip">{user.levelName || 'Shellborn'}</span>
                  </div>
                  <div className="progress-container">
                    <div className="bar-outer">
                      <div className="bar-inner" style={{ width: `${((user.progress || 0) * 100).toFixed(1)}%` }} />
                    </div>
                    <small>{user.xp} XP — {lore[user.levelName || 'Shellborn']}</small>
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

function shorten(addr = '') {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

const currentWallet = typeof localStorage !== 'undefined' ? localStorage.getItem('wallet') : null;

export default Leaderboard;
