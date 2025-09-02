// src/pages/Leaderboard.js
import React, { useEffect, useState } from "react";
import "./Leaderboard.css";
import "../App.css";
import { apiGet } from "../utils/api"; // ✅ use your helper

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
    let alive = true;
    (async () => {
      try {
        const data = await apiGet("/api/leaderboard");

        const rows = Array.isArray(data) ? data : Array.isArray(data?.top) ? data.top : [];
        const normalized = rows.map((u, i) => {
          const levelName = u.name ?? u.levelName ?? "Shellborn";
          return {
            rank: u.rank ?? i + 1,
            wallet: u.wallet ?? "",
            twitter: u.twitter ?? u.twitterHandle ?? "",
            name: levelName,
            xp: Number(u.xp ?? 0),
            tier: u.tier ?? "Free",
            // backend gives 0..1 — convert to percent for the bar component
            progressPct: Math.max(0, Math.min(1, Number(u.progress ?? 0))) * 100,
            badge: u.badge ?? badgeSrc(levelName),
          };
        });

        if (alive) setLeaders(normalized);
      } catch (e) {
        console.error("Leaderboard fetch failed:", e);
        if (alive) setLeaders([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
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
  const handleCopy = () => {
    if (!user.wallet) return;
    navigator.clipboard?.writeText(user.wallet);
  };

  return (
    <div className={`podium-step ${tall ? "tall" : ""} place-${place}`}>
      <div className="podium-rank">#{user.rank}</div>
      <img
        className="podium-badge"
        src={user.badge || badgeSrc(levelName)}
        alt={levelName}
        onError={(e) => (e.currentTarget.src = "/images/badges/unranked.png")}
      />
      <div className="podium-name" title={user.wallet} onClick={handleCopy} style={{ cursor: "pointer" }}>
        {shorten(user.wallet)}
      </div>
      {user.twitter && (
        <div className="podium-twitter">
          <a
            href={`https://x.com/${user.twitter}`}
            className="lb-link"
            target="_blank"
            rel="noreferrer"
          >
            🐦 @{user.twitter}
          </a>
        </div>
      )}
      <div className="podium-meta">
        <span className="pill">{user.tier || "Free"}</span>
        <span className="pill">{levelName}</span>
        <span className="pill">{formatXP(user.xp)} XP</span>
      </div>
      <Progress percent={user.progressPct ?? 0} lore={lore[levelName] || ""} />
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
        const handleCopy = () => {
          if (!u.wallet) return;
          navigator.clipboard?.writeText(u.wallet);
        };
        return (
          <div key={`${u.rank}-${u.wallet}`} className="leader-card">
            <div className="rank-badge">#{u.rank}</div>

            <img
              className="user-badge"
              src={u.badge || badgeSrc(levelName)}
              alt={levelName}
              onError={(e) => (e.currentTarget.src = "/images/badges/unranked.png")}
            />

            <div className="user-meta">
              <div className="user-line">
                <strong title={u.wallet} onClick={handleCopy} style={{ cursor: "pointer" }}>
                  {shorten(u.wallet)}
                </strong>
                {u.twitter && (
                  <span className="muted">
                    &nbsp;•&nbsp;
                    <a
                      href={`https://x.com/${u.twitter}`}
                      className="lb-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      🐦 @{u.twitter}
                    </a>
                  </span>
                )}
              </div>
              <div className="user-line muted">
                {u.tier || "Free"} • {levelName} • {formatXP(u.xp)} XP
              </div>
              <Progress percent={u.progressPct ?? 0} lore={lore[levelName] || ""} compact />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Progress({ percent = 0, lore = "", compact = false }) {
  // percent expected 0..100
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
