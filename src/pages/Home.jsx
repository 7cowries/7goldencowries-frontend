import React from "react";
import { Link } from "react-router-dom";
import Page from "../components/Page";

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
  "Compete in leaderboard and Crowns Arena seasons.",
];

export default function Home() {
  return (
    <Page>
      <section className="section hero architecture-hero">
        <p className="pill" style={{ display: "inline-flex", marginBottom: 10 }}>
          Web3 quests • progression • competition
        </p>
        <h1>7GoldenCowries</h1>
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
