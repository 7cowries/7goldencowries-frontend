import React from "react";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import TierCard from "../components/ui/TierCard";

const tiers = [
  { name: "Free", price: "$0", description: "Base access", level: 1, perks: ["Daily quests", "Referral code"] },
  { name: "Tier 1", price: "$2", description: "Starter boosts", level: 2, perks: ["+5% XP", "Priority quests"] },
  { name: "Tier 2", price: "$5", description: "Crew status", level: 3, perks: ["+10% XP", "Partner drops", "Early Isles"] },
  { name: "Tier 3", price: "$10", description: "Captain", level: 4, perks: ["+20% XP", "Premium support", "Mythic raffles"] },
];

const history = [
  { date: "Oct 10", tier: "Tier 2", amount: "$5" },
  { date: "Sep 10", tier: "Tier 1", amount: "$2" },
];

export default function Subscription() {
  return (
    <PageContainer>
      <SectionHeader title="Subscription" subtitle="Select your monthly tier" />
      <div className="grid four">
        {tiers.map((tier) => (
          <TierCard key={tier.name} tier={tier} active={tier.name === "Tier 2"} />
        ))}
      </div>

      <SectionHeader title="History" subtitle="Recent renewals" />
      <div className="card">
        <div className="table">
          <div className="table-head">
            <span>Date</span>
            <span>Tier</span>
            <span>Amount</span>
          </div>
          {history.map((row) => (
            <div className="table-row" key={row.date}>
              <span>{row.date}</span>
              <span>{row.tier}</span>
              <span>{row.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
