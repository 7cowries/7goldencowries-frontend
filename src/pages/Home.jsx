import React from "react";
import { Link } from "react-router-dom";
import Page from "../components/Page";

const FEATURED = [
  { title: "Tusk of the Forgotten", xp: "+180 XP", desc: "Track the starlit relay and decode the Cowrie signal." },
  { title: "Bind the Tide Wallet", xp: "+120 XP", desc: "Link your treasury sigil to unlock claim routes." },
  { title: "Join the Pearl Chorus", xp: "+220 XP", desc: "Enter the channel of Isles to reveal co-op quests." },
];

export default function Home() {
  return (
    <Page>
      <section className="hero-panel glass-panel nebula-panel">
        <div className="hero-copy">
          <p className="section-eyebrow">Ascension Season • Seven Golden Cowries</p>
          <h1>
            Embark on <span>Epic Quests</span>, Earn Rewards, and Rise to the Top.
          </h1>
          <p>
            Web3 adventurers cross glowing waters, complete live missions, and forge prestige in a single command deck.
          </p>
          <div className="hero-cta-row">
            <Link to="/quests" className="btn-primary-quest">Start Your Adventure</Link>
            <Link to="/isles" className="card-cta">Explore Isles</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="island-core" />
          <div className="mist-ring" />
        </div>
      </section>

      <section className="glass-panel section-panel">
        <div className="section-head-row">
          <h3>Featured Quests</h3>
          <Link to="/quests" className="text-link">Open full mission board</Link>
        </div>
        <div className="featured-grid">
          {FEATURED.map((quest) => (
            <article key={quest.title} className="ocean-card quest-mini-card">
              <p className="card-xp">{quest.xp}</p>
              <h4>{quest.title}</h4>
              <p>{quest.desc}</p>
              <div className="mini-card-footer">
                <span className="pill-lite">Epic</span>
                <Link to="/quests" className="card-cta">Enter Quest</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Page>
  );
}
