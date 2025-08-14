// src/pages/Leaderboard.js
import React, { useEffect, useState } from "react";
import "./Leaderboard.css";
import "../App.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const lore = {
  Shellborn: "Born from tide and shell — a humble beginning.",
  "Wave Seeker": "Chaser of Naiā’s whisper across waves.",
  "Tide Whisperer": "Speaks the sea’s secrets — calm yet deep.",
  "Current Binder": "Bends the ocean’s will — silent but strong.",
  "Pearl Bearer": "Carries hidden virtue within.",
  "Isle Champion": "Defender of the Isles — storm-tested.",
  "Cowrie Ascendant": "Myth reborn. Tidewalker. Legend.",
};

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/leaderboard`, { credentials: "include" });
        const data = await res.json();
        // backend returns: { top: [{ rank,wallet,xp,tier,name,progress,twitter }] }
        const rows = Array.isArray(data.top) ? data.top : [];
        setLeaders(rows);
      } catch (e) {
        console.error("Leaderboard fetch failed:", e);
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="page">
      <div className="section leaderboard-wrapper">
        <h1>🏆 Cowrie Leaderboard</h1>
        <p className="subtitle">Top explorers across the Seven Isles</p>

        {loading ? (
          <Skeleton />
        ) : leaders.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Podium entries={top3} />
            <List entries={rest} />
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Components ---------------------------- */

function Podium({ entries }) {
  if (entries.length === 0) return null;
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  return (
    <div className="podium">
      {second ? <PodiumStep place={2} user={second} tall={false} /> : <PodiumGhost />}
      {first ? <PodiumStep place={1} user={first} tall /> : <PodiumGhost />}
      {third ? <PodiumStep place={3} user={third} tall={false} /> : <PodiumGhost />}
    </div>
  );
}

function PodiumStep({ place, user, tall }) {
  const levelName = user?.name || "Shellborn";
  return (
    <div className={`podium-step ${tall ? "tall" : ""} place-${place}`}>
      <div className="podium-rank">#{user.rank}</div>
      <img
        className="podium-badge"
        src={badgeSrc(levelName)}
        alt={levelName}
        onError={(e) => (e.currentTarget.src = "/images/badges/unranked.png")}
      />
      <div className="podium-name">{shorten(user.wallet)}</div>
      {user.twitter && <div className="podium-twitter">🐦 @{user.twitter}</div>}
      <div className="podium-meta">
        <span className="pill">{user.tier || "Free"}</span>
        <span className="pill">{levelName}</span>
        <span className="pill">{formatXP(user.xp)} XP</span>
      </div>
      {/* ✅ the bug was here — must be an expression */}
      <Progress percent={user.progress ?? 0} lore={lore[levelName] || ""} />
    </div>
  );
}

function PodiumGhost() {
  return <div className="podium-step ghost" />;
}

function List({ entries }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="leaderboard-list">
      {entries.map((u) => {
        const levelName = u?.name || "Shellborn";
        return (
          <div key={`${u.rank}-${u.wallet}`} className="leader-card">
            <div className="rank-badge">#{u.rank}</div>

            <img
              className="user-badge"
              src={badgeSrc(levelName)}
              alt={levelName}
              onError={(e) => (e.currentTarget.src = "/images/badges/unranked.png")}
            />

            <div className="user-meta">
              <div className="user-line">
                <strong>{shorten(u.wallet)}</strong>
                {u.twitter && <span className="muted"> &nbsp;•&nbsp; 🐦 @{u.twitter}</span>}
              </div>
              <div className="user-line muted">
                {u.tier || "Free"} • {levelName} • {formatXP(u.xp)} XP
              </div>
              <Progress percent={u.progress ?? 0} lore={lore[levelName] || ""} compact />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Progress({ percent = 0, lore = "", compact = false }) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className={`progress-wrap ${compact ? "compact" : ""}`}>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
      {!compact && <small className="muted">{lore || "—"}</small>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="skeleton">
      <div className="skeleton-bar" />
      <div className="skeleton-list">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-item" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty">
      <p>Nobody here yet. Be the first to claim the tides! 🌊</p>
    </div>
  );
}

/* ----------------------------- Helpers ----------------------------- */

function shorten(addr = "") {
  if (!addr) return "—";
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function formatXP(xp) {
  try {
    return Number(xp || 0).toLocaleString();
  } catch {
    return xp || 0;
  }
}

function badgeSrc(levelName = "") {
  const slug = (levelName || "unranked").toLowerCase().replace(/\s+/g, "-");
  return `/images/badges/level-${slug}.png`;
}
