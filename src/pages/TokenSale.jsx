// src/pages/TokenSale.js
import React, { useEffect, useState } from "react";
import "./TokenSale.css";
import Page from "../components/Page";
import { SALE_START_ISO, openCalendarReminder, inviteFriend } from "../utils/launch";

const TARGET = Date.UTC(2025, 9, 4, 0, 0, 0); // Oct 4, 2025 00:00:00 UTC

function getTimeLeft() {
  const now = Date.now();
  let diff = Math.max(0, Math.floor((TARGET - now) / 1000));
  const days = Math.floor(diff / 86400);
  diff -= days * 86400;
  const hours = Math.floor(diff / 3600);
  diff -= hours * 3600;
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  return { days, hours, mins, secs, finished: TARGET - now <= 0 };
}

export default function TokenSale() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, mins, secs, finished } = time;

  return (
    <Page>
      <div className="container">
        {/* HERO */}
        <section className="section ts-hero card gradient-border pad-24 fade-in">
          <div className="ts-hero-head">
            <h1 className="soft-title text-glow">$GCT — <span className="yolo-gradient">Golden Cowrie Token</span></h1>
            <div className="ts-badge">First Wave • Oct 4, 2025 (UTC)</div>
          </div>

          <p className="muted ts-hero-sub">
            Forged from the Seven Isles, <b>$GCT</b> powers quests, boosts XP, unlocks
            premium paths, and grants a voice in shaping new tides. No purchase here—just
            the story, the vision, and the countdown.
          </p>

          {/* COUNTDOWN */}
          <div className="ts-countdown">
            <div className="ts-countdown-title">
              {finished ? "🌊 The First Wave Has Begun" : "🌊 The Tide Approaches"}
            </div>
            {!finished ? (
              <div className="ts-countdown-grid">
                <div className="ts-time"><span>{String(days).padStart(2, '0')}</span><label>days</label></div>
                <div className="ts-time"><span>{String(hours).padStart(2, '0')}</span><label>hours</label></div>
                <div className="ts-time"><span>{String(mins).padStart(2, '0')}</span><label>mins</label></div>
                <div className="ts-time"><span>{String(secs).padStart(2, '0')}</span><label>secs</label></div>
              </div>
            ) : (
              <div className="ts-live-note">Follow updates in-app and socials—waves are moving.</div>
            )}
          </div>

          {/* CTA ROW (JS handlers so they always work) */}
          <div className="ts-cta">
            <button
              className="btn aqua ripple"
              onClick={() => openCalendarReminder({ startIso: SALE_START_ISO })}
            >
              Set Reminder
            </button>
            <button className="btn ghost ripple" onClick={() => inviteFriend({})}>
              Invite a Friend
            </button>
          </div>

          {/* Decorative waves */}
          <div className="ts-waves">
            <span className="wave w1" />
            <span className="wave w2" />
            <span className="wave w3" />
          </div>
        </section>

        {/* WHY / TOKENOMICS */}
        <section className="section grid ts-why">
          <div className="card gradient-border pad-24 hover">
            <h3 className="soft-title">Why $GCT?</h3>
            <ul className="ts-bullets">
              <li>⚡ <b>Quest Power:</b> Boost XP multipliers and unlock insider quests.</li>
              <li>👑 <b>Prestige:</b> Access premium tiers & exclusive Cowrie NFT badges.</li>
              <li>🌍 <b>Governance:</b> Vote on new quests, events, and Isles expansions.</li>
              <li>🎁 <b>Early Perks:</b> First-wave supporters receive XP blessings & cosmetics.</li>
            </ul>
          </div>
          <div className="card gradient-border pad-24 hover">
            <h3 className="soft-title">Tokenomics (Preview)</h3>
            <ul className="ts-bullets">
              <li>🌊 <b>Supply:</b> <i>To Be Announced</i> — whispered across the Seven Isles.</li>
              <li>🌀 <b>Launch:</b> First Wave opens <b>Oct 4, 2025 (UTC)</b>.</li>
              <li>⛓ <b>Chain:</b> TON — fast, low fees, mobile-native.</li>
              <li>💫 <b>Utility:</b> Gameplay boosts, premium access, governance & lore unlocks.</li>
            </ul>
            <div className="small muted">Full details reveal at T-0. Stay anchored.</div>
          </div>
        </section>

        {/* ROADMAP */}
        <section className="section card gradient-border pad-24 hover ts-roadmap">
          <h3 className="soft-title"><span className="yolo-gradient">Roadmap • Waves of Release</span></h3>
          <ol className="ts-steps">
            <li><b>First Wave</b> — Presale opens, XP blessing airdrops, lore reveal.</li>
            <li><b>Second Wave</b> — Premium Isles unlocks, governance proposals begin.</li>
            <li><b>Third Wave</b> — Cross-event quests, Cowrie NFT badge crafting.</li>
          </ol>
        </section>

        {/* FAQ */}
        <section className="section card gradient-border pad-24 hover ts-faq">
          <h3 className="soft-title">FAQ</h3>
          <details open>
            <summary>Will I be able to buy here?</summary>
            <p className="muted">No. This page is for countdown, story and info only. Transactions go live at First Wave.</p>
          </details>
          <details>
            <summary>Where will the live details be posted?</summary>
            <p className="muted">Inside the app and on our socials at T-0. Use “Set Reminder” to add it to your calendar.</p>
          </details>
          <details>
            <summary>Is the total supply fixed?</summary>
            <p className="muted">Supply is <i>To Be Announced</i>. The reveal is part of the Seven Isles lore drop.</p>
          </details>
        </section>
      </div>
    </Page>
  );
}
