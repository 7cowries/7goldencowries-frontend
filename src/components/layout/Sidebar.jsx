import WalletConnect from "../../components/WalletConnect";
import { Link, NavLink, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";

const items = [
  { to: "/", label: "Home", emoji: "🏠" },
  { to: "/quests", label: "Quests", emoji: "⚡" },
  { to: "/leaderboard", label: "Leaderboard", emoji: "📚" },
  { to: "/referral", label: "Referral", emoji: "👑" },
  { to: "/subscription", label: "Subscription", emoji: "💎" },
  { to: "/token-sale", label: "Token Sale", emoji: "🪙" },
  { to: "/profile", label: "Profile", emoji: "🔗" },
  { to: "/arenas", label: "Crowns Arena", emoji: "🏆" },
  { to: "/partners", label: "Partners", emoji: "🤝" },
  { to: "/admin/arena-console", label: "Admin Arena", emoji: "🛡️" },
  { to: "/isles", label: "Isles", emoji: "🌱" },
  { to: "/staking", label: "Staking", emoji: "⚓" },
  { to: "/theme", label: "Theme Settings", emoji: "🎨" },
];

// Responsive sidebar with mobile drawer behaviour
export default function Sidebar() {
  const { pathname } = useLocation();
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
          <img src="/logo.svg" alt="7GoldenCowries logo" className="brand-logo" />
          <span className="brand-text">7GoldenCowries</span>
        </Link>

        <nav className="nav">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <span className="emoji">{it.emoji}</span>
              <span>{it.label}</span>
            </NavLink>
          ))}
          <div style={{ margin: "12px 10px 12px" }}>
            <WalletConnect compact />
          </div>
        </nav>
      </aside>
    </>
  );
}
