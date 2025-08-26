import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./LeftNav.css";
import logo from "../assets/logo.svg";

export default function LeftNav() {
  return (
    <aside className="leftnav" aria-label="Primary">
      <Link to="/" className="brand" aria-label="7GoldenCowries — Home">
        <img src={logo} alt="7GoldenCowries logo (golden cowrie)" className="brand-logo" />
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
    </aside>
  );
}
