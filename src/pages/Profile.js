// src/pages/Profile.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import "./Profile.css";
import "../App.css";
import { API_BASE, API_URLS, getMe } from "../utils/api";
import { ensureWalletBound } from "../utils/walletBind";
import { unlinkSocial, resyncSocial } from "../utils/socialLinks"; // ✅ RIGHT IMPORT

// Optional: invite link shown if user linked Discord but isn't in the server
const DISCORD_INVITE = process.env.REACT_APP_DISCORD_INVITE || "";

// Telegram embed constants
const TG_BOT_NAME =
  process.env.REACT_APP_TELEGRAM_BOT_NAME || "GOLDENCOWRIEBOT";
const TG_VERIFY_URL = API_URLS.telegramEmbedAuth;

const perksMap = {
  Shellborn: "Welcome badge + access to basic quests",
  "Wave Seeker": "Retweet quests unlocked",
  "Tide Whisperer": "Quote tasks and bonus XP",
  "Current Binder": "Leaderboard rank & Telegram quests",
  "Pearl Bearer": "Earn referral bonuses + badge",
  "Isle Champion": "Access secret quests and lore",
  "Cowrie Ascendant": "Unlock hidden realm + max power 🐚✨",
};

// Keep placeholder to preserve layout; we now use explicit buttons below
const ConnectButtons = () => null;

const stripAt = (h) => String(h || "").replace(/^@/, "");
function b64(s) {
  try {
    return window.btoa(unescape(encodeURIComponent(s || "")));
  } catch {
    return "";
  }
}

