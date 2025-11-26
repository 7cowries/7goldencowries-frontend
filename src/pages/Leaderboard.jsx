import React, { useEffect, useRef, useState } from 'react';
import { getLeaderboard } from '../utils/api';
import { abbreviateWallet } from '../lib/format';
import Page from '../components/Page';
import { levelBadgeSrc } from '../config/progression';

const REFRESH_MS = 60000;

const clampProgress = (value) => Math.max(0, Math.min(1, Number(value) || 0));

const prettifyTier = (tier) => {
  if (!tier) return 'Free';
  const label = String(tier).trim();
  if (/^tier\s*\d/i.test(label)) {
    const match = label.match(/\d/);
    return match ? `Tier ${match[0]}` : label;
  }
  if (label.toLowerCase() === 'free') return 'Free';
  return label;
};

const tierSlug = (tier) =>
  prettifyTier(tier)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

const TierBadge = ({ tier }) => {
  const label = prettifyTier(tier);
  const slug = tierSlug(tier);
  return <span className={`tier-badge ${slug}`}>{label}</span>;
};

const ProgressMeter = ({ progress }) => {
  const pct = Math.round(clampProgress(progress) * 1000) / 10;
  return (
    <div className="progress-wrap compact" aria-label={`Progress ${pct}%`}>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="muted">{pct}% to next level</span>
    </div>
  );
};

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const walletRef = useRef('');
  const mountedRef = useRef(true);
  const timerRef = useRef(null);

  const load = async (signal, { showSpinner = false } = {}) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await getLeaderboard({ signal });
      if (!mountedRef.current) return;
      const list = Array.isArray(data?.entries) ? data.entries : [];
      const rows = list
        .map((u) => ({
          ...u,
          progress: clampProgress(u.progress ?? u.levelProgress ?? 0),
        }))
        .sort((a, b) => {
          const xpA = Number(a.xp ?? 0);
          const xpB = Number(b.xp ?? 0);
          if (xpA !== xpB) return xpB - xpA;
          const walletA = a.wallet || '';
          const walletB = b.wallet || '';
          return walletA.localeCompare(walletB);
        });
      setLeaders(rows);
      setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e?.message || 'Failed to load leaderboard');
    } finally {
      if (mountedRef.current && showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    walletRef.current = localStorage.getItem('wallet') || '';
    mountedRef.current = true;
    const controller = new AbortController();
    load(controller.signal, { showSpinner: true });
    timerRef.current = setInterval(() => load(undefined), REFRESH_MS);
    return () => {
      mountedRef.current = false;
      controller.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const retry = () => load(undefined, { showSpinner: true });

  if (loading) {
    return (
      <Page>
        <div className="glass-strong lb-fallback">
          <h2>Loading leaderboard…</h2>
          <p className="muted">Surfacing the bravest explorers of the Seven Isles.</p>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <div className="glass-strong lb-fallback error">
          <h2>We couldn’t fetch the tides</h2>
          <p className="muted">{error}</p>
          <button className="btn ghost" onClick={retry}>
            Retry
          </button>
        </div>
      </Page>
    );
  }

  const podium = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <Page>
      <section className="section leaderboard-wrapper glass">
        <header className="lb-header">
          <h1>
            🏆 <span className="yolo-gradient">Cowrie Leaderboard</span>
          </h1>
          <p className="subtitle">Track the top explorers riding every tide.</p>
        </header>

        <div className="podium">
          {podium.length === 0 ? (
            <div className="podium-step ghost">
              <div className="podium-name muted">No champions yet.</div>
            </div>
          ) : (
            podium.map((u, idx) => {
              const rank = idx + 1;
              const isMe = walletRef.current === u.wallet;
              const badgeSrc = levelBadgeSrc(u.levelName);
              const xp = Number(u.xp ?? 0).toLocaleString();
              return (
                <div
                  key={u.wallet || rank}
                  className={`podium-step ${rank === 1 ? 'tall' : ''} ${
                    isMe ? 'me' : ''
                  }`}
                >
                  <div className="podium-rank">#{rank}</div>
                  <img
                    className="podium-badge"
                    src={badgeSrc}
                    alt={u.levelName || 'Level badge'}
                    onError={(e) => {
                      e.currentTarget.src = '/images/level-badge.png';
                    }}
                  />
                  <div className="podium-name">{abbreviateWallet(u.wallet)}</div>
                  {u.twitterHandle ? (
                    <a
                      className="podium-twitter lb-link"
                      href={`https://x.com/${u.twitterHandle}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      @{u.twitterHandle}
                    </a>
                  ) : null}
                  <div className="podium-meta">
                    <TierBadge tier={u.tier} />
                    <span className="pill">{u.levelName || 'Shellborn'}</span>
                    <span className="pill">{xp} XP</span>
                  </div>
                  <ProgressMeter progress={u.progress} />
                </div>
              );
            })
          )}
        </div>

        <div className="leaderboard-list">
          {rest.length === 0 ? (
            <div className="empty">No additional adventurers yet.</div>
          ) : (
            rest.map((u, idx) => {
              const rank = idx + 4;
              const isMe = walletRef.current === u.wallet;
              const badgeSrc = levelBadgeSrc(u.levelName);
              const xp = Number(u.xp ?? 0).toLocaleString();
              return (
                <div
                  key={u.wallet || rank}
                  className={`leader-card glass ${isMe ? 'me' : ''}`}
                >
                  <div className="rank-badge">#{rank}</div>
                  <img
                    className="user-badge"
                    src={badgeSrc}
                    alt={u.levelName || 'Level badge'}
                    onError={(e) => {
                      e.currentTarget.src = '/images/level-badge.png';
                    }}
                  />
                  <div className="user-meta">
                    <div className="user-line">
                      {abbreviateWallet(u.wallet)}
                      {u.twitterHandle ? (
                        <a
                          className="lb-link"
                          href={`https://x.com/${u.twitterHandle}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          @{u.twitterHandle}
                        </a>
                      ) : null}
                    </div>
                    <div className="user-line muted">
                      <TierBadge tier={u.tier} />
                      <span className="pill">{u.levelName || 'Shellborn'}</span>
                      <span className="pill">{xp} XP</span>
                    </div>
                    <ProgressMeter progress={u.progress} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </Page>
  );
}
