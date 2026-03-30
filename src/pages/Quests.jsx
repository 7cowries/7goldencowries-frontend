import React, { useMemo, useState } from "react";
import Page from "../components/Page";
import { claimQuest, getQuests } from "../utils/api";

const FILTERS = ["all", "social", "partner", "onchain", "daily"];

export default function Quests() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quests, setQuests] = useState([]);
  const [active, setActive] = useState("all");
  const [claiming, setClaiming] = useState({});

  React.useEffect(() => {
    let live = true;
    setLoading(true);
    getQuests()
      .then((data) => {
        if (!live) return;
        setQuests(Array.isArray(data?.quests) ? data.quests : []);
        setError("");
      })
      .catch((err) => {
        if (!live) return;
        setError(err?.message || "Could not load quests.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (active === "all") return quests;
    return quests.filter((q) => String(q.category || "").toLowerCase() === active);
  }, [active, quests]);

  const completed = filtered.filter((q) => q.completed || q.claimed || q.alreadyClaimed).length;
  const progress = filtered.length ? Math.round((completed / filtered.length) * 100) : 0;

  const onClaim = async (quest) => {
    if (!quest?.id || claiming[quest.id]) return;
    setClaiming((p) => ({ ...p, [quest.id]: true }));
    try {
      await claimQuest(quest.id);
      setQuests((prev) =>
        prev.map((item) => (item.id === quest.id ? { ...item, claimed: true, completed: true } : item))
      );
    } catch {
      // graceful no-op
    } finally {
      setClaiming((p) => ({ ...p, [quest.id]: false }));
    }
  };

  return (
    <Page>
      <section className="glass-panel section-panel">
        <div className="section-head-row">
          <div>
            <p className="section-eyebrow">Quest Command</p>
            <h1 className="page-title">Quests</h1>
          </div>
          <div className="quest-progress-box">
            <span>Voyage Progress</span>
            <strong>{progress}%</strong>
          </div>
        </div>

        <div className="tab-strip">
          {FILTERS.map((f) => (
            <button key={f} className={`tab-btn ${active === f ? "active" : ""}`} onClick={() => setActive(f)}>
              {f}
            </button>
          ))}
        </div>

        <div className="xp-track">
          <div className="xp-track-fill" style={{ width: `${progress}%` }} />
        </div>

        {loading ? <p className="muted">Scanning the tides for fresh missions…</p> : null}
        {error ? <p className="muted">{error}</p> : null}

        <div className="quest-stack">
          {filtered.slice(0, 8).map((quest) => {
            const done = quest.completed || quest.claimed || quest.alreadyClaimed;
            const reward = quest.xp || quest.rewardXP || 150;
            return (
              <article key={quest.id} className="quest-row ocean-card">
                <div className="quest-icon">✦</div>
                <div className="quest-copy">
                  <h4>{quest.title || "Untitled mission"}</h4>
                  <p>{quest.description || "Complete this operation to advance your dominion rank."}</p>
                </div>
                <div className="quest-reward">+{reward} XP</div>
                <button className="card-cta" disabled={done || claiming[quest.id]} onClick={() => onClaim(quest)}>
                  {done ? "Claimed" : claiming[quest.id] ? "Claiming…" : "Claim Reward"}
                </button>
              </article>
            );
          })}
        </div>

        <div className="scene-banner">Seven Isles of Tides • Each completed quest lights a new route.</div>
      </section>
    </Page>
  );
}
