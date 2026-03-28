import React from "react";
import { Link } from "react-router-dom";
import Page from "../components/Page";

const JOURNEY = [
  "Land on Home and understand the ecosystem",
  "Connect wallet identity once from the sidebar",
  "Complete quests and collect XP",
  "Advance across the Seven Isles of Tides",
  "Track rank in Leaderboard and Crowns Arena",
  "Compound progression with Subscription and Referrals",
];

const QUICK_START = [
  {
    title: "Quest for XP",
    copy: "Social, partner, and onchain quests feed one shared XP engine.",
    cta: "Open Quests",
    to: "/quests",
  },
  {
    title: "Track progression",
    copy: "Profile and Isles show your current level, next unlock, and lore path.",
    cta: "View Isles",
    to: "/isles",
  },
  {
    title: "Compete and grow",
    copy: "Leaderboard, Arena, referrals, and subscriptions stack your long-term edge.",
    cta: "Open Leaderboard",
    to: "/leaderboard",
  },
];

const CORE_ROUTES = [
  ["Profile", "Progression command center for wallet, XP, level, Isles, socials, and referrals.", "/profile"],
  ["Crowns Arena", "Compete in time-bound events with arena-specific standings.", "/arenas"],
  ["Subscription", "Premium tiers with explicit XP multipliers and perks.", "/subscription"],
  ["Referrals", "Invite loop that contributes to progression rewards.", "/referral"],
  ["Token Sale", "Token participation details and status.", "/token-sale"],
  ["Partners", "Sponsor onboarding and campaign lane.", "/partners"],
];

export default function Home() {
  return (
    <Page>
      <section className="section hero">
        <h1>7GoldenCowries</h1>
        <p className="subtitle" style={{ maxWidth: 860 }}>
          A premium oceanic progression platform where quests convert to XP, XP advances levels,
          levels unlock Isles, and Isles unlock status, perks, and competition tiers.
        </p>
        <div className="cta-row" style={{ marginTop: 14 }}>
          <Link to="/quests" className="btn">Start Quests</Link>
          <Link to="/profile" className="btn ghost">Open Progression Profile</Link>
        </div>
      </section>

      <section className="section">
        <h2>Core journey</h2>
        <ol style={{ margin: "10px 0 0", paddingLeft: 22 }}>
          {JOURNEY.map((step) => (
            <li key={step} className="muted" style={{ marginBottom: 8 }}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2>Quick start</h2>
        <div className="grid-3" style={{ marginTop: 12 }}>
          {QUICK_START.map((item) => (
            <article key={item.title} className="card glass">
              <h3>{item.title}</h3>
              <p className="muted">{item.copy}</p>
              <Link className="link-underline" to={item.to}>{item.cta}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Product map</h2>
        <p className="muted">Every route supports progression, rewards, or ecosystem operations.</p>
        <div className="grid-2" style={{ marginTop: 10 }}>
          {CORE_ROUTES.map(([title, copy, to]) => (
            <article key={title} className="card glass">
              <h3>{title}</h3>
              <p className="muted">{copy}</p>
              <Link to={to} className="link-underline">Go to {title}</Link>
            </article>
          ))}
        </div>
      </section>
    </Page>
  );
}
