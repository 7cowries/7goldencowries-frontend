import React, { useEffect, useRef, useState } from 'react';
import { getLeaderboard } from '../utils/api';
import { abbreviateWallet } from '../lib/format';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const walletRef = useRef('');
  const mountedRef = useRef(true);
  const timerRef = useRef(null);
  const REFRESH_MS = 60000;

  const load = async (signal) => {
    setLoading(true);
    try {
      const data = await getLeaderboard({ signal });
      if (!mountedRef.current) return;
      const list = Array.isArray(data?.entries) ? data.entries : [];
      const rows = list.map((u) => ({
        ...u,
        progress: Math.max(0, Math.min(1, Number(u.progress ?? u.levelProgress ?? 0))),
      }));
      setLeaders(rows);
      setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e?.message || 'Failed to load leaderboard');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    walletRef.current = localStorage.getItem('wallet') || '';
    mountedRef.current = true;
    const controller = new AbortController();
    load(controller.signal);
    timerRef.current = setInterval(() => load(controller.signal), REFRESH_MS);
    return () => {
      mountedRef.current = false;
      controller.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (loading) return <div className="section">Loading leaderboard…</div>;
  if (!loading && error)
    return (
      <div className="section error">
        {error} <button onClick={() => load()}>Retry</button>
      </div>
    );

  const podium = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const Bar = ({ pct = 0 }) => (
    <div className="bar-outer">
      <div className="bar-inner" style={{ width: `${(pct * 100).toFixed(1)}%` }} />
    </div>
  );

  return (
    <div className="section">
      <div className="hero glass-strong" style={{ marginBottom: 24 }}>
        <h1>🏆 <span className="yolo-gradient">Cowrie Leaderboard</span></h1>
        <p className="subtitle">Top explorers across the Seven Isles</p>
      </div>

      {/* Podium */}
      <div className="grid podium">
        {podium.map((u, i) => (
          <div key={u.wallet || i} className={`card glass podium-${i+1} ${walletRef.current===u.wallet ? 'me' : ''}`}>
            <div className="corner-rank">#{i+1}</div>
            <div className="big-wallet">
              {abbreviateWallet(u.wallet)}
              {u.twitterHandle ? (
                <span className="muted" style={{ marginLeft: 6 }}>@{u.twitterHandle}</span>
              ) : null}
            </div>
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
        {leaders.length === 0 ? (
          <div className="muted">No entries yet.</div>
        ) : (
          rest.map((u, idx) => {
            const rank = idx + 4;
            const isMe = walletRef.current === u.wallet;
            return (
              <div key={u.wallet || rank} className={`row glass ${isMe ? 'me' : ''}`}>
                <div className="rank">#{rank}</div>
                <div className="wallet mono">
                  {abbreviateWallet(u.wallet)}
                  {u.twitterHandle ? (
                    <span className="muted" style={{ marginLeft: 4 }}>@{u.twitterHandle}</span>
                  ) : null}
                </div>
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
          })
        )}
      </div>
    </div>
  );
}
