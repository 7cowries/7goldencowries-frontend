// src/pages/Profile.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import "./Profile.css";
import "../App.css";
import { API_BASE, API_URLS, getMe } from "../utils/api";
import { ensureWalletBound } from "../utils/walletBind";
import WalletConnect from "../components/WalletConnect";
import ConnectButtons from "../components/ConnectButtons";

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


const DEFAULT_ME = {
  wallet: null,
  xp: 0,
  level: "Shellborn",
  levelName: "Shellborn",
  levelSymbol: "🐚",
  nextXP: 100,
  twitterHandle: null,
  telegramId: null,
  discordId: null,
  subscriptionTier: "Free",
  questHistory: [],
  referral_code: null,
};

const stripAt = (h) => String(h || "").replace(/^@/, "");
function b64(s) {
  try {
    const bytes = new TextEncoder().encode(s || "");
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
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
  const [me, setMe] = useState(DEFAULT_ME);

  const [tier, setTier] = useState("Free");
  const [level, setLevel] = useState({
    name: "Shellborn",
    symbol: "🐚",
    progress: 0,
    nextXP: 10000,
  });

  const [discordGuildMember, setDiscordGuildMember] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  // Prefer new nested socials; gracefully fallback to legacy top-level fields if present
  const socials = me?.socials || { twitter: {}, telegram: {}, discord: {} };
  const twitterConnected = !!(socials?.twitter?.connected || me?.twitterHandle);
  const telegramConnected = !!(socials?.telegram?.connected || me?.telegramHandle || me?.telegramId);
  const discordConnected = !!(socials?.discord?.connected || me?.discordId);
  const twitter = stripAt(socials?.twitter?.handle || me?.twitterHandle || '');
  const telegram = stripAt(socials?.telegram?.username || me?.telegramHandle || me?.telegramId || '');
  const discord = stripAt(socials?.discord?.id || me?.discordId || '');

  const [perk, setPerk] = useState("");
  const [toast, setToast] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

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
      window.dispatchEvent(
        new CustomEvent('wallet:changed', { detail: { wallet: tonWallet } })
      );
    } else if (!address) {
      setAddress(lsCandidates[0] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tonWallet, lsCandidates]);

  // Bind wallet to backend session (helps /api/users/me)
  useEffect(() => {
    if (tonWallet) ensureWalletBound(tonWallet);
  }, [tonWallet]);

  const badgeSrc = useMemo(() => {
    const slug = (level.name || "unranked").toLowerCase().replace(/\s+/g, "-");
    return `/images/badges/level-${slug}.png`;
  }, [level.name]);

  const applyProfile = useCallback(
    (raw) => {
      // Accept both { profile, history } shape and flat objects
      const meObj = raw && raw.profile ? { ...raw.profile } : { ...(raw || {}) };
      const hist =
        (raw && Array.isArray(raw.history) && raw.history) ||
        meObj.history ||
        meObj.questHistory ||
        [];

      const merged = { ...DEFAULT_ME, ...meObj, questHistory: hist };
      setMe(merged);

      if (!merged.wallet) {
        setHasProfile(false);
        return;
      }

      setTier(merged.tier || merged.subscriptionTier || "Free");

      const lvlName = merged.levelName || merged.level || "Shellborn";
      setLevel({
        name: lvlName,
        symbol: merged.levelSymbol || "🐚",
        progress: merged.levelProgress ?? 0,
        nextXP: merged.nextXP ?? 100,
      });
      setPerk(perksMap[lvlName] || "");

      setDiscordGuildMember(!!merged.discordGuildMember);
      setReferralCode(merged.referral_code || merged.referralCode || "");

      if (merged.wallet && !address) setAddress(merged.wallet);
      setHasProfile(true);
    },
    [address]
  );

  const loadMe = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const apiMe = await getMe();
      applyProfile(apiMe);
    } catch (e) {
      console.error(e);
      setError('Failed to load profile.');
      setMe(DEFAULT_ME);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  }, [applyProfile]);

  useEffect(() => {
    const w = localStorage.getItem('wallet');
    if (w) {
      ensureWalletBound(w).finally(() => loadMe());
    } else {
      loadMe();
    }
  }, [loadMe]);

  // Keep address in sync across tabs when wallet changes
  useEffect(() => {
    const update = (e) => {
      const w = e?.detail?.wallet || localStorage.getItem('wallet') || '';
      setAddress((a) => (a !== w ? w : a));
      if (w) {
        ensureWalletBound(w).finally(() => loadMe());
      } else {
        loadMe();
      }
    };
    const onStorage = (e) => {
      if (e.key === 'wallet') update();
    };
    window.addEventListener('wallet:changed', update);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('wallet:changed', update);
      window.removeEventListener('storage', onStorage);
    };
  }, [loadMe]);

  // Reload after OAuth tab becomes visible again
  useEffect(() => {
    const onVis = () => document.visibilityState === "visible" && loadMe();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadMe]);

  useEffect(() => {
    const onFocus = () => loadMe();
    window.addEventListener('focus', onFocus);
    window.addEventListener('profile-updated', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('profile-updated', onFocus);
    };
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
    window.location.href = `${API_URLS.twitterStart}?state=${state}`;
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
    window.location.href = `${API_URLS.discordStart}?state=${state}`;
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

      {loading ? (
        <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
      ) : !address || !hasProfile ? (
        <div style={{ textAlign: 'center' }}>
          <p>🔌 Connect your TON wallet to view your profile.</p>
          <WalletConnect />
        </div>
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
                <strong>Subscription:</strong> {tier ?? 'Free'}
              </p>
              <p>
                <strong>Level:</strong> {level.name ?? 'Shellborn'} {level.symbol ?? ''}
              </p>
              <p>
                <strong>XP:</strong> {me.xp ?? 0} / {me.nextXP ?? "∞"}
              </p>

              <div className="xp-bar">
                <div
                  className="xp-fill"
                  style={{
                    width: `${((me.levelProgress || 0) * 100).toFixed(1)}%`,
                    transition: "width 0.8s ease-in-out",
                  }}
                />
              </div>
              <p className="progress-label">
                {((me.levelProgress || 0) * 100).toFixed(1)}% — XP {me.xp} / {me.nextXP}
              </p>

              <button className="connect-btn" style={{ marginTop: 8 }} onClick={() => loadMe()}>
                🔄 Refresh
              </button>
            </div>
          </section>

          {/* Connected Accounts */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>Connected Accounts</h3>
            {error && <p style={{ color: "#ff7a7a" }}>{error}</p>}

            <div className="social-status-list">
              {/* Twitter / X */}
              <div className="social-status">
                <span>X (Twitter):</span>
                {twitterConnected ? (
                  <>
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
                      <span className="connected">✅ Connected</span>
                    )}
                    <div className="social-actions">
                      <button className="mini" disabled>
                        Connected
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
                {telegramConnected ? (
                  <>
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
                      <span className="connected">✅ Connected</span>
                    )}
                    <div className="social-actions">
                      <button className="mini" disabled>
                        Connected
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
                {discordConnected ? (
                  <>
                    <span className="connected">
                      ✅ {discord || 'Connected'}{" "}
                      {discord && (
                        <em style={{ opacity: 0.85 }}>
                          {discordGuildMember ? "(Server Member)" : "(Not in server)"}
                        </em>
                      )}
                      {!discordGuildMember && DISCORD_INVITE && discord && (
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
                      <button className="mini" disabled>
                        Connected
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

          {/* Quest History */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>📜 Quest History</h3>
            {loading && <p>Loading…</p>}
            {!loading && (!me?.questHistory || me.questHistory.length === 0) ? (
              <p>No quests completed yet.</p>
            ) : (
              <ul>
                {(me.questHistory || [])
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.completed_at || b.created_at || b.timestamp) -
                      new Date(a.completed_at || a.created_at || a.timestamp)
                  )
                  .map((q, i) => {
                    const when = q.completed_at || q.created_at || q.timestamp;
                    const ts = when ? new Date(when) : null;
                    return (
                      <li key={q.id || i}>
                        {q.title || q.reason || `Quest #${q.quest_id ?? q.id ?? ''}`} — {q.xp ?? q.delta ?? 0} XP
                        {ts ? (
                          <span className="timestamp"> • {ts.toLocaleDateString()}</span>
                        ) : null}
                      </li>
                    );
                  })}
              </ul>
            )}
          </section>

          {/* Link New Accounts */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>Link New Accounts</h3>
            <p className="muted">Link your socials to unlock quests and show badges.</p>

            <ConnectButtons address={address} onLinked={() => loadMe()} />

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

          {/* Referral Code */}
          <section className="card glass" style={{ marginTop: 16 }}>
            <h3>Referral</h3>
            {referralCode ? (
              <p>
                Share this link:{' '}
                <code>{`${window.location.origin}/?ref=${referralCode}`}</code>{' '}
                <button
                  className="mini"
                  onClick={() => {
                    const link = `${window.location.origin}/?ref=${referralCode}`;
                    navigator.clipboard?.writeText(link);
                    setToast('Referral link copied ✅');
                    setTimeout(() => setToast(''), 1500);
                  }}
                >
                  Copy Link
                </button>
              </p>
            ) : (
              <p>No referral code yet.</p>
            )}
          </section>

        </>
      )}
    </div>
  );
}
