// src/pages/Quests.js
import React, { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import XPModal from "../components/XPModal";
import XPBar from "../components/XPBar";
import "../components/XPBar.css";
import "./Quests.css";
import "../App.css";

import { playClick, playXP } from "../utils/sounds";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

// API helpers (session-aware)
import { getQuests, getMe } from "../utils/api";

// NEW: secure quest utilities
import { startLinkQuest, finishLinkQuest } from "../utils/quests";
import { verifyTelegramJoin, verifyDiscordJoin } from "../utils/socialQuests";

const QUEST_TABS = ["all", "daily", "social", "partner", "insider", "onchain"];

// Helpers to detect social requirements from your legacy schema
const isTelegramReq = (req = "") =>
  ["tg_channel_member", "tg_group_member", "join_telegram", "join_telegram_channel", "join_telegram_group"].includes(
    String(req).toLowerCase()
  );
const isDiscordReq = (req = "") =>
  ["discord_member", "join_discord"].includes(String(req).toLowerCase());

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [completed, setCompleted] = useState([]); // quest IDs
  const [xp, setXp] = useState(0);
  const [tier, setTier] = useState("Free");
  const [level, setLevel] = useState({
    name: "Shellborn",
    symbol: "🐚",
    progress: 0,
    nextXP: 10000,
  });
  const [wallet, setWallet] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [unlocked, setUnlocked] = useState(null);
  const [xpModalOpen, setXPModalOpen] = useState(false);
  const [recentXP, setRecentXP] = useState(0);

  // NEW: per-quest countdown and claiming state
  const [timers, setTimers] = useState({}); // { [key]: secondsLeft }
  const [claiming, setClaiming] = useState({}); // { [key]: boolean }
  const [verifying, setVerifying] = useState(false); // for Telegram/Discord batch verify

  // TonConnect
  const tonAddress = useTonAddress();
  const [tonUI] = useTonConnectUI();

  // Persist any Ton wallet we learn about (helps other pages)
  useEffect(() => {
    if (tonAddress && tonAddress.length > 0) {
      setWallet(tonAddress);
      localStorage.setItem("wallet", tonAddress);
      localStorage.setItem("ton_wallet", tonAddress);
      localStorage.setItem("walletAddress", tonAddress);
    } else {
      const saved =
        localStorage.getItem("wallet") ||
        localStorage.getItem("ton_wallet") ||
        localStorage.getItem("walletAddress");
      if (saved) setWallet(saved);
    }
  }, [tonAddress]);

  // Initial load: session profile + quests
  useEffect(() => {
    (async () => {
      try {
        // Profile via session cookie
        const me = await getMe();
        if (me?.authed) {
          const p = me.profile || {};
          setWallet((w) => w || p.wallet || null);
          setXp(p.xp ?? 0);
          setTier(p.tier || p.subscriptionTier || "Free");
          setLevel({
            name: p.levelName || p.level || "Shellborn",
            symbol: p.levelSymbol || "🐚",
            progress: p.levelProgress ?? 0,
            nextXP: p.nextXP ?? 10000,
          });
          const done = Array.isArray(me.history)
            ? me.history.map((h) => Number(h.id)).filter((n) => !Number.isNaN(n))
            : [];
          setCompleted(done);
        }

        // Quests list (supports multiple shapes)
        const q = await getQuests();
        const list = Array.isArray(q) ? q : Array.isArray(q?.quests) ? q.quests : [];
        const normalized = list.map((quest) => ({
          id: Number(quest.id),
          code: quest.code || String(quest.id),
          title: quest.title,
          type: String(quest.type || "daily").toLowerCase(),
          url: quest.url || "",
          xp: quest.xp ?? 0,
          requirement: String(quest.requirement || "").toLowerCase(),
          active: quest.active !== 0, // default to active
          completed: !!quest.completed,
        }));
        setQuests(normalized);
      } catch (err) {
        console.error("Failed to load quests/profile", err);
        setQuests([]);
      }
    })();
  }, []);

  // Derived list per tab
  const shownQuests = useMemo(() => {
    if (activeTab === "all") return quests;
    return quests.filter((q) => (q.type || "").toLowerCase() === activeTab);
  }, [quests, activeTab]);

  // Tick all active countdowns
  useEffect(() => {
    const hasAny = Object.values(timers).some((v) => v > 0);
    if (!hasAny) return;
    const t = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (next[k] > 0) next[k] = next[k] - 1;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timers]);

  // Utility to refresh profile (after awards)
  const refreshProfile = async () => {
    try {
      const me = await getMe();
      if (!me?.authed) return;
      const p = me.profile || {};
      setXp(p.xp ?? 0);
      setTier(p.tier || p.subscriptionTier || "Free");
      const prevName = level?.name || "Shellborn";
      const newName = p.levelName || p.level || prevName;
      const newSymbol = p.levelSymbol || "🐚";
      setLevel({
        name: newName,
        symbol: newSymbol,
        progress: p.levelProgress ?? 0,
        nextXP: p.nextXP ?? 10000,
      });
      // Level-up detection
      if (newName && newName !== prevName) {
        setUnlocked({ name: newName, symbol: newSymbol || "🐚" });
        setShowLevelModal(true);
      }
    } catch (e) {
      console.error("Profile refresh failed", e);
    }
  };

  // ========= Secure flows =========

  // 1) Start a link quest (opens /r/:nonce and starts a countdown)
  const handleVisit = async (q) => {
    try {
      playClick();
      const key = q.code || String(q.id);
      const { redirectUrl, minSeconds, status } = await startLinkQuest(key);
      if (status === "already_completed") {
        // Mark completed locally
        setCompleted((prev) => (prev.includes(q.id) ? prev : [...prev, q.id]));
        setQuests((prev) => prev.map((it) => (it.id === q.id ? { ...it, completed: true } : it)));
        return;
      }
      if (redirectUrl) {
        // Start timer
        setTimers((m) => ({ ...m, [key]: Number(minSeconds || 7) }));
      }
    } catch (e) {
      console.error("startLinkQuest failed", e);
      alert("Could not open quest link. Please try again.");
    }
  };

  // 2) Claim a link quest (after the timer expires)
  const handleClaim = async (q) => {
    const key = q.code || String(q.id);
    setClaiming((m) => ({ ...m, [key]: true }));
    try {
      const { status, xp: gained, error } = await finishLinkQuest(key);
      if (error) {
        alert(error);
      } else {
        if (status === "completed") {
          // XP modal + sound
          setRecentXP(Number(gained || q.xp || 0));
          setXPModalOpen(true);
          playXP();
          // confetti
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          // mark completed
          setCompleted((prev) => (prev.includes(q.id) ? prev : [...prev, q.id]));
          setQuests((prev) => prev.map((it) => (it.id === q.id ? { ...it, completed: true } : it)));
          // refresh profile
          await refreshProfile();
        } else if (status === "already_completed") {
          setCompleted((prev) => (prev.includes(q.id) ? prev : [...prev, q.id]));
          setQuests((prev) => prev.map((it) => (it.id === q.id ? { ...it, completed: true } : it)));
        } else {
          // e.g., Too fast
          alert(status || "Unable to claim yet.");
        }
      }
    } catch (e) {
      console.error("finishLinkQuest failed", e);
      alert("Could not claim. Please try again.");
    } finally {
      setClaiming((m) => ({ ...m, [key]: false }));
      // clear timer
      setTimers((m) => {
        const copy = { ...m };
        delete copy[key];
        return copy;
      });
    }
  };

  // 3) Telegram verify (all/group/channel)
  const handleVerifyTelegram = async (target /* 'group'|'channel'|undefined */) => {
    try {
      playClick();
      setVerifying(true);
      const { ok, results, error } = await verifyTelegramJoin(target);
      if (error) {
        alert(error);
      } else if (ok) {
        const earned = (results || []).filter((r) => r.status === "completed");
        if (earned.length) {
          const total = earned.reduce((s, r) => s + (r.xp || 0), 0);
          setRecentXP(total);
          setXPModalOpen(true);
          playXP();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
          await refreshProfile();
        } else {
          const notYet = (results || []).find((r) => r.status === "not_member");
          if (notYet) alert(`Join the Telegram ${notYet.target} first, then verify again.`);
          else alert("Nothing to verify right now.");
        }
      } else {
        alert("Telegram verify failed.");
      }
    } catch (e) {
      console.error("verifyTelegramJoin failed", e);
      alert("Telegram verify failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  // 4) Discord verify
  const handleVerifyDiscord = async () => {
    try {
      playClick();
      setVerifying(true);
      const { status, xp: gained, error } = await verifyDiscordJoin();
      if (error) {
        alert(error);
      } else if (status === "completed") {
        setRecentXP(Number(gained || 0));
        setXPModalOpen(true);
        playXP();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
        await refreshProfile();
      } else if (status === "already_completed") {
        alert("Discord quest already completed ✅");
      } else {
        alert(status || "Nothing to verify.");
      }
    } catch (e) {
      console.error("verifyDiscordJoin failed", e);
      alert("Discord verify failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  // Render helpers for actions
  const renderActions = (q) => {
    const key = q.code || String(q.id);
    const secondsLeft = timers[key] ?? 0;
    const isDone = completed.includes(q.id) || q.completed;

    // Telegram/Discord verify buttons take precedence if required
    if (isTelegramReq(q.requirement)) {
      return (
        <div className="actions">
          <button className="btn" disabled={verifying} onClick={() => handleVerifyTelegram()}>
            {verifying ? "Verifying…" : "Verify Telegram (All)"}
          </button>
          <button className="btn ghost" disabled={verifying} onClick={() => handleVerifyTelegram("group")}>
            Group
          </button>
          <button className="btn ghost" disabled={verifying} onClick={() => handleVerifyTelegram("channel")}>
            Channel
          </button>
        </div>
      );
    }
    if (isDiscordReq(q.requirement)) {
      return (
        <div className="actions">
          <button className="btn" disabled={verifying} onClick={handleVerifyDiscord}>
            {verifying ? "Verifying…" : "Verify Discord"}
          </button>
        </div>
      );
    }

    // Link / visit quests (secure start → claim)
    if (q.url && q.active) {
      return (
        <div className="actions">
          {secondsLeft > 0 ? (
            <button className="btn" disabled>
              Wait {secondsLeft}s…
            </button>
          ) : isDone ? (
            <button className="btn success" disabled>
              Completed
            </button>
          ) : (
            <>
              <button className="btn primary" onClick={() => handleVisit(q)}>
                Visit
              </button>
              <button
                className="btn ghost"
                disabled={!!claiming[key]}
                onClick={() => handleClaim(q)}
                title="Click after the timer finishes"
              >
                {claiming[key] ? "Claiming…" : "Claim"}
              </button>
            </>
          )}
        </div>
      );
    }

    // Fallback: just a disabled “Complete” (we no longer use DEV_COMPLETE)
    return (
      <div className="actions">
        <button className="btn ghost" disabled title="No action available">
          Complete
        </button>
      </div>
    );
  };

  return (
    <div className="page">
      {/* Background video */}
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/videos/sea-goddess.mp4" type="video/mp4" />
      </video>
      <div className="veil" />

      <div className="q-container">
        {/* Profile strip */}
        <div className="glass profile-strip">
          <div>
            <p className="muted mono">Wallet</p>
            <p className="mono">{wallet || "—"}</p>
          </div>
          <div>
            <p className="muted mono">XP • Tier • Level</p>
            <p className="mono">
              {xp} • {tier} • {level.symbol} {level.name}
            </p>
            <XPBar xp={xp} nextXP={level.nextXP || 10000} />
          </div>
          <div className="pill">{tier}</div>
        </div>

        {/* Header + tabs */}
        <div className="glass-strong q-header">
          <div className="q-title">
            <span className="emoji">📜</span>
            <h1>Quests</h1>
          </div>
          <p className="subtitle">Complete tasks. Earn XP. Level up.</p>

          <div className="tabs">
            {QUEST_TABS.map((type) => (
              <button
                key={type}
                className={`tab ${activeTab === type ? "active" : ""}`}
                onClick={() => {
                  playClick();
                  setActiveTab(type);
                }}
              >
                {type === "all" && "All Quests"}
                {type === "daily" && "📅 Daily"}
                {type === "social" && "🌐 Social"}
                {type === "partner" && "🤝 Partner"}
                {type === "insider" && "🧠 Insider"}
                {type === "onchain" && "🧾 Onchain"}
              </button>
            ))}
          </div>
        </div>

        {/* Quest list */}
        <div className="q-list">
          {shownQuests.length === 0 ? (
            <div className="glass quest-card">
              <p className="quest-title">No quests yet for this category.</p>
            </div>
          ) : (
            shownQuests.map((q) => {
              return (
                <div key={q.id} className="glass quest-card">
                  <div className="q-row">
                    <span className={`chip ${q.type}`}>
                      {q.type?.charAt(0).toUpperCase() + q.type?.slice(1)}
                    </span>
                    <span className="xp-badge">+{q.xp} XP</span>
                  </div>

                  <p className="quest-title">{q.title || q.code}</p>

                  {q.url ? (
                    <div className="muted mono" style={{ wordBreak: "break-all" }}>
                      {q.url}
                    </div>
                  ) : null}

                  {renderActions(q)}
                </div>
              );
            })
          )}
        </div>

        {/* Level-up modal */}
        {showLevelModal && unlocked && (
          <div className="modal">
            <div className="glass-strong modal-box">
              <h2>🎉 Level Up!</h2>
              <img
                src={`/images/badges/level-${unlocked.name.toLowerCase().replace(/\s+/g, "-")}.png`}
                alt={unlocked.name}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <p>
                {unlocked.symbol} You unlocked <strong>{unlocked.name}</strong>!
              </p>
              <button className="btn primary" onClick={() => setShowLevelModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* XP modal */}
        {xpModalOpen && <XPModal xpGained={recentXP} onClose={() => setXPModalOpen(false)} />}
      </div>
    </div>
  );
}
