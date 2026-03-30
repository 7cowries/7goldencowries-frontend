import React from "react";
import Page from "../components/Page";
import { getMe } from "../utils/api";

export default function Isles() {
  const [me, setMe] = React.useState({ levelName: "Shellborn", xp: 0, nextXP: 1000, levelProgress: 0 });

  React.useEffect(() => {
    getMe({ force: true })
      .then((data) => setMe((prev) => ({ ...prev, ...data })))
      .catch(() => {});
  }, []);

  const pct = Math.max(0, Math.min(100, Math.round((Number(me.levelProgress) || 0) * 100)));

  return (
    <Page>
      <section className="glass-panel section-panel isles-scene">
        <div className="section-head-row">
          <div>
            <p className="section-eyebrow">Realm Progression</p>
            <h1 className="page-title">Isle of Pearls</h1>
            <p className="muted">Navigate the luminous route and unlock deeper dominions.</p>
          </div>
          <div className="quest-progress-box">
            <span>{me.levelName || "Shellborn"}</span>
            <strong>{pct}%</strong>
          </div>
        </div>

        <div className="map-stage">
          <div className="path-line" />
          {["Shellborn", "Wave Seeker", "Tide Whisperer", "Current Binder", "Pearl Bearer", "Isle Champion"].map((name, idx) => (
            <div key={name} className={`isle-node ${pct / 20 >= idx ? "active" : ""}`} style={{ left: `${8 + idx * 17}%`, top: `${70 - idx * 10}%` }}>
              <span>{idx + 1}</span>
              <small>{name}</small>
            </div>
          ))}
        </div>

        <div className="xp-track">
          <div className="xp-track-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="muted">{Number(me.xp || 0).toLocaleString()} XP gathered · Next tide at {me.nextXP || "∞"} XP.</p>
      </section>
    </Page>
  );
}
