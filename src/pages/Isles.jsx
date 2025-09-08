// src/pages/Isles.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Isles.css";
import "../App.css";
import Page from "../components/Page";
import { getMe } from "../utils/api"; // ✅ use session-aware profile first

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ======================= Levels / Isles ======================= */
const LEVELS = [
  { id: 1, key: "Shellborn",        name: "Shellborn",        emoji: "🐚", tagline: "Born from tide and shell, a humble beginning.", perks: ["Starter badge", "Access to basic quests"] },
  { id: 2, key: "Wave Seeker",      name: "Wave Seeker",      emoji: "🌊", tagline: "Chaser of Naia’s whisper across waves.",        perks: ["Daily quests unlocked", "+2% XP boost"] },
  { id: 3, key: "Tide Whisperer",   name: "Tide Whisperer",   emoji: "🌀", tagline: "Speaks the sea’s secrets, calm yet deep.",      perks: ["Partner quests unlocked", "+4% XP boost"] },
  { id: 4, key: "Current Binder",   name: "Current Binder",   emoji: "🪙", tagline: "Bends the ocean’s will, quiet and strong.",     perks: ["Onchain quests unlocked", "+7% XP boost"] },
  { id: 5, key: "Pearl Bearer",     name: "Pearl Bearer",     emoji: "🫧", tagline: "Carries hidden virtue within.",                  perks: ["Limited time quests", "+10% XP boost"] },
  { id: 6, key: "Isle Champion",    name: "Isle Champion",    emoji: "🏝️", tagline: "Defender of the Isles, storm tested.",          perks: ["Exclusive drops", "+15% XP boost"] },
  { id: 7, key: "Cowrie Ascendant", name: "Cowrie Ascendant", emoji: "👑", tagline: "Myth reborn. Tidewalker. Legend.",                perks: ["Mythic badge", "Priority perks", "Max XP boost"] },
];

/* ======================= Helpers ======================= */
function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function normalizeUser(raw, prev = {}) {
  if (!raw || typeof raw !== "object") return prev;
  const base =
    raw.profile && typeof raw.profile === "object" ? raw.profile :
    raw.user && typeof raw.user === "object" ? raw.user :
    raw;

  const levelName = base.levelName ?? base.level ?? prev.levelName ?? "Shellborn";
  const xp = Number(base.xp ?? base.totalXP ?? base.total_xp ?? prev.xp ?? 0);
  const nextXP = Number(base.nextXP ?? base.next_level_xp ?? base.nextLevelXP ?? prev.nextXP ?? 100);

  let levelProgress =
    typeof base.levelProgress === "number" ? base.levelProgress :
    typeof base.progress === "number" ? base.progress :
    nextXP > 0 ? xp / nextXP : 0;

  if (levelProgress > 1) levelProgress = levelProgress / 100;

  return {
    wallet: base.wallet ?? base.address ?? prev.wallet ?? null,
    levelName,
    xp,
    nextXP,
    levelProgress: clamp01(levelProgress),
  };
}

function useWallet() {
  return useMemo(() => {
    const candidates = [
      localStorage.getItem("wallet"),
      localStorage.getItem("ton_wallet"),
      localStorage.getItem("walletAddress"),
    ].filter(Boolean);
    const chosen = candidates[0] || "";
    if (chosen) {
      localStorage.setItem("wallet", chosen);
      localStorage.setItem("ton_wallet", chosen);
      localStorage.setItem("walletAddress", chosen);
      window.dispatchEvent(new CustomEvent('wallet:changed', { detail: { wallet: chosen } }));
    }
    return chosen;
  }, []);
}

