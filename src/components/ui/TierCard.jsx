import React from "react";
import CowryBadge from "./CowryBadge";

export default function TierCard({ tier, active, onSelect }) {
  return (
    <div className={`tier-card card ${active ? "active" : ""}`}>
      <div className="tier-head">
        <div>
          <div className="label">{tier.name}</div>
          <h3>{tier.price}</h3>
          <p className="muted">{tier.description}</p>
        </div>
        <CowryBadge level={tier.level} />
      </div>
      <ul className="tier-perks">
        {tier.perks.map((perk) => (
          <li key={perk}>{perk}</li>
        ))}
      </ul>
      <button className="btn" onClick={() => onSelect?.(tier)}>
        {active ? "Current Plan" : "Choose"}
      </button>
    </div>
  );
}
