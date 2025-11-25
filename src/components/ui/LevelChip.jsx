import React from "react";
import CowryBadge from "./CowryBadge";

export default function LevelChip({ level = 1, xp = 0 }) {
  return (
    <div className="level-chip">
      <CowryBadge level={level} size="sm" />
      <div>
        <div className="label">Level {level}</div>
        <div className="muted">{xp.toLocaleString()} XP</div>
      </div>
    </div>
  );
}
