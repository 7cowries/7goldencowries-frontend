/* eslint-disable */
import { getJSON, postJSON } from '../utils/api';
// src/pages/History.js
import React, { useEffect, useState } from "react";
import "../App.css";
import "./History.css";
import { API_BASE, getMe } from "../utils/api";
import useWallet from "../hooks/useWallet";

const API = API_BASE || "";

export default function History() {
  const { wallet } = useWallet();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quests, setQuests] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // Prefer session endpoint first (no wallet param needed if logged-in)
        const me = await getMe().catch(() => null);

        let xpRes;
        if (me?.authed) {
          xpRes = await getJSON("/api/xp/history`, { credentials: "include" });
        } else if (wallet) {
          xpRes = await getJSON("/api/xp/history?wallet=${encodeURIComponent(wallet)}`);
        }

        if (xpRes?.ok) {
          const data = await xpRes.json();
          if (!cancelled) setRows(data.rows || []);
        }

        // Optional: show quest history below (best-effort)
        let qRes;
        if (me?.authed) {
          qRes = await getJSON("/api/quests/history`, { credentials: "include" });
        } else if (wallet) {
          qRes = await getJSON("/api/quests/history?wallet=${encodeURIComponent(wallet)}`);
        }
        if (qRes?.ok) {
          const qd = await qRes.json();
          if (!cancelled) setQuests(qd.rows || []);
        }
      } catch (e) {
        console.error("History load failed:", e);
        if (!cancelled) { setRows([]); setQuests([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    // refresh when quests complete
    const onUpdate = () => load();
    window.addEventListener("quests:updated", onUpdate);
    return () => { cancelled = true; window.removeEventListener("quests:updated", onUpdate); };
  }, [wallet]);

  return (
    <div className="page">
      <div className="section">
        <h1>📜 XP History</h1>
        <p className="subtitle">Transparent ledger of your XP changes.</p>

        {loading ? (
          <div className="history-skel">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="row-skel" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="empty">No XP entries yet.</div>
        ) : (
          <div className="hist-table glass">
            <div className="hist-head">
              <div>Date</div>
              <div>Change</div>
              <div>Reason</div>
              <div>Meta</div>
            </div>
            <div className="hist-body">
              {rows.map((r) => (
                <div key={r.id} className="hist-row">
                  <div className="when">{fmtDate(r.created_at)}</div>
                  <div className={`delta ${r.delta >= 0 ? "pos" : "neg"}`}>
                    {r.delta >= 0 ? `+${r.delta}` : r.delta}
                  </div>
                  <div className="reason">{r.reason || "—"}</div>
                  <div className="meta">{miniMeta(r.meta)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional: show quest completions (helps users map sources of XP) */}
        {quests.length > 0 && (
          <>
            <h2 style={{ marginTop: 24 }}>✅ Quest Completions</h2>
            <div className="hist-table glass">
              <div className="hist-head">
                <div>Date</div>
                <div>XP</div>
                <div>Title</div>
                <div>Quest ID</div>
              </div>
              <div className="hist-body">
                {quests.map((q) => (
                  <div key={q.id} className="hist-row">
                    <div className="when">{fmtDate(q.completed_at || q.timestamp)}</div>
                    <div className="delta pos">+{q.xp ?? 0}</div>
                    <div className="reason">{q.title || "Quest"}</div>
                    <div className="meta mono">{q.quest_id ?? "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function fmtDate(d) {
  try { return new Date(d).toLocaleString(); } catch { return "—"; }
}
function miniMeta(m) {
  if (!m) return "—";
  if (typeof m === "string") {
    if (m.length > 60) return m.slice(0, 57) + "…";
    return m;
  }
  try {
    const s = JSON.stringify(m);
    return s.length > 60 ? s.slice(0, 57) + "…" : s;
  } catch {
    return "—";
  }
}
