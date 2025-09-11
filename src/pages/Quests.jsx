import React, { useEffect, useState, useRef } from "react";
import { getQuests, claimQuest } from "../utils/api";
import { useMe } from "../state/me";
import Toast from "../components/Toast";
import ProfileWidget from "../components/ProfileWidget";
import QuestCard from "../components/QuestCard";
import Page from "../components/Page";
import "./Quests.css";
import "../App.css";
import { burstConfetti } from "../utils/confetti";

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState({});
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const mountedRef = useRef(true);

  const { me, refresh } = useMe();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function loadQuests(signal) {
    const data = await getQuests({ signal });
    if (!mountedRef.current) return;
    setQuests(data?.quests ?? []);
    setXp(data?.xp ?? 0);
  }

  async function sync() {
    setLoading(true);
    const controller = new AbortController();
    try {
      await loadQuests(controller.signal);
      if (mountedRef.current) setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e?.message || "Failed to load quests. Please try again.");
      console.error("[Quests] load error:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    sync();
    const reload = () => {
      sync();
      refresh();
    };
    window.addEventListener("profile-updated", reload);
    window.addEventListener("focus", reload);
    return () => {
      window.removeEventListener("profile-updated", reload);
      window.removeEventListener("focus", reload);
    };
  }, [refresh]);

  const handleClaim = async (id) => {
    if (claiming[id]) return;
    setClaiming((c) => ({ ...c, [id]: true }));
    try {
      const res = await claimQuest(id);
      burstConfetti();
      const delta = res?.xpDelta ?? res?.xp;
      setToast(delta != null ? `+${delta} XP` : "Quest claimed");

      await refresh();     // refresh global me
      await loadQuests();  // re-fetch quests
      window.dispatchEvent(new Event("profile-updated"));
    } catch (e) {
      setToast(e.message || "Failed to claim quest");
    } finally {
      setClaiming((c) => ({ ...c, [id]: false }));
      setTimeout(() => setToast(""), 3000);
    }
  };

  const shownQuests =
    activeTab === "all"
      ? quests.filter((q) => q.active === 1)
      : quests.filter(
          (q) =>
            (q.category || "All").toLowerCase() === activeTab && q.active === 1
        );

  if (loading) return <div className="loading">Loading quests…</div>;
  if (!loading && error)
    return (
      <div className="error">
        {error} <button onClick={sync}>Retry</button>
      </div>
    );

  return (
    <Page>
      <ProfileWidget />
      {/* tabs + list (unchanged UI) */}
      <div className="quests-list">
        {shownQuests.map((q) => (
          <QuestCard
            key={q.id}
            quest={q}
            onClaim={handleClaim}
            claiming={!!claiming[q.id]}
            me={me}
            setToast={setToast}
          />
        ))}
      </div>
      {toast ? <Toast>{toast}</Toast> : null}
    </Page>
  );
}
