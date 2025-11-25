import React from "react";
import { Link } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import XPBarAnimated from "../components/ui/XPBarAnimated";
import CowryBadge from "../components/ui/CowryBadge";

const heroStats = [
  { label: "Adventurers", value: "12,480" },
  { label: "Total XP", value: "8.4M" },
  { label: "Quests Live", value: "72" },
];

const tokenHighlights = [
  { title: "Supply", value: "21,000,000 GCT" },
  { title: "Chain", value: "TON" },
  { title: "Rewards", value: "XP + Boosts" },
];

export default function Home() {
  return (
    <PageContainer>
      <div className="hero-shell card">
        <div>
          <p className="label">Oceanic Frontier</p>
          <h1>7 Golden Cowries</h1>
          <p className="muted">Sail the Seven Isles, earn XP, and unlock shimmering perks across quests, staking, and referrals.</p>
          <div className="hero-actions">
            <Link className="btn" to="/quests">Start Quests</Link>
            <Link className="btn ghost" to="/token-sale">Token Sale</Link>
          </div>
          <div className="hero-stats-row">
            {heroStats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <div className="stat-value">{stat.value}</div>
                <div className="label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-badge">
          <CowryBadge level={7} size="lg" />
          <XPBarAnimated label="Season Progress" current={6800} total={10000} />
        </div>
      </div>

      <SectionHeader title="GCT Overview" subtitle="Live token highlights" />
      <div className="grid three">
        {tokenHighlights.map((item) => (
          <div className="card" key={item.title}>
            <div className="label">{item.title}</div>
            <h3>{item.value}</h3>
          </div>
        ))}
      </div>

      <SectionHeader title="Call to Action" subtitle="Jump into the key flows" />
      <div className="grid two">
        <div className="cta-card card">
          <h3>Earn daily XP</h3>
          <p className="muted">Complete daily, social, and partner quests to charge your level.</p>
          <Link to="/quests" className="btn">Open Quests</Link>
        </div>
        <div className="cta-card card">
          <h3>Stake for boosts</h3>
          <p className="muted">Stake GCT to increase your XP multiplier and climb the Isles.</p>
          <Link to="/staking" className="btn ghost">Stake GCT</Link>
        </div>
      </div>
    </PageContainer>
  );
}
