import React from "react";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import ProfileStats from "../components/ui/ProfileStats";
import QuestCard from "../components/ui/QuestCard";

const profile = {
  wallet: "EQC8...Cowry",
  twitter: "@cowrycaptain",
  level: 5,
  xp: 3420,
  nextLevel: 5000,
  completed: 124,
  tier: "Tier 2",
  perks: ["XP Boost", "Priority Support", "Early Isles"],
  badges: [1, 2, 3, 4, 5],
};

const history = [
  { title: "Daily check-in", description: "Logged voyage", reward: 40, status: "completed", type: "Daily", level: 1 },
  { title: "Partner bridge", description: "Moved assets", reward: 200, status: "claimable", type: "Partner", level: 3 },
];

export default function Profile() {
  return (
    <PageContainer>
      <SectionHeader title="Profile" subtitle="Wallet, socials, XP, and perks" />
      <ProfileStats profile={profile} />

      <SectionHeader title="Quest History" subtitle="Recent actions" />
      <div className="grid two">
        {history.map((quest) => (
          <QuestCard key={quest.title} quest={quest} />
        ))}
      </div>
    </PageContainer>
  );
}
