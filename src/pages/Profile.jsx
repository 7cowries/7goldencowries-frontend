import React from "react";
import Page from "../components/Page";
import { getMe } from "../utils/api";

export default function Profile() {
  const [me, setMe] = React.useState({ levelName: "Shellborn", xp: 0, tier: "Free", referralCount: 0, wallet: "" });

  React.useEffect(() => {
    getMe({ force: true })
      .then((data) => setMe((prev) => ({ ...prev, ...data })))
      .catch(() => {});
  }, []);

  return (
    <Page>
      <section className="glass-panel section-panel">
        <p className="section-eyebrow">Prestige Command</p>
        <h1 className="page-title">Profile</h1>

        <div className="profile-rank-grid">
          <article className="ocean-card rank-card">
            <p>Current Tier</p>
            <h3>{me.tier || "Free"}</h3>
          </article>
          <article className="ocean-card rank-card featured">
            <p>Temporal Rank</p>
            <h3>{me.levelName || "Shellborn"}</h3>
            <strong>{Number(me.xp || 0).toLocaleString()} XP</strong>
          </article>
          <article className="ocean-card rank-card">
            <p>Referrals</p>
            <h3>{me.referralCount || 0}</h3>
          </article>
        </div>

        <article className="ocean-card">
          <h4>Identity Sigil</h4>
          <p className="muted">{me.wallet || "Connect wallet from top bar to bind your profile."}</p>
        </article>
      </section>
    </Page>
  );
}