/* ======================= Confetti ======================= */
function Confetti({ active, onDone, duration = 4000 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let running = true;

    const DPR = window.devicePixelRatio || 1;
    function resize() {
      canvas.width = canvas.clientWidth * DPR;
      canvas.height = canvas.clientHeight * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const N = 180;
    const parts = Array.from({ length: N }).map(() => ({
      x: Math.random() * canvas.clientWidth,
      y: -10 + Math.random() * 20,
      vx: -1 + Math.random() * 2,
      vy: 1 + Math.random() * 2,
      g: 0.05,
      s: 4 + Math.random() * 6,
      r: Math.random() * Math.PI,
      vr: -0.1 + Math.random() * 0.2,
      hue: 40 + Math.random() * 60,
    }));

    const start = performance.now();
    function tick(t) {
      if (!running) return;
      const elapsed = t - start;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      parts.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        if (p.x < -10) p.x = canvas.clientWidth + 10;
        if (p.x > canvas.clientWidth + 10) p.x = -10;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = `hsl(${p.hue}, 90%, 60%)`;
        ctx.fillRect(-p.s, -p.s * 0.3, p.s * 2, p.s * 0.6);
        ctx.restore();
      });

      if (elapsed < duration) raf = requestAnimationFrame(tick);
      else { running = false; onDone?.(); }
    }
    raf = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [active, onDone, duration]);

  return <canvas className={`confetti ${active ? "show" : ""}`} ref={canvasRef} />;
}

/* ======================= Level Up Toast ======================= */
function LevelToast({ show, level, onClose }) {
  if (!show || !level) return null;
  return (
    <div className="toast" onClick={onClose}>
      <h3>Level Up</h3>
      <p>You unlocked <b>{level.name}</b></p>
      <ul>{level.perks.map((p, i) => <li key={i}>✅ {p}</li>)}</ul>
      <a href="/quests" className="toast-cta">Go claim rewards</a>
    </div>
  );
}

/* ======================= Waypoints ======================= */
const WAYPOINTS = [
  { cx: 10,  cy: 82 },
  { cx: 28,  cy: 64 },
  { cx: 45,  cy: 56 },
  { cx: 60,  cy: 42 },
  { cx: 70,  cy: 30 },
  { cx: 80,  cy: 20 },
  { cx: 90,  cy: 18 },
];

