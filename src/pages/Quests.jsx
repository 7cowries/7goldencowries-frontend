import React from "react";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import XPBarAnimated from "../components/ui/XPBarAnimated";
import QuestCard from "../components/ui/QuestCard";

const questsByType = {
  Daily: [
    { title: "Check-in", description: "Log your voyage for the day", reward: 50, status: "claimable", type: "Daily", cooldown: "6h", level: 1 },
    { title: "Chart the tide", description: "Review today's isle map", reward: 40, status: "active", type: "Daily", cooldown: "12h", level: 1 },
  ],
  Partner: [
    { title: "Bridge assets", description: "Move tokens to TON partner pool", reward: 220, status: "active", type: "Partner", network: "TON", level: 3 },
  ],
  Social: [
    { title: "Follow on X", description: "Follow @7goldencowries on X", reward: 80, status: "completed", type: "Social", level: 2 },
    { title: "Join Telegram", description: "Enter the crew chat", reward: 80, status: "claimable", type: "Social", level: 2 },
  ],
  "On-Chain": [
    { title: "Mint badge", description: "Mint your voyager badge", reward: 320, status: "locked", type: "On-Chain", network: "TON", level: 4 },
  ],
  Referral: [
    { title: "Invite a friend", description: "Bring a friend to claim XP", reward: 150, status: "active", type: "Referral", level: 1 },
  ],
};

export default function Quests() {
  const handleQuestAction = (quest) => {
    console.log("Quest action", quest.title);
  };

  return (
    <PageContainer>
      <SectionHeader title="Quests" subtitle="Daily, partner, social, and on-chain tasks" />
      <XPBarAnimated label="Season XP" current={2450} total={5000} />

      {Object.entries(questsByType).map(([type, list]) => (
        <section key={type} className="quest-section">
          <div className="section-heading">
            <h3>{type}</h3>
            <span className="muted">{list.length} quests</span>
          </div>
          <div className="grid two">
            {list.map((quest) => (
              <QuestCard key={quest.title} quest={quest} onAction={handleQuestAction} />
            ))}
          </div>
        </section>
      ))}
    </PageContainer>
  );
}
