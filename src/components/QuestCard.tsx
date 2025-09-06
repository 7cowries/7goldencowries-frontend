import React, { useState } from "react";
import ProofModal from "./ProofModal";

const ALLOW_LINK_PENDING_CLAIM = true;

export default function QuestCard({ quest, refetchAll }: { quest: any; refetchAll: () => void }) {
  const [showProof, setShowProof] = useState(false);
  const [proofStatus, setProofStatus] = useState<"pending" | "approved" | null>(
    (quest.proofStatus as any) || null
  );

  const canClaim =
    quest.completed === true ||
    proofStatus === "approved" ||
    (ALLOW_LINK_PENDING_CLAIM && quest.requirement === "link" && proofStatus === "pending");

  async function claim() {
    try {
      localStorage.getItem("wallet");
    } catch {}
    try {
      const res = await fetch(`/api/quests/${quest.id}/claim`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("claim failed");
      await refetchAll();
    } catch (e) {
      alert("Could not claim. Ensure proof is submitted/approved.");
    }
  }

  return (
    <div className="glass quest-card">
      <div className="q-row">
        {quest.type === "link" ? (
          quest.url ? (
            <a
              href={quest.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`chip ${quest.type}`}
              onClick={(e) => e.stopPropagation()}
            >
              Link
            </a>
          ) : (
            <span className={`chip ${quest.type}`}>Link</span>
          )
        ) : (
          <span className={`chip ${quest.type}`}>
            {quest.type?.charAt(0).toUpperCase() + quest.type?.slice(1)}
          </span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {typeof proofStatus === "string" && (
            <span className={`chip ${proofStatus}`}>
              {proofStatus.charAt(0).toUpperCase() + proofStatus.slice(1)}
            </span>
          )}
          <span className="xp-badge">+{quest.xp} XP</span>
        </div>
      </div>
      <p className="quest-title">
        {quest.url ? (
          <a
            href={quest.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (process.env.NODE_ENV !== "production") {
                console.log("quest_opened", quest.id);
              }
              e.stopPropagation();
            }}
          >
            {quest.title || quest.id}
          </a>
        ) : (
          quest.title || quest.id
        )}
      </p>
      {quest.url ? (
        <div className="muted mono" style={{ wordBreak: "break-all" }}>
          {quest.url}
        </div>
      ) : null}
      <div className="actions">
        {quest.url && (
          <a
            className="btn primary"
            href={quest.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (process.env.NODE_ENV !== "production") {
                console.log("quest_opened", quest.id);
              }
            }}
          >
            Go
          </a>
        )}
        {quest.requirement ? (
          <button className="btn primary" onClick={() => setShowProof(true)}>
            Submit proof
          </button>
        ) : null}
        {quest.alreadyClaimed || quest.claimed ? (
          <button className="btn success" disabled>
            Claimed
          </button>
        ) : (
          <button className="btn ghost" disabled={!canClaim} onClick={claim}>
            Claim
          </button>
        )}
      </div>
      {showProof && (
        <ProofModal
          questId={quest.id}
          requirement={quest.requirement}
          onClose={() => setShowProof(false)}
          onSubmitted={(next) => {
            setProofStatus(next);
            refetchAll();
          }}
        />
      )}
    </div>
  );
}
