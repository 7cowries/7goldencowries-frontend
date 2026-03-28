import WalletConnect from "../../components/WalletConnect";
import { Link, NavLink, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import useAccess from "../../hooks/useAccess";

const PRIMARY_ITEMS = [
  { to: "/", label: "Home", emoji: "🏠" },
  { to: "/quests", label: "Quests", emoji: "⚡" },
  { to: "/profile", label: "Profile", emoji: "🧾" },
  { to: "/isles", label: "Seven Isles", emoji: "🌊" },
  { to: "/leaderboard", label: "Leaderboard", emoji: "🏆" },
 codex/restore-product-architecture-and-design
  { to: "/arenas", label: "Crowns Arena", emoji: "👑" },
];

const GROWTH_ITEMS = [
  { to: "/subscription", label: "Subscription", emoji: "💎" },
  { to: "/referral", label: "Referrals", emoji: "🧬" },
  { to: "/token-sale", label: "Token Sale", emoji: "🪙" },
];

const ECOSYSTEM_ITEMS = [
  { to: "/partners", label: "Partners", emoji: "🤝" },
  { to: "/staking", label: "Staking", emoji: "⚓" },
  { to: "/theme", label: "Display", emoji: "🎨" },

  { to: "/arena", label: "Arena", emoji: "👑" },
  { to: "/profile", label: "Profile", emoji: "🧾" },
  { to: "/subscription", label: "Subscription", emoji: "💎" },
  { to: "/referral", label: "Referrals", emoji: "🧬" },
  { to: "/token-sale", label: "Token Sale", emoji: "🪙" },
  { to: "/partners", label: "Partners", emoji: "🤝" },
];

const SECONDARY_ITEMS = [
  { to: "/isles", label: "Isles", emoji: "🌊" },
  { to: "/theme", label: "Theme Settings", emoji: "🎨" },
 main
];

function NavSection({ title, items }) {
  return (
    <div className="nav-group">
      <p className="nav-group-title">{title}</p>
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
    </div>
  );
}

export default function Sidebar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAccess();

  const adminItems = useMemo(
    () =>
      isAdmin
        ? [{ to: "/admin/arena-console", label: "Admin Console", emoji: "🛡️" }]
        : [],
    [isAdmin]
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
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

      {open && <div className="leftnav-overlay" onClick={() => setOpen(false)} />}

      <aside className={`leftnav ${open ? "open" : "closed"}`} role="navigation">
        <Link to="/" className="brand" aria-label="7GoldenCowries Home">
          <img src="/logo.svg" alt="7GoldenCowries logo" className="brand-logo" />
          <span className="brand-text">7GoldenCowries</span>
        </Link>

        <nav className="nav">
 codex/restore-product-architecture-and-design
          <NavSection title="Journey" items={PRIMARY_ITEMS} />
          <NavSection title="Boosts & Growth" items={GROWTH_ITEMS} />
          <NavSection title="Ecosystem" items={ECOSYSTEM_ITEMS} />

          <NavSection title="Core" items={PRIMARY_ITEMS} />
          <NavSection title="Secondary" items={SECONDARY_ITEMS} />
 main
          {adminItems.length > 0 && <NavSection title="Operator" items={adminItems} />}

          <div className="nav-wallet">
            <WalletConnect compact />
          </div>
        </nav>
      </aside>
    </>
  );
}
