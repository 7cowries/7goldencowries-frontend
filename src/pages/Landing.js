// src/pages/Landing.js
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { playClick, playXP } from "../utils/sounds";
import { SALE_START_ISO, useCountdown, openCalendarReminder, inviteFriend } from "../utils/launch";
import "./Landing.css";
import "../App.css";

export default function Landing() {
  // Unified countdown (same as token-sale page)
  const { days: d, hours: h, minutes: m, seconds: s } = useCountdown(SALE_START_ISO);
  const particles = useMemo(() => Array.from({ length: 36 }), []);

  return (
    <div className="landing page" aria-label="7 Golden Cowries landing">
      {/* Immersive background layers */}
      <div className="bg-waves" />
      <div className="aurora" aria-hidden="true" />
      <div className="bg-particles" aria-hidden="true">
        {particles.map((_, i) => (
          <span key={i} style={{ ["--i"]: i }} />
        ))}
      </div>

      {/* HERO */}
      <section className="section hero gradient-border">
        <h1 className="title">7 Golden Cowries</h1>
        <p className="hero-subtitle">
          A web3 quest world across the Seven Isles. Complete quests, earn XP, climb
          tiers, and unlock partner perks. Sail with the tide and grow your legend.
        </p>

        <div className="cta-row">
          <Link
            to="/quests"
            className="btn cta-pulse"
            onClick={playClick}
            aria-label="Start quests"
          >
            Start Quests
          </Link>
          <Link
            to="/leaderboard"
            className="btn ghost"
            onClick={playClick}
            aria-label="View leaderboard"
          >
            View Leaderboard
          </Link>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num">7</div>
            <div className="stat-label">Isles</div>
          </div>
          <div className="stat">
            <div className="stat-num">∞</div>
            <div className="stat-label">XP to Earn</div>
          </div>
          <div className="stat">
            <div className="stat-num">Now</div>
            <div className="stat-label">Your Tide</div>
          </div>
        </div>
      </section>

      {/* TOKEN SALE BANNER (synced, with working buttons) */}
      <section className="landing-block">
        <div className="token-sale-banner">
          <div className="tsb-left">
            <span className="tsb-emoji">⚱️</span>
            <strong>Token Sale</strong> begins <strong>October 4</strong>
          </div>

          <div className="countdown" role="timer" aria-live="polite">
            <span className="countdown-label">Countdown</span>
            <div className="countdown-digits">
              <span>{d}d</span>
              <small>:</small>
              <span>{h}h</span>
              <small>:</small>
              <span>{m}m</span>
              <small>:</small>
              <span>{s}s</span>
            </div>
          </div>

          <div className="tsb-actions">
            <button
              className="btn ripple"
              onClick={() => {
                playClick();
                openCalendarReminder({ startIso: SALE_START_ISO });
              }}
            >
              Set Reminder
            </button>
            <Link to="/token-sale" className="btn ghost ripple" onClick={playClick}>
              Learn More
            </Link>
            <button
              className="btn ghost ripple"
              onClick={() => {
                playClick();
                inviteFriend({});
              }}
            >
              Invite
            </button>
          </div>
        </div>
      </section>

      {/* WHAT IS */}
      <section className="landing-block">
        <h2>What is 7 Golden Cowries?</h2>
        <p className="muted">
          This is a playful, on chain universe where every action moves you forward.
          From simple daily quests to partner integrations, you level up, collect
          badges, and unlock shimmering perks as your journey unfolds across the Isles.
        </p>
      </section>

      {/* COMING INNOVATIONS */}
      <section className="landing-block coming">
        <h2>Coming Innovations</h2>
        <div className="features-grid">
          <div className="feature-card hover">
            <div className="coming-header">
              <span className="soon-badge">Coming Soon</span>
            </div>
            <div className="feature-emoji">🤖</div>
            <h3>GigiP2Bot</h3>
            <p className="muted">
              A Telegram bot that feels human. Buy or sell with a sentence, connect
              your TON, EVM, or Solana wallet, and move value in moments. Simple chat,
              real settlement, no manuals.
            </p>
            <ul className="muted">
              <li>Smart best rate routing</li>
              <li>TON, EVM, Solana wallet linking</li>
              <li>Natural language trades</li>
            </ul>
            <button className="btn" onClick={playClick}>Get Notified</button>
          </div>

          <div className="feature-card hover">
            <div className="coming-header">
              <span className="soon-badge">Coming Soon</span>
            </div>
            <div className="feature-emoji">🚀</div>
            <h3>MaxEng</h3>
            <p className="muted">
              A Telegram companion for memberships and authentic growth on X. Verify
              real engagement, manage paid communities, and run campaigns with proof
              of action.
            </p>
            <ul className="muted">
              <li>Verified tasks for X</li>
              <li>Subscriptions and access</li>
              <li>Creator campaigns with on chain proof</li>
            </ul>
            <button className="btn" onClick={playClick}>Get Notified</button>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="landing-block">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card hover">
            <div className="feature-emoji">📝</div>
            <h3>Quests that Matter</h3>
            <p className="muted">
              Curated tasks across socials and on chain actions. Clear rewards, zero fluff.
            </p>
          </div>

          <div className="feature-card hover">
            <div className="feature-emoji">🏝️</div>
            <h3>Progression and Isles</h3>
            <p className="muted">
              Earn XP and level up through virtues. Your journey, visualized.
            </p>
          </div>

          <div className="feature-card hover">
            <div className="feature-emoji">🤝</div>
            <h3>Partner Perks</h3>
            <p className="muted">
              Unlock benefits, allowlists, and more from partner dApps.
            </p>
          </div>

          <div className="feature-card hover">
            <div className="feature-emoji">🎁</div>
            <h3>Referral Rewards</h3>
            <p className="muted">Invite friends and earn XP together.</p>
          </div>

          <div className="feature-card hover">
            <div className="feature-emoji">🏆</div>
            <h3>Fair Leaderboard</h3>
            <p className="muted">
              Transparent rankings. No pay to win. XP reflects verified action.
            </p>
          </div>

          <div className="feature-card hover">
            <div className="feature-emoji">⚡</div>
            <h3>Built for Speed</h3>
            <p className="muted">
              Optimized backend and CDN. Smooth across desktop and mobile.
            </p>
          </div>
        </div>
      </section>

      {/* LORE TIMELINE */}
      <section className="landing-block lore-block">
        <h2>The Lore of the Seven Isles</h2>
        <p className="muted">
          Before charts and chains, the sea kept score with shells. Each cowrie was a promise:
          prove your path, and the tides will answer.
        </p>

        <ol className="lore-timeline">
          {[
            {
              emoji: "🐚",
              title: "Shellborn Shores",
              text: "Where every journey begins. Cowries wash ashore as gifts of chance and courage.",
            },
            {
              emoji: "🌊",
              title: "Whispering Waves",
              text: "The sea speaks in currents. Those who listen learn how tides carry secrets and XP.",
            },
            {
              emoji: "🔥",
              title: "Tidewatch Reef",
              text: "Guides of coral and light mark the paths of explorers who dare to swim deeper.",
            },
            {
              emoji: "✨",
              title: "Pearlspire",
              text: "Halls of memory shimmer with earned badges. Pearls hold the stories you claimed.",
            },
            {
              emoji: "🌙",
              title: "Moonlit Atoll",
              text: "Waves turn to silk under Naias glow. Here, quests bend with timing and tide.",
            },
            {
              emoji: "🏆",
              title: "Isle of Champions",
              text: "Honor held in open water. Deeds ring clear across the horizon.",
            },
            {
              emoji: "🌟",
              title: "Ascendant Isle",
              text: "Beyond maps lies a horizon that answers to your name alone.",
            },
          ].map((n, i) => (
            <li key={i} className="lore-node fade-in">
              <div className="lore-pin">
                <img
                  className="cowrie-sparkle"
                  src="/images/cowrie-sparkle.svg"
                  alt=""
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <span className="pin-orb" />
                <span className="pin-glow" />
              </div>
              <div className="lore-card">
                <div className="lore-head">
                  <span className="lore-emoji">{n.emoji}</span>
                  <h3 className="lore-title">{n.title}</h3>
                </div>
                <p className="lore-text">{n.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <LoreEpilogue />
        {/* progress line visual */}
        <span className="lore-progress" />
      </section>

      {/* ROADMAP */}
      <section className="landing-block roadmap">
        <h2>Roadmap</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="chip">Now</div>
            <h3>Core Quests and Badges</h3>
            <p className="muted">The Isles are open. Complete quests, climb tiers, earn your place on the board.</p>
          </div>
          <div className="feature-card">
            <div className="chip">Next</div>
            <h3>Partner Expansions</h3>
            <p className="muted">Deeper integrations with Telegram, TON, and EVM dApps. More rewards, more fun.</p>
          </div>
          <div className="feature-card">
            <div className="chip">Soon</div>
            <h3>Seasonal Events</h3>
            <p className="muted">Limited time Isles with themed challenges, cosmetics, and collectible drops.</p>
          </div>
          <div className="feature-card">
            <div className="chip">Sale</div>
            <h3>Token Sale</h3>
            <p className="muted">Branding, questing, and partner campaigns launch around the sale window.</p>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="landing-block partners">
        <h2>Partners</h2>
        <div className="features-grid">
          <div className="partner-slot">GIGILABS</div>
          <div className="partner-slot">TON</div>
          <div className="partner-slot">EVM</div>
          <div className="partner-slot">Solana</div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bottom-callout">
        <div className="callout-inner">
          <div>
            <h2>Answer the Tide</h2>
            <p className="muted">
              Your story begins now. Pick a quest and let the Isles remember your name.
            </p>
          </div>
          <div className="cta-row">
            <Link to="/quests" className="btn cta-pulse" onClick={playClick}>
              Start Quests
            </Link>
            <Link to="/leaderboard" className="btn ghost" onClick={playClick}>
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoreEpilogue() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lore-epilogue">
      {!open ? (
        <button
          className="btn ghost"
          onClick={() => {
            setOpen(true);
            playXP();
          }}
        >
          Read Epilogue
        </button>
      ) : (
        <div className="epilogue section">
          <p className="muted">
            The Isles were never meant to be conquered. They rise and fall with our choices.
            Collecting cowries is not about counting — it is about remembering. Every quest
            you complete is a story the sea agrees to keep. When your tide is strong, the
            water makes way. And when you reach the Ascendant Isle, you realize it was never
            a place. It was your name, spoken clearly, over open water.
          </p>
          <button
            className="btn"
            onClick={() => {
              setOpen(false);
              playClick();
            }}
          >
            Hide Epilogue
          </button>
        </div>
      )}
    </div>
  );
}
