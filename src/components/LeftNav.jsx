import WalletConnect from "../components/WalletConnect";
import React, { useEffect, useState } from "react";
import { getEffectsOff, setEffectsOff } from "../store/effects";
import { Link, NavLink } from "react-router-dom";
// using /logo.svg from public
import WalletConnect from "./WalletConnect";

export default function LeftNav() {
  const [effectsOff, setOff] = useState(getEffectsOff());
  useEffect(() => {
    const on = () => setOff(getEffectsOff());
    window.addEventListener("effects:toggled", on);
    return () => window.removeEventListener("effects:toggled", on);
  }, []);
  return (
    <aside className="leftnav" aria-label="Primary">
      <Link to="/" className="brand" aria-label="7GoldenCowries — Home">
        <img src="/logo.svg" alt="7GoldenCowries logo (golden cowrie)" className="brand-logo" />
        <span className="brand-text">7GoldenCowries</span>
      </Link>

      <nav className="nav" aria-label="Main">
        <NavLink to="/quests" className="nav-item"><span>⚡</span><span>Quests</span></NavLink>
        <NavLink to="/leaderboard" className="nav-item"><span>📚</span><span>Leaderboard</span></NavLink>
        <NavLink to="/referral" className="nav-item"><span>👑</span><span>Referral</span></NavLink>
        <NavLink to="/subscription" className="nav-item"><span>💎</span><span>Subscription</span></NavLink>
        <NavLink to="/token-sale" className="nav-item"><span>🪙</span><span>Token Sale</span></NavLink>
        <NavLink to="/profile" className="nav-item"><span>🔗</span><span>Profile</span></NavLink>
        <NavLink to="/isles" className="nav-item"><span>🌱</span><span>Isles</span></NavLink>
      </nav>

      <div className="nav-wallet">
        <WalletConnect />
        <button
          className="chip"
          onClick={() => {
            setOff(!effectsOff);
            setEffectsOff(!effectsOff);
          }}
          title={effectsOff ? "Enable FX" : "Disable FX"}
        >
          {effectsOff ? "✨ Enable FX" : "🪄 Reduce FX"}
        </button>
      </div>
    </aside>
  );
}

/* Wallet footer */
/* render somewhere in your nav container: <WalletConnect compact /> */
