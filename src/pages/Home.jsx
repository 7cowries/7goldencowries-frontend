import React from "react";
import { Link } from "react-router-dom";
import Page from "../components/Page";

const FEATURED = [
  { title: "Signal the Fleet", xp: "+150 XP", desc: "Follow the command beacon and unlock social tides." },
  { title: "Bind the Vault", xp: "+200 XP", desc: "Secure wallet identity once and activate all rewards." },
  { title: "Summon the Circle", xp: "+220 XP", desc: "Join the guild channel to reveal partner missions." },
];

export default function Home() {
  return (
    <Page>
      <section className="hero-panel glass-panel">
        <div className="hero-copy">
          <p className="section-eyebrow">Season of Abyssal Crowns</p>
          <h1>
            Embark on <span>Epic Quests</span>, claim radiant rewards, and rise through the Seven Isles.
          </h1>
          <p>
            Forge your legend across ocean realms where every completed mission pushes your rank toward mythic status.
          </p>
          <Link to="/quests" className="btn-primary-quest">
            Start Your Adventure
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true" />
      </section>

      <section className="glass-panel section-panel">
        <div className="section-head-row">
          <h3>Featured Quests</h3>
          <Link to="/quests" className="text-link">View all missions</Link>
        </div>
        <div className="featured-grid">
          {FEATURED.map((quest) => (
            <article key={quest.title} className="ocean-card">
              <p className="card-xp">{quest.xp}</p>
              <h4>{quest.title}</h4>
              <p>{quest.desc}</p>
              <Link to="/quests" className="card-cta">Enter Quest</Link>
            </article>
          ))}
        </div>
      </section>
    </Page>
  );
}
