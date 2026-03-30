import React from "react";
import Page from "../components/Page";
import { getLeaderboard, getMe } from "../utils/api";

export default function Profile() {
  const [me, setMe] = React.useState({ levelName: "Shellborn", xp: 0, tier: "Free", referralCount: 0, wallet: "" });
  const [leaders, setLeaders] = React.useState([]);

  React.useEffect(() => {
    getMe({ force: true })
      .then((data) => setMe((prev) => ({ ...prev, ...data })))
      .catch(() => {});
    getLeaderboard()
      .then((data) => setLeaders(Array.isArray(data?.entries) ? data.entries.slice(0, 5) : []))
      .catch(() => setLeaders([]));
  }, []);

  return (
    <Page>
      <section className="glass-panel section-panel profile-cinematic">
        <p className="section-eyebrow">Prestige Command</p>
        <h1 className="page-title">Profile</h1>

        <div className="profile-rank-grid">
          <article className="ocean-card rank-card">
            <p>Current Tier</p>
            <h3>{me.tier || "Free"}</h3>
            <small>Subscription rank</small>
          </article>
          <article className="ocean-card rank-card featured crown-card">
            <p>Temporal Rank</p>
            <h3>{me.levelName || "Shellborn"}</h3>
            <strong>{Number(me.xp || 0).toLocaleString()} XP</strong>
          </article>
          <article className="ocean-card rank-card">
            <p>Referrals</p>
            <h3>{me.referralCount || 0}</h3>
            <small>Allied explorers</small>
          </article>
        </div>

        <div className="profile-lower-grid">
          <article className="ocean-card">
            <h4>Identity Sigil</h4>
            <p className="muted">{me.wallet || "Connect wallet from top bar to bind your profile."}</p>
          </article>
          <article className="ocean-card">
            <h4>Top Captains</h4>
            <ul className="leader-mini">
              {leaders.map((row, idx) => (
                <li key={row.wallet || idx}>
                  <span>#{idx + 1}</span>
                  <span>{row.wallet ? `${row.wallet.slice(0, 6)}...${row.wallet.slice(-4)}` : "Unknown"}</span>
                  <strong>{Number(row.xp || 0).toLocaleString()} XP</strong>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </Page>
  );
}
