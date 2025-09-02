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
import {
  getQuests,
  getMe,
  completeQuest as apiCompleteQuest,
} from "../utils/api";

const QUEST_TABS = ["all", "daily", "social", "partner", "insider", "onchain"];

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

        // Quests list (supports multiple mounts)
        const q = await getQuests();
        const list = Array.isArray(q) ? q : Array.isArray(q?.quests) ? q.quests : [];
        const normalized = list.map((quest) => ({
          id: Number(quest.id),
          title: quest.title,
          type: String(quest.type || "daily").toLowerCase(),
          url: quest.url || "#",
          xp: quest.xp ?? 0,
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

  // Complete quest flow
  const handleCompleteClick = async (quest) => {
    playClick();

    if (!wallet) {
      try {
        await tonUI.openModal();
      } catch {}
      alert("Connect your TON wallet to complete quests.");
      return;
    }

    await completeQuest(quest);
  };

  const completeQuest = async (quest) => {
    const { id: questId, xp: xpGain, title } = quest;
    const prevLevelName = level?.name || "Shellborn";

    try {
      await apiCompleteQuest({ wallet, questId, title, xp: xpGain });

      // Refresh session profile after completion
      const me = await getMe();
      if (me?.authed) {
        const p = me.profile || {};
        setXp(p.xp ?? 0);
        setTier(p.tier || p.subscriptionTier || "Free");
        setLevel({
          name: p.levelName || p.level || "Shellborn",
          symbol: p.levelSymbol || "🐚",
          progress: p.levelProgress ?? 0,
          nextXP: p.nextXP ?? 10000,
        });
      }

      // XP modal + sound
      setRecentXP(xpGain);
      setXPModalOpen(true);
      playXP();

      // Level-up detection
      const newLevelName = me?.profile?.levelName || level.name;
      const newLevelSymbol = me?.profile?.levelSymbol || level.symbol;
      if (newLevelName && newLevelName !== prevLevelName) {
        setUnlocked({ name: newLevelName, symbol: newLevelSymbol || "🐚" });
        setShowLevelModal(true);
      }

      // Mark completed locally
      setCompleted((prev) => (prev.includes(questId) ? prev : [...prev, questId]));
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
      );

      // 🎉
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

      // Notify other tabs/pages
      window.dispatchEvent(new Event("quests:updated"));
    } catch (err) {
      console.error("Quest complete error", err);
      alert(`Could not complete this quest. ${err?.message || "Please try again."}`);
    }
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
              const isDone = completed.includes(q.id) || q.completed;
              return (
                <div key={q.id} className="glass quest-card">
                  <div className="q-row">
                    <span className={`chip ${q.type}`}>
                      {q.type?.charAt(0).toUpperCase() + q.type?.slice(1)}
                    </span>
                    <span className="xp-badge">+{q.xp} XP</span>
                  </div>

                  <p className="quest-title">{q.title}</p>

                  <div className="actions">
                    <button
                      className="btn primary"
                      onClick={() => {
                        playClick();
                        if (q.url) window.open(q.url, "_blank", "noopener,noreferrer");
                      }}
                    >
                      Go to Quest
                    </button>

                    <button
                      className={`btn ${isDone ? "success" : "ghost"}`}
                      onClick={() => handleCompleteClick(q)}
                      disabled={isDone}
                      title={!wallet ? "Connect a wallet to complete quests" : ""}
                    >
                      {isDone ? "Completed" : "Complete"}
                    </button>
                  </div>
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
                src={`/images/badges/level-${unlocked.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}.png`}
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
