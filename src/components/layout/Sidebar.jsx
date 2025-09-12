import React from "react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/", label: "7GoldenCowries", emoji: "📍" },
  { to: "/quests", label: "Quests", emoji: "⚡" },
  { to: "/leaderboard", label: "Leaderboard", emoji: "📚" },
  { to: "/referral", label: "Referral", emoji: "👑" },
  { to: "/subscription", label: "Subscription", emoji: "💎" },
  { to: "/token-sale", label: "Token Sale", emoji: "🪙" },
  { to: "/profile", label: "Profile", emoji: "🔗" },
  { to: "/isles", label: "Isles", emoji: "🌱" },
];

export default function Sidebar({ open = false }) {
  const { pathname } = useLocation();
  return (
    <aside className={`sidebar ${open ? "open" : ""}`} role="navigation" aria-label="Main">
      <nav className="nav-list">
        {items.map((it) => {
          const active = pathname === it.to;
          return (
            <Link key={it.to} to={it.to} className={`nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
              <span className="nav-emoji">{it.emoji}</span>
              <span className="nav-label">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
