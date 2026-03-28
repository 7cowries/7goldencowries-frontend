import React from "react";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import { useTheme } from "../context/ThemeContext";
import WalletStatus from "../components/WalletStatus";

export default function Staking() {
  const { theme } = useTheme();

  return (
    <PageContainer>
      <SectionHeader
        title="GCT Staking"
        subtitle="Staking dashboard preview. On-chain stake and unstake transactions are not live on this deployment yet."
      />
      <div className="card glass" data-theme={theme}>
        <div style={{ marginBottom: 16 }}>
          <WalletStatus />
        </div>
        <div className="card-grid">
          <div>
            <p className="eyebrow">Stake (coming soon)</p>
            <input className="input" type="number" placeholder="Amount of GCT" disabled />
            <button className="btn primary" disabled title="Staking transactions are not enabled yet">
              Not available yet
            </button>
          </div>
          <div>
            <p className="eyebrow">Unstake (coming soon)</p>
            <input className="input" type="number" placeholder="Amount to unstake" disabled />
            <button className="btn" disabled title="Unstaking transactions are not enabled yet">
              Not available yet
            </button>
          </div>
          <div className="metric">
            <p className="eyebrow">Multiplier</p>
            <h3>—</h3>
            <p className="muted">Multiplier will appear after staking contracts are connected.</p>
          </div>
          <div className="metric">
            <p className="eyebrow">Balance</p>
            <h3>— GCT</h3>
            <p className="muted">Wallet balance sync is pending backend contract integration.</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
