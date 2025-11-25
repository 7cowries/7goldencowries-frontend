import React, { useState } from "react";
import CowryBadge from "./CowryBadge";

export default function IslesMap({ isles }) {
  const [selected, setSelected] = useState(isles[0]);

  return (
    <div className="isles-layout">
      <div className="isles-grid">
        {isles.map((isle) => (
          <button
            key={isle.level}
            className={`isle-node ${selected.level === isle.level ? "active" : ""} ${isle.locked ? "locked" : ""}`}
            onClick={() => setSelected(isle)}
          >
            <CowryBadge level={isle.level} />
            <div className="isle-name">{isle.name}</div>
            <div className="isle-status">{isle.locked ? "Locked" : "Unlocked"}</div>
          </button>
        ))}
      </div>
      <div className="isle-detail card">
        <div className="label">Level {selected.level}</div>
        <h3>{selected.name}</h3>
        <p className="muted">{selected.lore}</p>
        <div className="chip-row">
          {selected.rewards.map((reward) => (
            <span key={reward} className="chip">
              {reward}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
