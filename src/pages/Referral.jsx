import React from "react";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import ReferralCard from "../components/ui/ReferralCard";

const referrals = [
  { handle: "@sailor1", joined: "Joined today", xp: 120, status: "claimable" },
  { handle: "@deepdiver", joined: "Joined 2d ago", xp: 90, status: "pending" },
];

export default function Referral() {
  const handleClaim = (referral) => {
    console.log("Claiming", referral.handle);
  };

  return (
    <PageContainer>
      <SectionHeader title="Referral" subtitle="Invite friends and earn XP" />
      <div className="card referral-hero">
        <div>
          <div className="label">Your Code</div>
          <h2>COWRY-SEA-728</h2>
          <p className="muted">Share this link to earn XP: app/7gc?ref=cowry</p>
        </div>
        <div className="stat-row">
          <div>
            <div className="label">Total XP</div>
            <strong>1,240</strong>
          </div>
          <div>
            <div className="label">Referrals</div>
            <strong>18</strong>
          </div>
        </div>
      </div>

      <SectionHeader title="Referrals" subtitle="Claim XP per friend" />
      <div className="stack">
        {referrals.map((ref) => (
          <ReferralCard key={ref.handle} referral={ref} onClaim={handleClaim} />
        ))}
      </div>
    </PageContainer>
  );
}
