import { Link, NavLink } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import logo from "../../assets/logo.svg";
import { toggleTheme } from "../../utils/theme";

const items = [
  { to: "/quests", label: "Quests", emoji: "⚡" },
  { to: "/leaderboard", label: "Leaderboard", emoji: "📚" },
  { to: "/referral", label: "Referral", emoji: "👑" },
  { to: "/subscription", label: "Subscription", emoji: "💎" },
  { to: "/token-sale", label: "Token Sale", emoji: "🪙" },
  { to: "/profile", label: "Profile", emoji: "🔗" },
  { to: "/isles", label: "Isles", emoji: "🌱" },
];

// Responsive sidebar with mobile drawer behaviour
export default function Sidebar() {
  const pathname = (typeof window !== 'undefined' ? window.location.pathname : '/');
  const [open, setOpen] = useState(false);

  // Close drawer on route change (ensures drawer hides after navigation on mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="nav-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* Scrim when drawer open */}
      {open && <div className="leftnav-overlay" onClick={() => setOpen(false)} />}

      <aside className={`leftnav ${open ? "open" : "closed"}`} role="navigation">
        {/* Brand link */}
        <Link to="/" className="brand" aria-label="7GoldenCowries Home">
          <img src={logo} alt="7GoldenCowries logo" className="brand-logo" />
          <span className="brand-text">7GoldenCowries</span>
        </Link>

        <nav className="nav">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="emoji">{it.emoji}</span>
              <span>{it.label}</span>
            </NavLink>
          ))}
          <button type="button" className="nav-item" onClick={toggleTheme}>
            <span className="emoji">🌈</span>
            <span>Theme</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
