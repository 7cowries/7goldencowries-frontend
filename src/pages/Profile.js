// src/pages/Profile.js
import React, { useEffect, useMemo, useState } from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import "./Profile.css";
import "../App.css";
import { api } from "../utils/api"; // shared fetch wrapper
import ConnectButtons from "../components/ConnectButtons";
import "../components/ConnectButtons.css";

// Only used to build redirect URLs (auth links fallback)
const API_BASE = process.env.REACT_APP_API_URL || "";

const perksMap = {
  Shellborn: "Welcome badge + access to basic quests",
  "Wave Seeker": "Retweet quests unlocked",
  "Tide Whisperer": "Quote tasks and bonus XP",
  "Current Binder": "Leaderboard rank & Telegram quests",
  "Pearl Bearer": "Earn referral bonuses + badge",
  "Isle Champion": "Access secret quests and lore",
  "Cowrie Ascendant": "Unlock hidden realm + max power 🐚✨",
};

export default function Profile() {
  // Prefer the TonConnect wallet, fall back to any cached values
  const tonWallet = useTonAddress();
  const lsCandidates = useMemo(() => {
    const items = [
      localStorage.getItem("wallet"),
      localStorage.getItem("ton_wallet"),
      localStorage.getItem("walletAddress"),
    ].filter(Boolean);
    return [...new Set(items)];
  }, []);

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [xp, setXp] = useState(0);
  const [tier, setTier] = useState("Free");
  const [level, setLevel] = useState({
    name: "Shellborn",
    symbol: "🐚",
    progress: 0,
    nextXP: 10000,
  });

  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [discord, setDiscord] = useState("");
  const [perk, setPerk] = useState("");
  const [history, setHistory] = useState([]);

  const [toast, setToast] = useState("");

  // Choose best address source
  useEffect(() => {
    if (tonWallet) {
      setAddress(tonWallet);
      localStorage.setItem("wallet", tonWallet);
      localStorage.setItem("walletAddress", tonWallet);
      localStorage.setItem("ton_wallet", tonWallet);
    } else if (!address) {
      setAddress(lsCandidates[0] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tonWallet]);

  const badgeSrc = useMemo(() => {
    const slug = (level.name || "unranked").toLowerCase().replace(/\s+/g, "-");
    return `/images/badges/level-${slug}.png`;
  }, [level.name]);

  async function tryLoadFor(addr) {
    const path = `/api/profile?wallet=${encodeURIComponent(addr)}`;
    try {
      const data = await api(path);
      const p = data?.profile || {};
      const links = p?.links || {};
      const hasAny =
        p?.wallet ||
        typeof p?.xp === "number" ||
        !!links?.twitter ||
        !!links?.telegram ||
        !!links?.discord ||
        (Array.isArray(data?.history) && data.history.length > 0);
      return hasAny ? data : null;
    } catch (e) {
      return null;
    }
  }

  async function loadProfile() {
    setError("");
    if (!address && lsCandidates.length === 0) return;
    setLoading(true);
    try {
      let data = address ? await tryLoadFor(address) : null;

      // fall back to any other saved address
      if (!data) {
        for (const alt of lsCandidates) {
          if (alt === address) continue;
          const found = await tryLoadFor(alt);
          if (found) {
            data = found;
            setAddress(alt);
            localStorage.setItem("wallet", alt);
            localStorage.setItem("walletAddress", alt);
            localStorage.setItem("ton_wallet", alt);
            break;
          }
        }
      }

      if (!data) {
        // reset defaults
        setXp(0);
        setTier("Free");
        setLevel({ name: "Shellborn", symbol: "🐚", progress: 0, nextXP: 10000 });
        setTwitter("");
        setTelegram("");
        setDiscord("");
        setHistory([]);
        setPerk("");
        return;
      }

      const p = data.profile || {};
      const links = p.links || {};

      setXp(p.xp ?? 0);
      setTier(p.tier || p.subscriptionTier || "Free");
      const lvlName = p.levelName || p.level || "Shellborn";
      setLevel({
        name: lvlName,
        symbol: p.levelSymbol || "🐚",
        progress: p.levelProgress ?? 0,
        nextXP: p.nextXP ?? 10000,
      });
      setPerk(perksMap[lvlName] || "");
      setTwitter(links.twitter || p.twitterHandle || "");
      setTelegram(links.telegram || p.telegramHandle || "");
      setDiscord(links.discord || p.discordHandle || "");
      setHistory(Array.isArray(data.history) ? data.history : []);
    } catch (e) {
      setError("Failed to load profile.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (address) loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Reload after returning from OAuth (tab becomes visible again)
  useEffect(() => {
    const onVis = () => document.visibilityState === "visible" && loadProfile();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Small toast when ?linked=twitter|telegram|discord is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linked = params.get("linked");
    if (linked) {
      const pretty =
        linked === "twitter" ? "X (Twitter)" :
        linked === "discord" ? "Discord" :
        linked === "telegram" ? "Telegram" :
        linked;
      setToast(`Connected ${pretty} ✅`);
      params.delete("linked");
      const newUrl =
        window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  // Fallback direct links if ConnectButtons isn’t available for some reason
  const state = btoa(unescape(encodeURIComponent(address || "")));
  const connectTwitter = () => {
    if (!address) return alert("Connect wallet first");
    window.location.href = `${API_BASE}/auth/twitter?state=${state}`;
  };
  const connectDiscord = () => {
    if (!address) return alert("Connect wallet first");
    window.location.href = `${API_BASE}/auth/discord?state=${state}`;
  };

  return (
    <div className="page profile">
      {/* toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#10b981",
            color: "#041314",
            padding: "10px 14px",
            borderRadius: 12,
            fontWeight: 700,
            zIndex: 1000,
            boxShadow: "0 10px 30px rgba(0,0,0,.35)",
          }}
        >
          {toast}
        </div>
      )}

      <h1 className="section-title">🌊 Explorer Profile</h1>

      {!address ? (
        <p>🔌 Connect your TON wallet to view your profile.</p>
      ) : (
        <>
          {/* Top card: Badge + Wallet + Core stats */}
          <section className="card glass profile-card">
            <div className="profile-left">
              <img
                className="level-badge"
                src={badgeSrc}
                alt={level.name}
                onError={(e) => {
                  e.currentTarget.src = "/images/badges/unranked.png";
                }}
              />
              <p className="perk">
                <strong>🎁 Perk:</strong> {perk || "—"}
              </p>
            </div>

            <div className="profile-info">
              <p>
                <strong>Wallet:</strong>{" "}
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p>
                <strong>Subscription:</strong> {tier}
              </p>
              <p>
                <strong>Level:</strong> {level.name} {level.symbol}
              </p>
              <p>
                <strong>XP:</strong> {xp} / {level.nextXP ?? "∞"}
              </p>

              <div className="xp-bar">
                <div
                  className="xp-fill"
                  style={{
                    width: `${((level.progress ?? 0) * 100).toFixed(1)}%`,
                    transition: "width 0.8s ease-in-out",
                  }}
                />
              </div>
              <p className="progress-label">
                {((level.progress ?? 0) * 100).toFixed(1)}% to next virtue
              </p>
            </div>
          </section>

          {/* Connected Accounts */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>Connected Accounts</h3>
            {error && <p style={{ color: "#ff7a7a" }}>{error}</p>}
            <div className="social-status-list">
              <div className="social-status">
                <span>Twitter (X):</span>
                {twitter ? (
                  <span className="connected">✅ @{twitter.replace(/^@/, "")}</span>
                ) : (
                  <span className="not-connected">❌ Not Connected</span>
                )}
              </div>
              <div className="social-status">
                <span>Discord:</span>
                {discord ? (
                  <span className="connected">✅ {discord}</span>
                ) : (
                  <span className="not-connected">❌ Not Connected</span>
                )}
              </div>
              <div className="social-status">
                <span>Telegram:</span>
                {telegram ? (
                  <span className="connected">✅ {telegram}</span>
                ) : (
                  <span className="not-connected">❌ Not Connected</span>
                )}
              </div>
            </div>
          </section>

          {/* Connect buttons (uses Telegram Widget internally) */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>Link New Accounts</h3>
            <p className="muted">Link your socials to unlock quests and show badges.</p>

            {/* Use the shared ConnectButtons (recommended) */}
            <ConnectButtons onLinked={() => loadProfile()} />

            {/* Fallback mini row in case ConnectButtons is removed */}
            <div className="connect-buttons" style={{ marginTop: 12 }}>
              <button className="connect-btn" onClick={connectTwitter}>
                🐦 Connect X (Twitter)
              </button>
              <button className="connect-btn" onClick={connectDiscord}>
                🎮 Connect Discord
              </button>
              {/* Telegram handled by ConnectButtons; no fallback here because it requires the widget */}
            </div>
          </section>

          {/* Quest History */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>📜 Quest History</h3>
            {loading && <p>Loading…</p>}
            {!loading && history.length === 0 ? (
              <p>No quests completed yet.</p>
            ) : (
              <ul>
                {history.map((q, i) => (
                  <li key={q.id || i}>
                    <strong>{q.title}</strong> — +{q.xp} XP
                    <br />
                    <span className="timestamp">
                      {new Date(q.completed_at || q.timestamp || Date.now()).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
