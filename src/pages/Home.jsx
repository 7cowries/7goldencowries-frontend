import React from "react";
import { Link } from "react-router-dom";
import Page from "../components/Page";

codex/restore-product-architecture-and-design
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

const OVERVIEW_CARDS = [
  {
    title: "Quest Engine",
    copy: "Discover social, partner, and onchain quests with transparent XP rewards.",
  },
  {
    title: "Progression Isles",
    copy: "Track your level path, unlock perks, and monitor what opens at each milestone.",
  },
  {
    title: "Crowns Arena",
    copy: "Join competitive rounds, climb rankings, and earn event-based outcomes.",
  },
  {
    title: "Reward Layer",
    copy: "Use subscriptions, referrals, and token-sale participation to amplify progression.",
  },
];

const FLOW_STEPS = [
  "Connect wallet once from the global navigation.",
  "Complete quests and claim XP with clear status tracking.",
  "Advance through levels and unlock Isles-based perks.",
  "Compete in leaderboard and Crowns Arena seasons."

];

export default function Home() {
  return (
    <Page>
      <section className="section hero architecture-hero">
        <p className="pill" style={{ display: "inline-flex", marginBottom: 10 }}>
          Web3 quests • progression • competition
        </p>
        <h1>7GoldenCowries</h1>
 codex/restore-product-architecture-and-design
        <p className="subtitle" style={{ maxWidth: 860 }}>
          A premium oceanic progression platform where quests convert to XP, XP advances levels,
          levels unlock Isles, and Isles unlock status, perks, and competition tiers.
        </p>
        <div className="cta-row" style={{ marginTop: 14 }}>
          <Link to="/quests" className="btn">Start Quests</Link>
          <Link to="/profile" className="btn ghost">Open Progression Profile</Link>

        <p className="subtitle architecture-subtitle">
          A premium progression platform where wallet identity, quests, XP, Isles, rewards, and
          competitive play are all connected in one clean flow.
        </p>

        <div className="cta-row" style={{ marginTop: 18 }}>
          <Link to="/quests" className="btn">
            Start Quests
          </Link>
          <Link to="/arena" className="btn ghost">
            Enter Arena
          </Link>
          <Link to="/token-sale" className="btn ghost">
            View Token Sale
          </Link>
        </div>

        <div className="hero-stats architecture-stats">
          <article className="stat">
            <div className="stat-num">XP</div>
            <div className="stat-label">Progression-first reward model</div>
          </article>
          <article className="stat">
            <div className="stat-num">Isles</div>
            <div className="stat-label">Level map and unlock guidance</div>
          </article>
          <article className="stat">
            <div className="stat-num">Arena</div>
            <div className="stat-label">Competitive layer with rankings</div>
          </article>
 
        </div>
      </section>

      <section className="section">
 codex/restore-product-architecture-and-design
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

        <h2>How the platform works</h2>
        <p className="muted">Each surface has a clear purpose so users always know what to do next.</p>
        <div className="grid-2" style={{ marginTop: 12 }}>
          {OVERVIEW_CARDS.map((item) => (

            <article key={item.title} className="card glass">
              <h3>{item.title}</h3>
              <p className="muted">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
codex/restore-product-architecture-and-design
        <h2>Product map</h2>
        <p className="muted">Every route supports progression, rewards, or ecosystem operations.</p>
        <div className="grid-2" style={{ marginTop: 10 }}>
          {CORE_ROUTES.map(([title, copy, to]) => (
            <article key={title} className="card glass">
              <h3>{title}</h3>
              <p className="muted">{copy}</p>
              <Link to={to} className="link-underline">Go to {title}</Link>
            </article>

        <h2>Explorer journey</h2>
        <ol className="home-flow-list">
          {FLOW_STEPS.map((step) => (
            <li key={step}>{step}</li>

          ))}
        </ol>
        <div className="cta-row" style={{ marginTop: 16 }}>
          <Link to="/profile" className="link-underline">
            Open your Profile
          </Link>
          <Link to="/leaderboard" className="link-underline">
            Check Leaderboard
          </Link>
          <Link to="/subscription" className="link-underline">
            Compare Subscription Tiers
          </Link>
        </div>
      </section>
    </Page>
  );
}
