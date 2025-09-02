// src/pages/Profile.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import "./Profile.css";
import "../App.css";
import { API_BASE, getMe, getJSON, postJSON } from "../utils/api";

// Optional: invite link shown if user linked Discord but isn't in the server
const DISCORD_INVITE = process.env.REACT_APP_DISCORD_INVITE || "";

// === NEW: Telegram embed constants ===
const TG_BOT_NAME = process.env.REACT_APP_TG_BOT_NAME || "GOLDENCOWRIEBOT";
const TG_VERIFY_URL = "https://www.7goldencowries.com/auth/telegram/verify";

const perksMap = {
  Shellborn: "Welcome badge + access to basic quests",
  "Wave Seeker": "Retweet quests unlocked",
  "Tide Whisperer": "Quote tasks and bonus XP",
  "Current Binder": "Leaderboard rank & Telegram quests",
  "Pearl Bearer": "Earn referral bonuses + badge",
  "Isle Champion": "Access secret quests and lore",
  "Cowrie Ascendant": "Unlock hidden realm + max power 🐚✨",
};

const ConnectButtons = () => null;

const stripAt = (h) => String(h || "").replace(/^@/, "");
function b64(s) {
  try { return window.btoa(unescape(encodeURIComponent(s || ""))); } catch { return ""; }
}

