import React from "react";
import { Link } from "react-router-dom";
import Page from "../components/Page";

const QUICK_START = [
  {
    title: "Complete quests",
    copy: "Earn XP through social, partner, and onchain missions.",
    cta: "Open Quests",
    to: "/quests",
  },
  {
    title: "Climb rankings",
    copy: "See how you compare with other explorers in real-time.",
    cta: "View Leaderboard",
    to: "/leaderboard",
  },
  {
    title: "Grow rewards",
    copy: "Use referral, subscription, and token utilities to compound progress.",
    cta: "Open Profile",
    to: "/profile",
  },
];

const CORE_ROUTES = [
  ["Crowns Arena", "Compete in time-bound competitive events.", "/arenas"],
  ["Referral", "Share your code and unlock referral XP bonuses.", "/referral"],
  ["Subscription", "Access premium tiers and recurring membership benefits.", "/subscription"],
  ["Token Sale", "Review sale status, eligibility, and payment entry.", "/token-sale"],
  ["Isles", "Track progression milestones across the seven Isles.", "/isles"],
  ["Partners", "Apply for sponsor placements and campaign slots.", "/partners"],
];

export default function Home() {
  return (
    <Page>
      <section className="section hero">
        <h1>7GoldenCowries</h1>
        <p className="subtitle" style={{ maxWidth: 860 }}>
          A structured quest ecosystem for users, partners, and operators. Connect your wallet once,
          complete guided actions, and progress through a transparent XP system.
        </p>
        <div className="cta-row" style={{ marginTop: 14 }}>
          <Link to="/quests" className="btn">Start Quests</Link>
          <Link to="/profile" className="btn ghost">Review Profile</Link>
        </div>
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
        <p className="muted">Every route has a single purpose: play, earn, track, or manage.</p>
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
