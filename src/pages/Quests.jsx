import React, { useEffect, useState } from "react";
import { getQuests, claimQuest, submitProof, getMe } from "../utils/api";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [proof, setProof] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    getQuests().then((res) => setQuests(res?.quests || [])).catch(() => {});
  }, []);

  async function handleSubmit(q) {
    try {
      await submitProof(q.id, { url: proof[q.id] });
      setSubmitted({ ...submitted, [q.id]: true });
    } catch (e) {
      console.error(e);
    }
  }

  async function claim(q) {
    try {
      const res = await claimQuest(q.id);
      setToast(`+${res?.xpDelta ?? res?.xp ?? 0} XP`);
      await Promise.all([getMe(), getQuests()]).then(([, qs]) => {
        setQuests(qs?.quests || []);
      });
      setTimeout(() => setToast(""), 3000);
    } catch (e) {
      console.error(e);
    }
  }

  function placeholderFor(q) {
    if (["tweet", "retweet", "quote"].includes(q.requirement)) {
      return "Paste tweet/retweet/quote link";
    }
    return "Paste your proof link";
  }

  return (
    <Section title="Quests" subtitle="Complete tasks. Earn XP. Level up.">
      <div className="grid-2">
        {quests.map((q) => (
          <Card key={q.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              {q.url ? (
                <a
                  href={q.url}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline"
                  style={{ fontWeight: 700, fontSize: 18 }}
                >
                  {q.title || q.id}
                </a>
              ) : (
                <span style={{ fontWeight: 700, fontSize: 18 }}>{q.title || q.id}</span>
              )}
              {q.category && <span className="pill">{q.category}</span>}
            </div>

            <div className="muted" style={{ marginTop: 6 }}>{q.subtitle || q.url}</div>

            {/* proof input */}
            {q.requirement && q.requirement !== "none" && !q.claimed && !submitted[q.id] && (
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                <input
                  placeholder={placeholderFor(q)}
                  value={proof[q.id] || ""}
                  onChange={(e) => setProof({ ...proof, [q.id]: e.target.value })}
                />
                <button className="btn success" onClick={() => handleSubmit(q)}>Submit</button>
              </div>
            )}

            {/* claim button */}
            {!q.claimed && (q.requirement === "none" || submitted[q.id]) && (
              <button className="btn glow" style={{ marginTop: 12 }} onClick={() => claim(q)}>
                Claim
              </button>
            )}

            {q.claimed && <div className="chip success" style={{ marginTop: 12 }}>✔ Completed · +{q.xp} XP</div>}
          </Card>
        ))}
      </div>
      {toast && <div className="chip" style={{ marginTop: 16 }}>{toast}</div>}
    </Section>
  );
}
