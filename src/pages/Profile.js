// src/pages/Profile.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import "./Profile.css";
import "../App.css";
import { api } from "../utils/api"; // use only the api object

// ---------- Config & Helpers ----------
const API_BASE =
  (api && api.base) ||
  process.env.REACT_APP_API_URL ||
  (typeof window !== "undefined" && window.__API_BASE) ||
  "";

const DISCORD_INVITE = process.env.REACT_APP_DISCORD_INVITE || "";

const perksMap = {
  Shellborn: "Welcome badge + access to basic quests",
  "Wave Seeker": "Retweet quests unlocked",
  "Tide Whisperer": "Quote tasks and bonus XP",
  "Current Binder": "Leaderboard rank & Telegram quests",
  "Pearl Bearer": "Earn referral bonuses + badge",
  "Isle Champion": "Access secret quests and lore",
  "Cowrie Ascendant": "Unlock hidden realm + max power 🐚✨",
};

const ConnectButtons = () => null; // shared widget placeholder

const stripAt = (h) => String(h || "").replace(/^@/, "");

function b64(s) {
  try {
    return window.btoa(unescape(encodeURIComponent(s || "")));
  } catch {
    return "";
  }
}

function toQS(query) {
  if (!query) return "";
  const entries = Object.entries(query).filter(
    ([, v]) => v !== undefined && v !== null
  );
  if (!entries.length) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of entries) sp.append(k, String(v));
  return `?${sp.toString()}`;
}

