import React from "react";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import StakingPanel from "../components/ui/StakingPanel";
import XPBarAnimated from "../components/ui/XPBarAnimated";

export default function Staking() {
  return (
    <PageContainer>
      <SectionHeader title="Staking" subtitle="Stake GCT for XP multipliers" />
      <StakingPanel balance={4200} multiplier={1.4} />
      <XPBarAnimated label="Multiplier Progress" current={70} total={100} />
    </PageContainer>
  );
}
