import { Link, NavLink, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import useAccess from "../../hooks/useAccess";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "◈" },
  { to: "/quests", label: "Quests", icon: "✦" },
  { to: "/isles", label: "Isles", icon: "◌" },
  { to: "/leaderboard", label: "Leaderboard", icon: "♛" },
  { to: "/arena", label: "Arena", icon: "⚔" },
  { to: "/profile", label: "Profile", icon: "◉" },
  { to: "/subscription", label: "Subscription", icon: "✧" },
  { to: "/referral", label: "Referrals", icon: "⟡" },
  { to: "/token-sale", label: "Token Sale", icon: "◍" },
  { to: "/partners", label: "Partners", icon: "⎔" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAccess();

  const adminItems = useMemo(
    () => (isAdmin ? [{ to: "/admin/arena-console", label: "Admin Console", icon: "⛨" }] : []),
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
        onClick={() => setOpen((v) => !v)}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>
      {open ? <div className="leftnav-overlay" onClick={() => setOpen(false)} /> : null}

      <aside className={`leftnav ${open ? "open" : "closed"}`} role="navigation">
        <Link to="/" className="brand" aria-label="7GoldenCowries Home">
          <img src="/logo.svg" alt="7GoldenCowries logo" className="brand-logo" />
          <div>
            <strong className="brand-text">7GoldenCowries</strong>
            <p className="brand-sub">Ocean Dominion</p>
          </div>
        </Link>

        <nav className="nav">
          {NAV_ITEMS.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <span className="emoji">{it.icon}</span>
              <span>{it.label}</span>
            </NavLink>
          ))}

          {adminItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) => `nav-item nav-item-admin${isActive ? " active" : ""}`}
            >
              <span className="emoji">{it.icon}</span>
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="avatar-bubble">7G</div>
          <div>
            <p className="sidebar-profile-title">Tide Explorer</p>
            <p className="sidebar-profile-sub">Status: Active Voyage</p>
          </div>
        </div>
      </aside>
    </>
  );
}
