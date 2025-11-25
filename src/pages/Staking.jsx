import React from "react";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import { useTheme } from "../context/ThemeContext";

export default function Staking() {
  const { theme } = useTheme();

  return (
    <PageContainer>
      <SectionHeader
        title="GCT Staking"
        subtitle="Stake tokens, track multipliers, and earn progression XP in the new oceanic shell."
      />
      <div className="card glass" data-theme={theme}>
        <div className="card-grid">
          <div>
            <p className="eyebrow">Stake</p>
            <input className="input" type="number" placeholder="Amount of GCT" />
            <button className="btn primary">Stake</button>
          </div>
          <div>
            <p className="eyebrow">Unstake</p>
            <input className="input" type="number" placeholder="Amount to unstake" />
            <button className="btn">Unstake</button>
          </div>
          <div className="metric">
            <p className="eyebrow">Multiplier</p>
            <h3>1.25x</h3>
            <p className="muted">Live staking XP multiplier with your current position.</p>
          </div>
          <div className="metric">
            <p className="eyebrow">Balance</p>
            <h3>0.00 GCT</h3>
            <p className="muted">Synced with the connected wallet.</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
