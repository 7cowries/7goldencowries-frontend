import React from "react";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";

export default function Home() {
  return (
    <>
      <Section>
        <div className="hero">
          <div className="title">Sail the Seven Isles</div>
          <p className="subtitle">Complete quests. Earn XP. Climb tiers. Unlock partner perks.</p>
          <div className="cta-row" style={{ marginTop: 16 }}>
            <a href="/quests" className="btn primary glow">Start Quests</a>
            <a href="/leaderboard" className="btn ghost">View Leaderboard</a>
          </div>
        </div>
      </Section>

      <Section title="What is 7 Golden Cowries?">
        <p>A web3 quest world where every action moves you forward across the Isles.</p>
      </Section>

      <Section title="Coming Innovations">
        <div className="grid-3">
          <Card>
            <h3>GigiP2Bot</h3>
            <p className="muted">Chat based trading across chains.</p>
          </Card>
          <Card>
            <h3>MaxEng</h3>
            <p className="muted">Telegram companion for memberships and authentic growth.</p>
          </Card>
          <Card>
            <h3>More soon</h3>
            <p className="muted">Stay tuned for new quests and partners.</p>
          </Card>
        </div>
      </Section>
    </>
  );
}