// Embedded Telegram login widget
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
    s.setAttribute("data-telegram-login", TG_BOT_NAME); // no @
    s.setAttribute("data-size", "large");
    s.setAttribute("data-request-access", "write");
    s.setAttribute("data-auth-url", `${TG_VERIFY_URL}?state=${encodeURIComponent(state)}`);
    el.appendChild(s);

    return () => {
      el.innerHTML = "";
    };
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
  const [level, setLevel] = useState({
    name: "Shellborn",
    symbol: "🐚",
    progress: 0,
    nextXP: 10000,
  });

  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [discord, setDiscord] = useState("");
  const [discordGuildMember, setDiscordGuildMember] = useState(false);

  const [perk, setPerk] = useState("");
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState("");

  // Busy flags for unlink/resync
  const [busy, setBusy] = useState({ twitter: false, telegram: false, discord: false });

  // Disable connect buttons while starting OAuth flows
  const [connecting, setConnecting] = useState({
    twitter: false,
    telegram: false,
    discord: false,
  });

  // Prefer TonConnect address; persist for later visits
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
    ensureWalletBound(tonWallet);
  }, [tonWallet]);

  const badgeSrc = useMemo(() => {
    const slug = (level.name || "unranked").toLowerCase().replace(/\s+/g, "-");
    return `/images/badges/level-${slug}.png`;
  }, [level.name]);

  const applyProfile = useCallback(
    (me) => {
      setXp(me.xp ?? 0);
      setTier(me.tier || me.subscriptionTier || "Free");

      const lvlName = me.level || "Shellborn";
      setLevel({
        name: lvlName,
        symbol: "🐚",
        progress: me.levelProgress ?? 0,
        nextXP: me.nextXP ?? 10000,
      });
      setPerk(perksMap[lvlName] || "");

      const socials = me.socials || {};
      setTwitter(
        socials.twitter?.connected ? stripAt(socials.twitter.username) : ""
      );
      setTelegram(
        socials.telegram?.connected ? stripAt(socials.telegram.username) : ""
      );
      setDiscord(
        socials.discord?.connected ? String(socials.discord.username) : ""
      );
      setDiscordGuildMember(false);

      const hist = Array.isArray(me?.history) ? me.history : [];
      setHistory(hist);

      if (me.wallet && !address) setAddress(me.wallet);
    },
    [address]
  );

  const loadMe = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const me = await getMe();
      applyProfile(me);
    } catch (e) {
      console.error(e);
      const msg = String(e?.message || e);
      if (msg.includes("Missing wallet") && (address || tonWallet)) {
        try {
          await ensureWalletBound(address || tonWallet);
          const me2 = await getMe();
          applyProfile(me2);
          return;
        } catch (err) {
          console.error(err);
        }
      }
      setError("Failed to load profile.");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [applyProfile, address, tonWallet]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  // Reload after OAuth tab becomes visible again
  useEffect(() => {
    const onVis = () => document.visibilityState === "visible" && loadMe();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadMe]);

  // Toast + brief polling when returning with ?connected=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const gm = params.get("guildMember");
    if (!connected) return;

    const pretty =
      connected === "twitter"
        ? "X (Twitter)"
        : connected === "discord"
        ? "Discord"
        : connected === "telegram"
        ? "Telegram"
        : connected;

    let msg = `Connected ${pretty} ✅`;
    if (connected === "discord" && gm) {
      msg += gm === "true" ? " — server member 🎉" : " — please join our server";
    }
    setToast(msg);

    // Clean URL
    params.delete("connected");
    params.delete("guildMember");
    const newUrl =
      window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);

    // Refresh now + brief polling
    let tries = 0;
    const id = setInterval(() => {
      loadMe();
      if (++tries >= 8) clearInterval(id);
    }, 1000);
    const clear = setTimeout(() => {
      clearInterval(id);
      setToast("");
    }, 8000);
    return () => {
      clearInterval(id);
      clearTimeout(clear);
    };
  }, [loadMe]);

  const state = b64(address || "");

  // Start Twitter OAuth on backend (session is set there)
  const connectTwitter = () => {
    if (!address) return alert("Connect wallet first");
    setConnecting((c) => ({ ...c, twitter: true }));
    window.location.href = API_URLS.twitterStart;
  };

  // Change "Connect Telegram" to scroll to the embedded widget (since that works)
  const connectTelegram = () => {
    if (!address) return alert("Connect wallet first");
    setConnecting((c) => ({ ...c, telegram: true }));
    const el = document.getElementById("tg-login-container");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setToast("Use the blue Telegram button below to connect ✅");
      setTimeout(() => setToast(""), 4000);
      setConnecting((c) => ({ ...c, telegram: false }));
    } else {
      // Fallback (rare): open hosted flow
      window.location.href = `${API_BASE}/auth/telegram/start?state=${state}`;
    }
  };

  const connectDiscord = () => {
    if (!address) return alert("Connect wallet first");
    setConnecting((c) => ({ ...c, discord: true }));
    window.location.href = API_URLS.discordStart;
  };

  // === Social unlink/resync actions ===
  const act = async (provider, fn) => {
    setBusy((b) => ({ ...b, [provider]: true }));
    try {
      await fn(provider);
      setToast(
        fn === unlinkSocial
          ? `Unlinked ${provider} ✅`
          : `Resynced ${provider} ✅`
      );
      setTimeout(() => setToast(""), 2500);
      await loadMe();
    } catch (e) {
      console.error(e);
      setError(`Action failed for ${provider}.`);
    } finally {
      setBusy((b) => ({ ...b, [provider]: false }));
    }
  };
  const doUnlink = (p) => act(p, unlinkSocial);
  const doResync = (p) => act(p, resyncSocial);

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
          {/* Top card */}
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
                {address.slice(0, 6)}...{address.slice(-4)}{" "}
                <button
                  className="mini"
                  onClick={() => {
                    navigator.clipboard?.writeText(address);
                    setToast("Wallet copied ✅");
                    setTimeout(() => setToast(""), 1500);
                  }}
                  style={{ marginLeft: 8 }}
                >
                  Copy
                </button>
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

              <button className="connect-btn" style={{ marginTop: 8 }} onClick={() => loadMe()}>
                🔄 Refresh
              </button>
            </div>
          </section>

          {/* Connected Accounts */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Connected Accounts</h3>
              <button className="mini" onClick={() => loadMe()}>Refresh</button>
            </div>
            {error && <p style={{ color: "#ff7a7a" }}>{error}</p>}

            <div className="social-status-list">
              {/* Twitter / X */}
              <div className="social-status">
                <span>X (Twitter):</span>
                {twitter ? (
                  <>
                    <a
                      className="connected"
                      href={`https://x.com/${stripAt(twitter)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ✅ @{stripAt(twitter)}
                    </a>
                    <div className="social-actions">
                      <button
                        className="mini"
                        onClick={connectTwitter}
                        disabled={connecting.twitter}
                      >
                        Connect
                      </button>
                      <button
                        className="mini"
                        disabled={busy.twitter}
                        onClick={() => doResync("twitter")}
                      >
                        {busy.twitter ? "Resync…" : "Resync"}
                      </button>
                      <button
                        className="mini"
                        disabled={busy.twitter}
                        onClick={() => doUnlink("twitter")}
                      >
                        {busy.twitter ? "Unlink…" : "Unlink"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="not-connected">❌ Not Connected</span>
                    <div className="social-actions">
                      <button
                        className="mini"
                        onClick={connectTwitter}
                        disabled={connecting.twitter}
                      >
                        Connect
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Telegram */}
              <div className="social-status">
                <span>Telegram:</span>
                {telegram ? (
                  <>
                    <a
                      className="connected"
                      href={`https://t.me/${stripAt(telegram)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ✅ @{stripAt(telegram)}
                    </a>
                    <div className="social-actions">
                      <button
                        className="mini"
                        onClick={connectTelegram}
                        disabled={connecting.telegram}
                      >
                        Connect
                      </button>
                      <button
                        className="mini"
                        disabled={busy.telegram}
                        onClick={() => doResync("telegram")}
                      >
                        {busy.telegram ? "Resync…" : "Resync"}
                      </button>
                      <button
                        className="mini"
                        disabled={busy.telegram}
                        onClick={() => doUnlink("telegram")}
                      >
                        {busy.telegram ? "Unlink…" : "Unlink"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="not-connected">❌ Not Connected</span>
                    <div className="social-actions">
                      <button
                        className="mini"
                        onClick={connectTelegram}
                        disabled={connecting.telegram}
                      >
                        Connect
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Discord */}
              <div className="social-status">
                <span>Discord:</span>
                {discord ? (
                  <>
                    <span className="connected">
                      ✅ {discord}{" "}
                      <em style={{ opacity: 0.85 }}>
                        {discordGuildMember ? "(Server Member)" : "(Not in server)"}
                      </em>
                      {!discordGuildMember && DISCORD_INVITE && (
                        <>
                          {" "}
                          <a
                            href={DISCORD_INVITE}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-link"
                            style={{ marginLeft: 6 }}
                          >
                            Join
                          </a>
                        </>
                      )}
                    </span>
                    <div className="social-actions">
                      <button
                        className="mini"
                        onClick={connectDiscord}
                        disabled={connecting.discord}
                      >
                        Connect
                      </button>
                      <button
                        className="mini"
                        disabled={busy.discord}
                        onClick={() => doResync("discord")}
                      >
                        {busy.discord ? "Resync…" : "Resync"}
                      </button>
                      <button
                        className="mini"
                        disabled={busy.discord}
                        onClick={() => doUnlink("discord")}
                      >
                        {busy.discord ? "Unlink…" : "Unlink"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="not-connected">❌ Not Connected</span>
                    <div className="social-actions">
                      <button
                        className="mini"
                        onClick={connectDiscord}
                        disabled={connecting.discord}
                      >
                        Connect
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Link New Accounts */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>Link New Accounts</h3>
            <p className="muted">Link your socials to unlock quests and show badges.</p>

            <ConnectButtons onLinked={() => loadMe()} />

            <div className="connect-buttons" style={{ marginTop: 12 }}>
              <button
                className="connect-btn"
                onClick={connectTwitter}
                disabled={connecting.twitter}
              >
                🐦 Connect X (Twitter)
              </button>
              <button
                className="connect-btn"
                onClick={connectTelegram}
                disabled={connecting.telegram}
              >
                📣 Connect Telegram
              </button>
              <button
                className="connect-btn"
                onClick={connectDiscord}
                disabled={connecting.discord}
              >
                🎮 Connect Discord
              </button>
            </div>

            {/* Embedded Telegram button (preferred) */}
            <p className="muted" style={{ marginTop: 8 }}>
              Having trouble with the popup? Use the embedded Telegram button below:
            </p>
            <TelegramLoginWidget wallet={address} />

            {/* Tiny fallback link to hosted flow, just in case */}
            <p className="muted" style={{ marginTop: 8 }}>
              If the button doesn’t render,{" "}
              <a href={`${API_BASE}/auth/telegram/start?state=${encodeURIComponent(b64(address || ""))}`}>
                open Telegram login
              </a>
              .
            </p>
          </section>

          {/* Quest History */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>📜 Quest History</h3>
            {loading && <p>Loading…</p>}
            {!loading && history.length === 0 ? (
              <p>No quests completed yet.</p>
            ) : (
              <ul>
                {history.map((q, i) => {
                  const when = q.created_at || q.completed_at || q.timestamp;
                  const ts = when ? new Date(when) : null;
                  return (
                    <li key={q.id || i}>
                      <strong>{q.title || q.reason || `Quest #${q.quest_id ?? q.id ?? ""}`}</strong> — +{q.xp ?? q.delta ?? 0} XP
                      <br />
                      <span className="timestamp">
                        {ts ? ts.toLocaleString() : "—"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