// === NEW: Embedded Telegram login widget ===
function TelegramLoginWidget({ wallet }) {
  useEffect(() => {
    const el = document.getElementById("tg-login-container");
    if (!el) return;
    el.innerHTML = ""; // clear any old widget

    if (!wallet || !TG_BOT_NAME) return;

    const state = b64(wallet);
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.setAttribute("data-telegram-login", TG_BOT_NAME); // must match @BotFather bot username (no @)
    s.setAttribute("data-size", "large");
    s.setAttribute("data-request-access", "write");
    s.setAttribute(
      "data-auth-url",
      `${TG_VERIFY_URL}?state=${encodeURIComponent(state)}`
    );
    el.appendChild(s);

    return () => { el.innerHTML = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  return (
    <div
      id="tg-login-container"
      style={{ marginTop: 10, display: "flex", justifyContent: "flex-start" }}
    />
  );
}

export default function Profile() {
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
  const [level, setLevel] = useState({ name: "Shellborn", symbol: "🐚", progress: 0, nextXP: 10000 });

  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [discord, setDiscord] = useState("");
  const [discordGuildMember, setDiscordGuildMember] = useState(false);

  const [perk, setPerk] = useState("");
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState("");

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
  }, [tonWallet, lsCandidates]);

  // Bind wallet to backend session (helps /api/users/me)
  useEffect(() => {
    if (!tonWallet) return;
    postJSON("/api/session/bind-wallet", { wallet: tonWallet }).catch(() => {});
  }, [tonWallet]);

  const badgeSrc = useMemo(() => {
    const slug = (level.name || "unranked").toLowerCase().replace(/\s+/g, "-");
    return `/images/badges/level-${slug}.png`;
  }, [level.name]);

  const applyProfile = useCallback((pObj) => {
    const p = pObj?.profile || {};
    const links = p?.links || {};
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

    setTwitter(stripAt(links.twitter || p.twitterHandle || ""));
    setTelegram(stripAt(links.telegram || p.telegramHandle || ""));
    setDiscord(String(links.discord || p.discordHandle || ""));
    setDiscordGuildMember(!!p.discordGuildMember);

    setHistory(Array.isArray(pObj?.history) ? pObj.history : []);
    if (p.wallet && !address) setAddress(p.wallet);
  }, [address]);

  const loadMe = useCallback(async () => {
    setError(""); setLoading(true);
    try {
      const me = await getMe();
      if (me?.authed) {
        applyProfile(me);
      } else if (address) {
        const legacy = await getJSON(`/api/profile?wallet=${encodeURIComponent(address)}`);
        applyProfile(legacy);
      } else {
        setHistory([]); setTwitter(""); setTelegram(""); setDiscord(""); setDiscordGuildMember(false);
        setXp(0); setTier("Free"); setLevel({ name: "Shellborn", symbol: "🐚", progress: 0, nextXP: 10000 });
      }
    } catch (e) {
      console.error(e); setError("Failed to load profile."); setHistory([]);
    } finally { setLoading(false); }
  }, [applyProfile, address]);

  useEffect(() => { loadMe(); }, [loadMe]);

  useEffect(() => {
    const onVis = () => document.visibilityState === "visible" && loadMe();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadMe]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linked = params.get("linked");
    const gm = params.get("guildMember");
    if (!linked) return;

    const pretty = linked === "twitter" ? "X (Twitter)" :
                   linked === "discord" ? "Discord" :
                   linked === "telegram" ? "Telegram" : linked;

    let msg = `Connected ${pretty} ✅`;
    if (linked === "discord" && gm) msg += gm === "true" ? " — server member 🎉" : " — please join our server";
    setToast(msg);

    params.delete("linked"); params.delete("guildMember");
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);

    let tries = 0;
    const id = setInterval(() => { loadMe(); if (++tries >= 8) clearInterval(id); }, 1000);
    const clear = setTimeout(() => { clearInterval(id); setToast(""); }, 8000);
    return () => { clearInterval(id); clearTimeout(clear); };
  }, [loadMe]);

  const state = b64(address || "");

  const connectTwitter = () => {
    if (!address) return alert("Connect wallet first");
    window.location.href = `${API_BASE}/auth/twitter?state=${state}`;
  };

  const connectTelegram = () => {
    if (!address) return alert("Connect wallet first");
    // Hosted flow; the embedded button below is an alternative
    window.location.href = `${API_BASE}/auth/telegram/start?state=${state}`;
  };

  const connectDiscord = async () => {
    if (!address) return alert("Connect wallet first");
    try {
      const resp = await getJSON(`/api/discord/login?state=${encodeURIComponent(state)}`);
      if (resp?.url) { window.location.href = resp.url; return; }
    } catch {}
    window.location.href = `${API_BASE}/auth/discord?state=${state}`;
  };

  return (
    <div className="page profile">
      {toast && (
        <div style={{
          position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)",
          background: "#10b981", color: "#041314", padding: "10px 14px",
          borderRadius: 12, fontWeight: 700, zIndex: 1000, boxShadow: "0 10px 30px rgba(0,0,0,.35)",
        }}>{toast}</div>
      )}

      <h1 className="section-title">🌊 Explorer Profile</h1>

      {!address ? (
        <p>🔌 Connect your TON wallet to view your profile.</p>
      ) : (
        <>
          {/* Top card */}
          <section className="card glass profile-card">
            <div className="profile-left">
              <img
                className="level-badge"
                src={badgeSrc}
                alt={level.name}
                onError={(e) => { e.currentTarget.src = "/images/badges/unranked.png"; }}
              />
              <p className="perk"><strong>🎁 Perk:</strong> {perk || "—"}</p>
            </div>

            <div className="profile-info">
              <p><strong>Wallet:</strong> {address.slice(0, 6)}...{address.slice(-4)}{" "}
                <button className="mini" onClick={() => {
                  navigator.clipboard?.writeText(address);
                  setToast("Wallet copied ✅"); setTimeout(() => setToast(""), 1500);
                }} style={{ marginLeft: 8 }}>Copy</button>
              </p>
              <p><strong>Subscription:</strong> {tier}</p>
              <p><strong>Level:</strong> {level.name} {level.symbol}</p>
              <p><strong>XP:</strong> {xp} / {level.nextXP ?? "∞"}</p>

              <div className="xp-bar">
                <div className="xp-fill" style={{
                  width: `${((level.progress ?? 0) * 100).toFixed(1)}%`,
                  transition: "width 0.8s ease-in-out",
                }}/>
              </div>
              <p className="progress-label">{((level.progress ?? 0) * 100).toFixed(1)}% to next virtue</p>

              <button className="connect-btn" style={{ marginTop: 8 }} onClick={() => loadMe()}>🔄 Refresh</button>
            </div>
          </section>

          {/* Connected Accounts */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>Connected Accounts</h3>
            {error && <p style={{ color: "#ff7a7a" }}>{error}</p>}
            <div className="social-status-list">
              <div className="social-status">
                <span>X (Twitter):</span>
                {twitter ? (
                  <a className="connected" href={`https://x.com/${stripAt(twitter)}`} target="_blank" rel="noreferrer">
                    ✅ @{stripAt(twitter)}
                  </a>
                ) : (<span className="not-connected">❌ Not Connected</span>)}
              </div>

              <div className="social-status">
                <span>Telegram:</span>
                {telegram ? (
                  <a className="connected" href={`https://t.me/${stripAt(telegram)}`} target="_blank" rel="noreferrer">
                    ✅ @{stripAt(telegram)}
                  </a>
                ) : (<span className="not-connected">❌ Not Connected</span>)}
              </div>

              <div className="social-status">
                <span>Discord:</span>
                {discord ? (
                  <span className="connected">
                    ✅ {discord}{" "}
                    <em style={{ opacity: 0.85 }}>
                      {discordGuildMember ? "(Server Member)" : "(Not in server)"}
                    </em>
                    {!discordGuildMember && DISCORD_INVITE && (
                      <> <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="inline-link" style={{ marginLeft: 6 }}>Join</a></>
                    )}
                  </span>
                ) : (<span className="not-connected">❌ Not Connected</span>)}
              </div>
            </div>
          </section>

          {/* Link New Accounts */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>Link New Accounts</h3>
            <p className="muted">Link your socials to unlock quests and show badges.</p>

            <ConnectButtons onLinked={() => loadMe()} />

            <div className="connect-buttons" style={{ marginTop: 12 }}>
              <button className="connect-btn" onClick={connectTwitter}>🐦 Connect X (Twitter)</button>
              <button className="connect-btn" onClick={connectTelegram}>📣 Connect Telegram</button>
              <button className="connect-btn" onClick={connectDiscord}>🎮 Connect Discord</button>
            </div>

            {/* === NEW: Embedded Telegram button (optional) === */}
            <p className="muted" style={{ marginTop: 8 }}>
              Having trouble with the popup? Use the embedded Telegram button below:
            </p>
            <TelegramLoginWidget wallet={address} />
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
