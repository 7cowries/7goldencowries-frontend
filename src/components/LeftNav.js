import React, { useEffect, useState } from "react";
import "./LeftNav.css";
import logo from "../assets/logo.svg";
import { toggleTheme } from "../utils/theme";

export default function LeftNav() {
  const pathname = (typeof window !== 'undefined' ? window.location.pathname : '/');
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile toggle (hamburger) */}
      <button
        className="nav-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* Backdrop for mobile drawer */}
      {open && <div className="leftnav-overlay" onClick={() => setOpen(false)} />}

      <aside className={`leftnav ${open ? "open" : "closed"}`} role="navigation">
        {/* Brand (clickable to landing) */}
        <Link to="/" className="brand" aria-label="7GoldenCowries Home">
          <img src={logo} alt="7GoldenCowries logo" className="brand-logo" />
          <span className="brand-text">7GoldenCowries</span>
        </Link>

        <nav className="nav">
          <NavLink to="/quests" className="nav-item">
            <span className="emoji">⚡</span>
            <span>Quests</span>
          </NavLink>

          <NavLink to="/leaderboard" className="nav-item">
            <span className="emoji">📚</span>
            <span>Leaderboard</span>
          </NavLink>

          <NavLink to="/referral" className="nav-item">
            <span className="emoji">👑</span>
            <span>Referral</span>
          </NavLink>

          <NavLink to="/subscription" className="nav-item">
            <span className="emoji">💎</span>
            <span>Subscription</span>
          </NavLink>

          <NavLink to="/token-sale" className="nav-item">
            <span className="emoji">🪙</span>
            <span>Token Sale</span>
          </NavLink>

          <NavLink to="/profile" className="nav-item">
            <span className="emoji">🔗</span>
            <span>Profile</span>
          </NavLink>

          <NavLink to="/isles" className="nav-item">
            <span className="emoji">🌱</span>
            <span>Isles</span>
          </NavLink>
          <button type="button" className="nav-item" onClick={toggleTheme}>
            <span className="emoji">🌈</span>
            <span>Theme</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
