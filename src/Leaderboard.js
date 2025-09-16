import React, { useEffect, useState } from 'react';
import './Leaderboard.css';
import { getLeaderboard } from './utils/api';
import { levelBadgeSrc } from './config/progression';

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
          {leaders.map((entry, i) => {
            const rank = entry.rank ?? i + 1;
            const levelName = entry.levelName || entry.level || 'Shellborn';
            const tier = entry.tier || entry.subscriptionTier || 'Free';
            const progressValue = Number(entry.levelProgress ?? entry.progress ?? 0) || 0;
            const progress = Math.max(0, Math.min(1, progressValue));
            const progressPct = (progress * 100).toFixed(1);
            const xpValue = Number(entry.xp ?? 0);
            const xpDisplay = Number.isFinite(xpValue) ? xpValue.toLocaleString() : '0';
            const badgeSrc = levelBadgeSrc(levelName);
            const loreText = lore[levelName] || lore['Shellborn'];
            const isYou = entry.wallet === currentWallet;
            return (
              <div
                key={entry.wallet}
                className={`leader-card ${
                  i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''
                } ${isYou ? 'you' : ''}`}
              >
                <div className="rank-badge">#{rank}</div>
                <div className="user-info">
                  <img
                    src={badgeSrc}
                    alt={levelName}
                    onError={(e) => (e.target.src = '/images/badges/unranked.png')}
                    className="user-badge"
                  />
                  <div className="user-meta">
                    <p>
                      <strong>{shorten(entry.wallet)}</strong>
                      {entry.twitterHandle ? <span> | 🐦 @{entry.twitterHandle}</span> : null}
                    </p>
                    <div className="chips">
                      <span className="chip">{tier}</span>
                      <span className="chip">{levelName}</span>
                    </div>
                    <div className="progress-container">
                      <div className="bar-outer">
                        <div className="bar-inner" style={{ width: `${progressPct}%` }} />
                      </div>
                      <small>{xpDisplay} XP — {loreText}</small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
