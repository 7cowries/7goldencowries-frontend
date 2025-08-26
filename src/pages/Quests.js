// src/pages/Quests.js
import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import XPModal from "../components/XPModal";
import XPBar from "../components/XPBar";
import "../components/XPBar.css";
import "./Quests.css";
import "../App.css";

// 🔊 Sound
import { playClick, playXP } from "../utils/sounds";

// 🔗 TonConnect
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

// ✅ Unified API helpers (talks to Render)
import { getQuests, getProfile, postJSON, API_BASE } from "../utils/api";

const Quests = () => {
  const [quests, setQuests] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [xp, setXp] = useState(0);
  const [tier, setTier] = useState("Free");
  const [level, setLevel] = useState({
    name: "Shellborn",
    symbol: "🐚",
    progress: 0,
    nextXP: 10000,
  });
  const [wallet, setWallet] = useState(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [unlocked, setUnlocked] = useState(null);
  const [xpModalOpen, setXPModalOpen] = useState(false);
  const [recentXP, setRecentXP] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  // TonConnect
  const tonAddress = useTonAddress();
  const [tonUI] = useTonConnectUI();

  // 0) Previously saved wallet (before TonConnect)
  useEffect(() => {
    const saved =
      localStorage.getItem("wallet") ||
      localStorage.getItem("ton_wallet") ||
      localStorage.getItem("walletAddress");
    if (saved) setWallet(saved);
  }, []);

  // 1) Whenever TonConnect provides an address, save + use it
  useEffect(() => {
    if (tonAddress && tonAddress.length > 0) {
      setWallet(tonAddress);
      localStorage.setItem("wallet", tonAddress);
      localStorage.setItem("ton_wallet", tonAddress);
      localStorage.setItem("walletAddress", tonAddress);
    }
  }, [tonAddress]);

  // 2) Load quests (no wallet required)
  useEffect(() => {
    const loadQuests = async () => {
      try {
        const data = await getQuests();
        // Support both {quests: [...]} and plain array
        const list = Array.isArray(data) ? data : Array.isArray(data?.quests) ? data.quests : [];
        const normalized = list.map((q) => ({
          id: q.id,
          title: q.title,
          type: (q.type || "daily").toLowerCase(),
          url: q.url || "#",
          xp: q.xp ?? 0,
          completed: !!q.completed,
        }));
        setQuests(normalized);
      } catch (err) {
        console.error("Failed to load quests", err);
        setQuests([]);
      }
    };
    loadQuests();
  }, []);

  // Helpers: completed + profile
  async function loadCompleted(addr) {
    try {
      // ✅ canonical route is /api/quest/completed/:wallet
      const res = await fetch(`${API_BASE}/api/quest/completed/${encodeURIComponent(addr)}`, {
        credentials: "include",
      });
      if (res.ok) {
        const j = await res.json();
        if (Array.isArray(j?.completed)) {
          setCompleted(j.completed.map((x) => Number(x)));
          return;
        }
      }
      setCompleted([]);
    } catch (e) {
      console.error("Completed fetch failed", e);
      setCompleted([]);
    }
  }

  async function loadProfile(addr) {
    try {
      const data = await getProfile(addr);
      const p = data?.profile || {};
      setXp(p.xp ?? 0);
      const nextTier = p.subscriptionTier || p.tier || "Free";
      setTier(nextTier);
      setLevel({
        name: p.levelName || p.level || "Shellborn",
        symbol: p.levelSymbol || "🐚",
        progress: p.levelProgress ?? 0,
        nextXP: p.nextXP ?? 10000,
      });
      return {
        xp: p.xp ?? 0,
        tier: nextTier,
        levelName: p.levelName || p.level || "Shellborn",
        levelSymbol: p.levelSymbol || "🐚",
        nextXP: p.nextXP ?? 10000,
        progress: p.levelProgress ?? 0,
      };
    } catch (e) {
      console.error("Profile fetch failed", e);
      return null;
    }
  }

  // 3) With a wallet present, load profile + completed
  useEffect(() => {
    if (!wallet) return;
    loadCompleted(wallet);
    loadProfile(wallet);
  }, [wallet]);

  // 4) Complete quest handler
  const handleCompleteClick = async (quest) => {
    playClick();

    if (!wallet) {
      try {
        await tonUI.openModal();
      } catch {}
      alert("Connect / save a wallet to complete quests.");
      return;
    }
    await completeQuest(quest);
  };

  const completeQuest = async (quest) => {
    const { id: questId, xp: xpGain, title } = quest;
    const prevLevelName = level?.name || "Shellborn";

    try {
      // ✅ canonical complete endpoint
      await postJSON("/api/quest/complete", { wallet, questId, title, xp: xpGain });

      // Refresh profile
      const newProfile = await loadProfile(wallet);

      // Show XP modal
      setRecentXP(xpGain);
      setXPModalOpen(true);
      playXP();

      // Detect level up
      const newLevelName = newProfile?.levelName || level.name;
      const newLevelSymbol = newProfile?.levelSymbol || level.symbol;
      if (newLevelName && newLevelName !== prevLevelName) {
        setUnlocked({ name: newLevelName, symbol: newLevelSymbol || "🐚" });
        setShowLevelModal(true);
      }

      // Mark as completed locally
      setCompleted((prev) => (prev.includes(questId) ? prev : [...prev, questId]));
      setQuests((prev) => prev.map((q) => (q.id === questId ? { ...q, completed: true } : q)));

      // Confetti 🎉
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

      // 🔔 Notify other pages
      window.dispatchEvent(new Event("quests:updated"));
    } catch (err) {
      console.error("Quest complete error", err);
      alert(`Could not complete this quest. ${err?.message || "Please try again."}`);
    }
  };

  const filterQuests = (type) => {
    if (type === "all") return quests;
    return quests.filter((q) => (q.type || "").toLowerCase() === type);
  };

  const questTypes = ["all", "daily", "social", "partner", "insider", "onchain"];

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
            {questTypes.map((type) => (
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
          {filterQuests(activeTab).length === 0 ? (
            <div className="glass quest-card">
              <p className="quest-title">No quests yet for this category.</p>
            </div>
          ) : (
            filterQuests(activeTab).map((q) => {
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
        {xpModalOpen && (
          <XPModal xpGained={recentXP} onClose={() => setXPModalOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default Quests;
