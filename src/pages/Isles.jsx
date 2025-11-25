import React from "react";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import IslesMap from "../components/ui/IslesMap";

const isles = [
  { level: 1, name: "Isle of Dawn", lore: "Where every journey begins.", rewards: ["Badge", "50 XP"], locked: false },
  { level: 2, name: "Azure Shoal", lore: "Crystal waters and early perks.", rewards: ["80 XP", "Booster"], locked: false },
  { level: 3, name: "Golden Atoll", lore: "Allies gather here.", rewards: ["150 XP", "Partner loot"], locked: false },
  { level: 4, name: "Whisper Reef", lore: "On-chain signals and higher stakes.", rewards: ["220 XP", "On-chain badge"], locked: false },
  { level: 5, name: "Sapphire Rise", lore: "Strategists refine their routes.", rewards: ["300 XP", "XP boost"], locked: false },
  { level: 6, name: "Aurelian Deep", lore: "Veterans converge for rare perks.", rewards: ["450 XP", "Artifact"], locked: true },
  { level: 7, name: "Mythic Horizon", lore: "Legends earn the final cowry.", rewards: ["600 XP", "Mythic badge"], locked: true },
];

export default function Isles() {
  return (
    <PageContainer>
      <SectionHeader title="Seven Isles" subtitle="Unlock lore and rewards as you level" />
      <IslesMap isles={isles} />
    </PageContainer>
  );
}
