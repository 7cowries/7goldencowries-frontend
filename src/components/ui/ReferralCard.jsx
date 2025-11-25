import React from "react";

export default function ReferralCard({ referral, onClaim }) {
  const canClaim = referral.status === "claimable";
  return (
    <div className="referral-card card">
      <div>
        <div className="label">Friend</div>
        <strong>{referral.handle}</strong>
        <p className="muted">{referral.joined}</p>
      </div>
      <div className="referral-meta">
        <span className="chip">{referral.xp} XP</span>
        <button className="btn" disabled={!canClaim} onClick={() => canClaim && onClaim?.(referral)}>
          {canClaim ? "Claim" : referral.status}
        </button>
      </div>
    </div>
  );
}
