// src/pages/Referrals.js
import React, { useEffect, useMemo, useState } from "react";

import { playClick } from "../utils/sounds";
import { getReferralCode, getReferralStats } from "../utils/referrals";
import { getReferralInfo } from "../utils/api";

function Toast({ msg, type = "info", onClose }) {
  if (!msg) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        padding: "10px 14px",
        background: type === "error" ? "#ff4d4f" : "#333",
        color: "#fff",
        borderRadius: 8,
        zIndex: 9999,
        cursor: "pointer",
      }}
      onClick={onClose}
    >
      {msg}
    </div>
  );
}

export default function Referrals() {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [referees, setReferees] = useState([]);
  const [toast, setToast] = useState({ msg: "", type: "info" });

  const shareUrl = useMemo(() => {
    const origin =
      (typeof window !== "undefined" && window.location?.origin) || "";
    return code ? `${origin}/quests?ref=${code}` : "";
  }, [code]);

  async function load() {
    setLoading(true);
    try {
      const [info, stats] = await Promise.all([
        getReferralInfo().catch(() => null),
        getReferralStats().catch(() => null),
      ]);
      if (info?.referral_code) setCode(info.referral_code);
      else if (stats?.code) setCode(stats.code);
      else {
        const c = await getReferralCode();
        if (c) setCode(c);
      }
      setReferees(Array.isArray(stats?.referees) ? stats.referees : []);
    } catch (e) {
      console.error(e);
      setToast({ msg: "Failed to load referrals.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const doCopy = async () => {
    try {
      if (!shareUrl) return;
      await navigator.clipboard.writeText(shareUrl);
      setToast({ msg: "Copied referral link!", type: "info" });
    } catch {
      setToast({ msg: "Copy failed.", type: "error" });
    }
  };

  const doShare = async () => {
    playClick();
    try {
      if (navigator.share && shareUrl) {
        await navigator.share({
          title: "Join 7GoldenCowries",
          text: "Complete quests, earn XP — join me!",
          url: shareUrl,
        });
      } else {
        await doCopy();
      }
    } catch {
      // ignore cancel
    }
  };

  const completedCount = referees.filter((r) => !!r.first_quest_completed_at).length;

  return (
    <div className="page">
      <div className="section referral-wrapper">
        <h1 className="referral-title">🧬 Invite the Shellborn</h1>
        <p className="referral-sub">
          Earn XP as your friends explore the Seven Isles of Tides.
        </p>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <>
            {/* Code + share */}
            <div className="referral-box">
              <p>
                <strong>Your Referral Link:</strong>
              </p>
              <div className="referral-input-group">
                <input value={shareUrl} readOnly />
                <button onClick={doCopy}>📋 Copy</button>
                <button onClick={doShare}>🔗 Share</button>
              </div>
              <p className="muted mono">
                Completed: {completedCount} / {referees.length}
              </p>
            </div>

            {/* Rewards */}
            <div className="referral-rewards">
              <h2>🏅 Rewards</h2>
              <ul>
                <li>+50 XP for each referred explorer</li>
                <li>Tier 2: +10% XP bonus</li>
                <li>Tier 3: +25% XP bonus</li>
              </ul>
            </div>

            {/* Referees list */}
            <div className="referral-list">
              <h2>🌊 Your Explorers</h2>
              {referees.length === 0 ? (
                <p>No referrals yet. Share your link to get started!</p>
              ) : (
                <ul>
                  {referees.map((r, i) => (
                    <li key={i}>
                      {r.wallet || r.address}{" "}
                      <span
                        className={
                          r.first_quest_completed_at
                            ? "ref-status-complete"
                            : "ref-status-pending"
                        }
                      >
                        {r.first_quest_completed_at
                          ? "✅ first quest done"
                          : "⏳ pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      <Toast
        msg={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: "", type: "info" })}
      />
    </div>
  );
}
