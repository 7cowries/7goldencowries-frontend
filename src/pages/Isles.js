// src/pages/Isles.js
import React, { useEffect, useMemo, useState } from "react";
import "../App.css";
import "./Isles.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Which level unlocks which isle (index aligned with UI order)
const isleUnlocks = [
  "Shellborn",        // Isle 1
  "Wave Seeker",      // Isle 2
  "Tide Whisperer",   // Isle 3
  "Current Binder",   // Isle 4
  "Pearl Bearer",     // Isle 5
  "Isle Champion",    // Isle 6
  "Cowrie Ascendant", // Isle 7
];

const isles = [
  { name: "Shellborn Shores",    icon: "🐚" },
  { name: "Waverider Bay",       icon: "🌊" },
  { name: "Whispering Tides",    icon: "📣" },
  { name: "Binding Currents",    icon: "⚓" },
  { name: "Pearl Haven",         icon: "🪨" },
  { name: "Isle of Champions",   icon: "🏆" },
  { name: "Ascendant Cowrie",    icon: "👁️" },
];

export default function Isles() {
  // locate wallet like Profile does
  const address = useMemo(() => {
    const items = [
      localStorage.getItem("wallet"),
      localStorage.getItem("ton_wallet"),
      localStorage.getItem("walletAddress"),
    ].filter(Boolean);
    const chosen = items[0] || "";
    if (chosen) {
      localStorage.setItem("wallet", chosen);
      localStorage.setItem("ton_wallet", chosen);
      localStorage.setItem("walletAddress", chosen);
    }
    return chosen;
  }, []);

  const [levelName, setLevelName] = useState("Shellborn");

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/profile?wallet=${encodeURIComponent(address)}`, { credentials: "include" });
        const data = await res.json();
        const u = data?.profile || {};
        setLevelName(u.levelName || u.level || "Shellborn");
      } catch (e) {
        console.error("Isles profile fetch failed:", e);
      }
    })();
  }, [address]);

  // Determine unlocked isles
  const unlockedIndex = useMemo(() => {
    const idx = isleUnlocks.findIndex((lvl) => lvl === levelName);
    return idx >= 0 ? idx : 0;
  }, [levelName]);

  return (
    <div className="page">
      <div className="section">
        <h1 className="section-title">📖 The Seven Isles of Tides</h1>
        <p className="subtitle">
          Each isle represents a virtue earned through XP. Explore your path.
        </p>

        <div className="isles-grid">
          {isles.map((isle, i) => {
            const isUnlocked = i <= unlockedIndex;
            return (
              <div key={isle.name} className={`isle-card ${isUnlocked ? "unlocked" : "locked"}`}>
                <div className="isle-top">
                  <span className="muted mono">Isle {i + 1}</span>
                  {!isUnlocked && <span className="lock">🔒</span>}
                </div>
                <div className="isle-name">
                  <span className="emoji">{isle.icon}</span> {isle.name}
                </div>
                <p className="muted">
                  {isUnlocked ? "Unlocked" : "Level up to reveal this isle."}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
