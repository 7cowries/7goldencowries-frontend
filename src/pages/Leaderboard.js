import React, { useEffect, useRef, useState } from 'react';
import { clamp01, abbrevWallet, normalizeUser } from '../lib/format';
import { getLeaderboard } from '../lib/api';

async function fetchLeaderboard() {
  try {
    const data = await getLeaderboard();
    // Accept { users:[...] }, { top:[...] }, or direct array
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data.users)
      ? data.users
      : Array.isArray(data.top)
      ? data.top
      : [];
    if (list.length) return list.map(normalizeUser);
  } catch {}
  return [];
}

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const walletRef = useRef('');

  const load = async () => {
    try {
      const list = await fetchLeaderboard();
      // sort by XP desc, stable
      list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setRows(list);
    } catch (e) {
      setError(e.message || 'Failed to load leaderboard');
    }
  };

  useEffect(() => {
    walletRef.current = localStorage.getItem('wallet') || '';
    (async () => {
      await load();
      setLoading(false);
    })();

    // refresh every 60s
    const t = setInterval(load, 60_000);

    // if wallet changes in another tab, reload
    const onStorage = (e) => {
      if (e.key === 'wallet') {
        walletRef.current = e.newValue || '';
        load();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      clearInterval(t);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (loading) return <div className="section">Loading leaderboard…</div>;
  if (error) return <div className="section">Error: {error}</div>;
  if (!rows.length) return <div className="section">No explorers yet.</div>;

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  const Bar = ({ pct = 0 }) => (
    <div className="bar-outer">
      <div className="bar-inner" style={{ width: `${Math.round(clamp01(pct) * 100)}%` }} />
    </div>
  );

  return (
    <div className="section">
      <div className="hero glass-strong" style={{ marginBottom: 24 }}>
        <h1>🏆 Cowrie Leaderboard</h1>
        <p className="subtitle">Top explorers across the Seven Isles</p>
      </div>

      {/* Podium */}
      <div className="grid podium">
        {podium.map((u, i) => (
          <div
            key={u.wallet || i}
            className={`card glass podium-${i + 1} ${walletRef.current === u.wallet ? 'me' : ''}`}
          >
            <div className="corner-rank">#{i + 1}</div>
            <div className="big-wallet">{abbrevWallet(u.wallet)}</div>
            <div className="chips">
              <span className="chip">{u.tier || 'Free'}</span>
              <span className="chip">{u.levelName}</span>
              <span className="chip">{u.xp} XP</span>
            </div>
            <Bar pct={u.progress} />
          </div>
        ))}
      </div>

      {/* Rest */}
      <div className="list">
        {rest.map((u, idx) => {
          const rank = idx + 4;
          const isMe = walletRef.current === u.wallet;
          return (
            <div key={u.wallet || rank} className={`row glass ${isMe ? 'me' : ''}`}>
              <div className="rank">#{rank}</div>
              <div className="wallet mono">{abbrevWallet(u.wallet)}</div>
              <div className="badges">
                <span className="chip">{u.tier || 'Free'}</span>
                <span className="chip">{u.levelName}</span>
              </div>
              <div className="xp mono">{u.xp} XP</div>
              <div className="grow">
                <Bar pct={u.progress} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

