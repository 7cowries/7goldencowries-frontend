import React, { useEffect, useRef, useState } from 'react';
import { getLeaderboard } from '../utils/api';
import { normalizeUser, abbreviateWallet, clampProgress } from '../lib/format';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const walletRef = useRef('');
  const mountedRef = useRef(true);
  const timerRef = useRef(null);
  const REFRESH_MS = 60000;

  useEffect(() => {
    walletRef.current = localStorage.getItem('wallet') || '';
    mountedRef.current = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const data = await getLeaderboard({ signal: controller.signal });
        if (!mountedRef.current) return;
        const list = (data?.leaders || data || []).map(normalizeUser);
        setLeaders(list);
        setError(null);
      } catch (e) {
        if (!mountedRef.current) return;
        setError(e?.message || 'Failed to load leaderboard');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    load();
    timerRef.current = setInterval(load, REFRESH_MS);

    return () => {
      mountedRef.current = false;
      controller.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (loading) return <div className="section">Loading leaderboard…</div>;
  if (!loading && error) return <div className="section">Error: {error}</div>;
  if (!leaders.length) return <div className="section">No explorers yet.</div>;

  const podium = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const Bar = ({ pct = 0 }) => (
    <div className="bar-outer">
      <div className="bar-inner" style={{ width: `${clampProgress(pct)}%` }} />
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
          <div key={u.wallet || i} className={`card glass podium-${i+1} ${walletRef.current===u.wallet ? 'me' : ''}`}>
            <div className="corner-rank">#{i+1}</div>
            <div className="big-wallet">{abbreviateWallet(u.wallet)}</div>
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
              <div className="wallet mono">{abbreviateWallet(u.wallet)}</div>
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