// Minimal fallback if api.getJSON isn’t available in older builds
async function apiGetJSON(path, query) {
  if (api && typeof api.getJSON === "function") {
    return api.getJSON(path, query);
  }
  const url = `${API_BASE}${path}${toQS(query)}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function getOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

// ---------- Component ----------
export default function Profile() {
  // Prefer TonConnect, fall back to any cached values
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
  }, [tonWallet, lsCandidates]);

  const badgeSrc = useMemo(() => {
    const slug = (level.name || "unranked").toLowerCase().replace(/\s+/g, "-");
    return `/images/badges/level-${slug}.png`;
  }, [level.name]);

  // Core fetcher (memoized)
  const fetchProfile = useCallback(
    async (addr, { bust = false } = {}) => {
      const data = await apiGetJSON("/api/profile", {
        wallet: addr,
        t: bust ? Date.now() : undefined,
      });

      const p = data?.profile || {};
      const links = p?.links || {};

      setXp(p.xp ?? 0);
      const lvlName = p.levelName || p.level || "Shellborn";
      setTier(p.tier || p.subscriptionTier || "Free");
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

      setHistory(Array.isArray(data?.history) ? data.history : []);
    },
    []
  );

  // Wrapper with defaults + errors handled
  const loadProfile = useCallback(
    async ({ bust = false } = {}) => {
      setError("");
      const addr = address || lsCandidates[0];
      if (!addr) return;

      setLoading(true);
      try {
        await fetchProfile(addr, { bust });
      } catch (e) {
        console.error(e);
        setError("Failed to load profile.");
        // Reset sensible defaults
        setXp(0);
        setTier("Free");
        setLevel({ name: "Shellborn", symbol: "🐚", progress: 0, nextXP: 10000 });
        setTwitter("");
        setTelegram("");
        setDiscord("");
        setDiscordGuildMember(false);
        setHistory([]);
        setPerk("");
      } finally {
        setLoading(false);
      }
    },
    [address, lsCandidates, fetchProfile]
  );

  // Initial / on address change
  useEffect(() => {
    if (address) loadProfile({ bust: true });
  }, [address, loadProfile]);

  // Reload after returning from OAuth (tab became visible again)
  useEffect(() => {
    const onVis = () => document.visibilityState === "visible" && loadProfile({ bust: true });
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadProfile]);

  // Toast + quick polling on ?linked=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linked = params.get("linked");
    const gm = params.get("guildMember");
    if (!linked) return;

    const pretty =
      linked === "twitter" ? "X (Twitter)" :
      linked === "discord" ? "Discord" :
      linked === "telegram" ? "Telegram" : linked;

    let msg = `Connected ${pretty} ✅`;
    if (linked === "discord" && gm) {
      msg += gm === "true" ? " — server member 🎉" : " — please join our server";
    }
    setToast(msg);

    // Clean URL
    params.delete("linked");
    params.delete("guildMember");
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);

    // Refresh now + poll briefly to beat caches
    let tries = 0;
    const id = setInterval(() => {
      loadProfile({ bust: true });
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
  }, [loadProfile]);

  // --- Listen for popup Telegram link message (strict origin optional) ---
  useEffect(() => {
    const backendOrigin = getOrigin(API_BASE || window.location.origin);
    function handleTelegramLinked(event) {
      // If you want strict checking, uncomment next line:
      // if (backendOrigin && event.origin !== backendOrigin) return;
      if (event.data === "telegram-linked") {
        setToast("Connected Telegram ✅");
        loadProfile({ bust: true });
      }
    }
    window.addEventListener("message", handleTelegramLinked);
    return () => window.removeEventListener("message", handleTelegramLinked);
  }, [loadProfile]);

  // Fallback direct links if ConnectButtons isn’t available
  const state = b64(address || "");

  const connectTwitter = () => {
    if (!address) return alert("Connect wallet first");
    window.location.href = `${API_BASE}/auth/twitter?state=${state}`;
  };

  // --- Centered popup + fallback redirect ---
  const connectTelegram = () => {
    if (!address) return alert("Connect wallet first");
    // IMPORTANT: use a relative path so the popup URL stays on https://www.7goldencowries.com
    const url = `/auth/telegram/start?state=${state}`;

    const w = 500, h = 620;
    const y = (window.top?.outerHeight || window.innerHeight) / 2 + (window.top?.screenY || 0) - (h / 2);
    const x = (window.top?.outerWidth || window.innerWidth) / 2 + (window.top?.screenX || 0) - (w / 2);
    const popup = window.open(
      url,
      "tgpopup",
      `width=${w},height=${h},left=${x},top=${y},resizable,scrollbars`
    );

    if (!popup) {
      // Fallback if blocked
      window.location.href = url;
    }
  };

  const connectDiscord = async () => {
    if (!address) return alert("Connect wallet first");
    try {
      const resp = await apiGetJSON("/api/discord/login", { state });
      if (resp?.url) {
        window.location.href = resp.url;
        return;
      }
    } catch {
      // ignore; fall through
    }
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
              <p><strong>Subscription:</strong> {tier}</p>
              <p><strong>Level:</strong> {level.name} {level.symbol}</p>
              <p><strong>XP:</strong> {xp} / {level.nextXP ?? "∞"}</p>

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

              <button className="connect-btn" style={{ marginTop: 8 }} onClick={() => loadProfile({ bust: true })}>
                🔄 Refresh
              </button>
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
                  <a
                    className="connected"
                    href={`https://x.com/${stripAt(twitter)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ✅ @{stripAt(twitter)}
                  </a>
                ) : (
                  <span className="not-connected">❌ Not Connected</span>
                )}
              </div>

              <div className="social-status">
                <span>Telegram:</span>
                {telegram ? (
                  <a
                    className="connected"
                    href={`https://t.me/${stripAt(telegram)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ✅ @{stripAt(telegram)}
                  </a>
                ) : (
                  <span className="not-connected">❌ Not Connected</span>
                )}
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
                ) : (
                  <span className="not-connected">❌ Not Connected</span>
                )}
              </div>
            </div>
          </section>

          {/* Link New Accounts */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>Link New Accounts</h3>
            <p className="muted">Link your socials to unlock quests and show badges.</p>

            <ConnectButtons onLinked={() => loadProfile({ bust: true })} />

            <div className="connect-buttons" style={{ marginTop: 12 }}>
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
