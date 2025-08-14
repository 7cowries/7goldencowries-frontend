import React, { useEffect, useMemo, useState } from "react";
import "./Profile.css";
import "../App.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

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
  const candidates = useMemo(() => {
    const items = [
      localStorage.getItem("wallet"),
      localStorage.getItem("ton_wallet"),
      localStorage.getItem("walletAddress"),
    ].filter(Boolean);
    return [...new Set(items)];
  }, []);

  const [address, setAddress] = useState(candidates[0] || "");
  const [loading, setLoading] = useState(false);

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

  const [toast, setToast] = useState(""); // ✅ mini banner

  const badgeSrc = useMemo(() => {
    const slug = (level.name || "unranked").toLowerCase().replace(/\s+/g, "-");
    return `/images/badges/level-${slug}.png`;
  }, [level.name]);

  async function tryLoadFor(addr) {
    const res = await fetch(
      `${API}/api/profile?wallet=${encodeURIComponent(addr)}`,
      { credentials: "include" }
    );
    if (!res.ok) return null;
    const data = await res.json();
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
  }

  async function loadProfile() {
    if (!address && candidates.length === 0) return;
    setLoading(true);
    try {
      let data = address ? await tryLoadFor(address) : null;

      if (!data) {
        for (const alt of candidates) {
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
      setLevel({
        name: p.levelName || p.level || "Shellborn",
        symbol: p.levelSymbol || "🐚",
        progress: p.levelProgress ?? 0,
        nextXP: p.nextXP ?? 10000,
      });
      setPerk(perksMap[p.levelName || p.level] || "");
      setTwitter(links.twitter || p.twitterHandle || "");
      setTelegram(links.telegram || "");
      setDiscord(links.discord || "");
      setHistory(Array.isArray(data.history) ? data.history : []);
    } catch (e) {
      console.error("Profile load failed:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line
  }, [address]);

  // refresh when coming back from OAuth
  useEffect(() => {
    const onVis = () => document.visibilityState === "visible" && loadProfile();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [address]);

  // ✅ show toast if ?linked=... present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linked = params.get("linked"); // twitter | telegram | discord
    if (linked) {
      const pretty =
        linked === "twitter"
          ? "X (Twitter)"
          : linked.charAt(0).toUpperCase() + linked.slice(1);
      setToast(`Connected ${pretty} ✅`);
      // clean URL
      params.delete("linked");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
      // hide after 3s
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  // Connect buttons: send base64 state
  const state = btoa(address || "");
  const connectTwitter = () => {
    if (!address) return alert("Connect wallet first");
    window.location.href = `${API}/auth/twitter?state=${state}`;
  };
  const connectTelegram = () => {
    if (!address) return alert("Connect wallet first");
    window.location.href = `${API}/auth/telegram/start?state=${state}`;
  };
  const connectDiscord = () => {
    if (!address) return alert("Connect wallet first");
    window.location.href = `${API}/auth/discord?state=${state}`;
  };

  return (
    <div className="page">
      {/* small toast */}
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

      <div className="section profile-wrapper">
        <h1 className="section-title">🌟 Explorer Profile</h1>

        {!address ? (
          <p>🔌 Connect your wallet to view your profile.</p>
        ) : (
          <>
            <div className="profile-card">
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
                  <strong>Twitter:</strong> {twitter || "🔗 Not linked"}
                </p>
                <p>
                  <strong>Telegram:</strong> {telegram || "🔗 Not linked"}
                </p>
                <p>
                  <strong>Discord:</strong> {discord || "🔗 Not linked"}
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

                <div className="connect-buttons">
                  <button className="connect-btn" onClick={connectTwitter}>
                    🐦 Connect X (Twitter)
                  </button>
                  <button className="connect-btn" onClick={connectTelegram}>
                    📣 Connect Telegram
                  </button>
                  <button className="connect-btn" onClick={connectDiscord}>
                    🎮 Connect Discord
                  </button>
                </div>
              </div>
            </div>

            <div className="history">
              <h2>📜 Quest History</h2>
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
                        {new Date(
                          q.completed_at || q.timestamp || Date.now()
                        ).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