/* ======================= Ring ======================= */
function Ring({ size = 84, stroke = 8, percent = 0, label }) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = (percent / 100) * C;
  const rest = C - dash;

  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="ring-track" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        className="ring-progress"
        fill="none"
        strokeDasharray={`${dash} ${rest}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="ring-text">
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

/* ======================= Skeleton Loader ======================= */
function SkeletonGrid() {
  return (
    <main className="isles-map">
      <ul className="isle-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="isle-card skeleton">
            <div className="sk-row sk-title" />
            <div className="sk-row sk-sub" />
            <div className="sk-ring" />
            <div className="sk-chip-row">
              <span className="sk-chip" />
              <span className="sk-chip" />
              <span className="sk-chip" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

/* ======================= Server profile hook ======================= */
function useProfile(address) {
  const [profile, setProfile] = useState({
    wallet: null,
    levelName: "Shellborn",
    xp: 0,
    nextXP: 100,
    levelProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        // 1) Prefer session-aware /api/users/me
        const me = await getMe().catch(() => null);
        if (me?.authed) {
          const norm = normalizeUser(me, profile);
          if (!cancelled) setProfile(norm);
        } else if (address) {
          // 2) Fallback to legacy /api/profile?wallet=
          const url = `${API}/api/profile?wallet=${encodeURIComponent(address)}`;
          const res = await fetch(url, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            const norm = normalizeUser(data, profile);
            if (!cancelled) setProfile(norm);
          }
        }
      } catch (e) {
        console.error("Isles profile fetch failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();
    // periodic refresh
    const id = setInterval(fetchProfile, 10000);
    // refresh when user completes quests elsewhere
    const onQuests = () => fetchProfile();
    window.addEventListener("quests:updated", onQuests);
    // refresh when tab becomes visible again
    const onVis = () => document.visibilityState === "visible" && fetchProfile();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("quests:updated", onQuests);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [address]);

  const progressPct = Math.round(clamp01(profile.levelProgress) * 100);
  return { profile, progressPct, loading };
}

/* ======================= Page ======================= */
export default function Isles() {
  const address = useWallet();
  const { profile, progressPct, loading } = useProfile(address);

  const currentIndex = useMemo(() => {
    const idx = LEVELS.findIndex(
      (l) => (profile.levelName || "").toLowerCase() === l.key.toLowerCase()
    );
    return idx === -1 ? 0 : idx;
  }, [profile.levelName]);

  const [confettiOn, setConfettiOn] = useState(false);
  const [toastOn, setToastOn] = useState(false);
  const lastLevelRef = useRef(profile.levelName);

  useEffect(() => {
    if (lastLevelRef.current && lastLevelRef.current !== profile.levelName) {
      setConfettiOn(true);
      setToastOn(true);
    }
    lastLevelRef.current = profile.levelName || "Shellborn";
  }, [profile.levelName]);

  // auto-hide toast after a few seconds
  useEffect(() => {
    if (!toastOn) return;
    const t = setTimeout(() => setToastOn(false), 5000);
    return () => clearTimeout(t);
  }, [toastOn]);

  return (
    <Page>
      <div className="isles-page">
        <Confetti active={confettiOn} onDone={() => setConfettiOn(false)} />
      <LevelToast show={toastOn} level={LEVELS[currentIndex]} onClose={() => setToastOn(false)} />

      <header className="isles-header">
        <div>
          <h1>Seven Isles of Tides</h1>
          <p className="subtitle">
            Journey across the Isles. Unlock virtues. Become <span className="accent">Cowrie Ascendant</span>.
          </p>
        </div>

        <div className="profile-chip">
          <div className="chip-left">
            <span className="chip-title">{profile.levelName}</span>
            <span className="chip-sub">XP {profile.xp} / {profile.nextXP}</span>
          </div>
          <Ring percent={progressPct} label="Level progress" />
        </div>
      </header>

      {!loading ? (
        <main className="isles-map">
          <svg className="route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffd445" stopOpacity="1" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="100%" stopColor="#79c3ff" stopOpacity="1" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path
              d="M10,82 C25,60 35,65 45,55 S65,40 70,30 S80,15 90,18"
              className="route-path animated"
              stroke="url(#routeGrad)"
              filter="url(#glow)"
            />
            {WAYPOINTS.map((p, i) => (
              <g key={i} className={`waypoint ${i <= currentIndex ? "lit" : ""}`}>
                <circle cx={p.cx} cy={p.cy} r="1.8" className="wp-core" />
                <circle cx={p.cx} cy={p.cy} r="3.5" className="wp-bloom" />
              </g>
            ))}
          </svg>

          <ul className="isle-grid">
            {LEVELS.map((isle, i) => {
              const unlocked = i <= currentIndex;
              const isCurrent = i === currentIndex;
              const locked = i > currentIndex;

              return (
                <li
                  key={isle.key}
                  className={[
                    "isle-card",
                    unlocked ? "unlocked" : "",
                    locked ? "locked" : "",
                    isCurrent ? "current" : "",
                    `pos-${i + 1}`,
                  ].join(" ")}
                  aria-current={isCurrent ? "step" : undefined}
                  data-level={isle.key}
                >
                  <div className="isle-top">
                    <span className="isle-emoji" aria-hidden>{isle.emoji}</span>
                    <h3 className="isle-name">{isle.name}</h3>
                  </div>

                  <p className="isle-tagline">{isle.tagline}</p>

                  {isCurrent ? (
                    <div className="isle-progress">
                      <Ring size={72} stroke={7} percent={progressPct} />
                      <div className="progress-copy">
                        <strong>Current Isle</strong>
                        <span>Keep questing to advance</span>
                      </div>
                    </div>
                  ) : unlocked ? (
                    <div className="isle-state"><span className="pill good">Unlocked</span></div>
                  ) : (
                    <div className="isle-state">
                      <span className="pill">Locked</span>
                      <small className="unlock-hint">Reach <b>{LEVELS[i - 1]?.name || "previous level"}</b></small>
                    </div>
                  )}

                  <div className="isle-perks">
                    {isle.perks.slice(0, 3).map((perk, idx) => (
                      <span className="perk" key={idx}>{perk}</span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </main>
      ) : (
        <SkeletonGrid />
      )}

      <footer className="isles-footer">
        <a className="cta ghost" href="/profile">View Profile</a>
        <a className="cta primary" href="/quests">Continue Quests</a>
      </footer>
      </div>
    </Page>
  );
}
