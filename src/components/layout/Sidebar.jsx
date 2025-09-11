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

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside style={{
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      width: "var(--sidebar-w)",
      padding: "16px",
      backdropFilter: "blur(16px) saturate(140%)",
      WebkitBackdropFilter: "blur(16px) saturate(140%)",
      background: "linear-gradient(180deg, rgba(6,19,37,.75), rgba(6,19,37,.55))",
      borderRight: "1px solid rgba(255,255,255,.15)",
      zIndex: 5,
      overflowY: "auto"
    }}>
      <nav style={{ display: "grid", gap: 12 }}>
        {items.map(it => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px",
                borderRadius: 14,
                textDecoration: "none",
                color: "var(--ink-0)",
                border: "1px solid rgba(255,255,255,.18)",
                background: active
                  ? "linear-gradient(135deg, rgba(0,240,255,.25), rgba(255,224,102,.25))"
                  : "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.06))",
                boxShadow: active ? "0 12px 28px rgba(0,224,255,.25)" : "none"
              }}
            >
              <span style={{ fontSize: 18 }}>{it.emoji}</span>
              <span style={{ fontWeight: 700 }}>{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
