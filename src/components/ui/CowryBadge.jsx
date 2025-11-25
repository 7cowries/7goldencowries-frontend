import React from "react";

export default function CowryBadge({ level = 1, size = "md" }) {
  return (
    <div className={`cowry-badge cowry-badge-${size}`} aria-label={`Cowry badge level ${level}`}>
      <div className="cowry-glow" />
      <div className="cowry-shell">⚱️</div>
      <div className="cowry-level">Lv {level}</div>
    </div>
  );
}
