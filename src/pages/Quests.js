// src/pages/Quests.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import confetti from "canvas-confetti";
import XPModal from "../components/XPModal";
import XPBar from "../components/XPBar";
import "../components/XPBar.css";
import "./Quests.css";
import "../App.css";

// 🔊 Sound helpers (use playXP, not playChime)
import { playClick, playXP } from "../utils/sounds";

// 🔗 TonConnect (reads current wallet + opens connect modal)
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

  // 👉 TonConnect hooks
  const tonAddress = useTonAddress();
  const [tonUI] = useTonConnectUI();

  // 0) Pick up any previously saved wallet (before TonConnect)
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
        const res = await axios.get(`${API}/quests`, { withCredentials: true });
        const fixed = (res.data || []).map((q) => ({
          id: q.id,
          title: q.title,
          type: q.type || "daily",
          url: q.url || "#",
          xp: q.xp ?? 0,
        }));
        setQuests(fixed);
      } catch (err) {
        console.error("Failed to load quests", err);
        setQuests([]);
      }
    };
    loadQuests();
  }, []);

  // Helpers: load completed + profile (uses unified /api/profile)
  const loadCompleted = async (addr) => {
    try {
      const res = await axios.get(`${API}/completed/${addr}`, {
        withCredentials: true,
      });
      setCompleted(res.data.completed || []);
    } catch (err) {
      console.error("Failed to load completed quests", err);
    }
  };

  const loadProfile = async (addr) => {
    try {
      const res = await axios.get(
        `${API}/api/profile?wallet=${encodeURIComponent(addr)}`,
        { withCredentials: true }
      );
      const data = res.data || {};
      const p = data.profile || {};

      setXp(p.xp ?? 0);
      setTier(p.subscriptionTier || p.tier || "Free");
      setLevel({
        name: p.levelName || p.level || "Shellborn",
        symbol: p.levelSymbol || "🐚",
        progress: p.levelProgress ?? 0,
        nextXP: p.nextXP ?? 10000,
      });

      return {
        xp: p.xp ?? 0,
        tier: p.subscriptionTier || p.tier || "Free",
        levelName: p.levelName || p.level || "Shellborn",
        levelSymbol: p.levelSymbol || "🐚",
        nextXP: p.nextXP ?? 10000,
        progress: p.levelProgress ?? 0,
      };
    } catch (err) {
      console.error("Profile fetch failed", err);
      return null;
    }
  };

  // 3) With a wallet present, load profile + completed
  useEffect(() => {
    if (!wallet) return;
    loadCompleted(wallet);
    loadProfile(wallet);
  }, [wallet]);

  // 4) Complete quest handler that opens wallet if needed
  const handleCompleteClick = async (quest) => {
    playClick();

    if (!wallet) {
      try {
        await tonUI.openModal(); // open TonConnect modal
      } catch {}
      alert("Connect / save a wallet to complete quests.");
      return;
    }
    await completeQuest(quest);
  };

  // ▶️ Complete quest + refresh local state + notify Profile
  const completeQuest = async (quest) => {
    const { id: questId, xp: xpGain, title } = quest;
    const prevLevelName = level?.name || "Shellborn";

    try {
      const res = await axios.post(
        `${API}/complete`,
        { wallet, questId, title, xp: xpGain },
        { withCredentials: true }
      );

      if (res?.data?.success === false) {
        alert(res?.data?.message || "Could not complete this quest yet.");
        return;
      }

      // Refresh profile and get the newly computed level
      const newProfile = await loadProfile(wallet);

      // Show XP toast (centered) + sound
      setRecentXP(xpGain);
      setXPModalOpen(true);
      playXP();

      // Detect level up (optional UI modal — left in place)
      const newLevelName = newProfile?.levelName || level.name;
      const newLevelSymbol = newProfile?.levelSymbol || level.symbol;

      if (newLevelName && newLevelName !== prevLevelName) {
        setUnlocked({ name: newLevelName, symbol: newLevelSymbol || "🐚" });
        setShowLevelModal(true);
      }

      // Mark in local completed list
      setCompleted((prev) => (prev.includes(questId) ? prev : [...prev, questId]));

      // Confetti 🎉
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

      // 🔔 Tell other pages (Profile) to reload
      window.dispatchEvent(new Event("quests:updated"));
    } catch (err) {
      console.error("Quest complete error", err);
      alert("Could not complete this quest. Please try again.");
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
            filterQuests(activeTab).map((q) => (
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
                    className={`btn ${completed.includes(q.id) ? "success" : "ghost"}`}
                    onClick={() => handleCompleteClick(q)}
                    disabled={completed.includes(q.id)}
                    title={!wallet ? "Connect a wallet to complete quests" : ""}
                  >
                    {completed.includes(q.id) ? "Completed" : "Complete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Level-up modal (optional) */}
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

        {/* XP modal (centered) */}
        {xpModalOpen && (
          <XPModal xpGained={recentXP} onClose={() => setXPModalOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default Quests;
