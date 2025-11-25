import React, { useMemo, useState } from "react";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import XPBarAnimated from "../components/ui/XPBarAnimated";

export default function TokenSale() {
  const [usd, setUsd] = useState(100);
  const rate = 0.03; // TON per USD
  const ton = useMemo(() => (usd * rate).toFixed(2), [usd]);

  return (
    <PageContainer>
      <SectionHeader title="Token Sale" subtitle="Contribute in USD or TON" />
      <div className="grid two">
        <div className="card">
          <div className="label">Contribution</div>
          <div className="converter">
            <label>
              USD
              <input type="number" value={usd} onChange={(e) => setUsd(Number(e.target.value))} />
            </label>
            <label>
              TON
              <input type="number" value={ton} readOnly />
            </label>
            <p className="muted">Rate: 1 USD = {rate} TON</p>
          </div>
          <button className="btn">Start Contribution</button>
        </div>
        <div className="card">
          <div className="label">Sale Progress</div>
          <XPBarAnimated label="Raised" current={620000} total={1000000} />
          <div className="stat-row">
            <div>
              <div className="label">Contributors</div>
              <strong>4,210</strong>
            </div>
            <div>
              <div className="label">Cap</div>
              <strong>$1,000,000</strong>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
