import React from "react";
import { motion } from "framer-motion";

export default function XPBarAnimated({ label = "XP", current = 0, total = 1000, compact = false }) {
  const clamped = Math.max(0, Math.min(current, total));
  const pct = total === 0 ? 0 : Math.round((clamped / total) * 100);

  return (
    <div className={`xp-bar ${compact ? "xp-bar-compact" : ""}`} aria-label={`${label} progress`}>
      <div className="xp-bar-header">
        <span className="xp-bar-label">{label}</span>
        <span className="xp-bar-value">{clamped.toLocaleString()} / {total.toLocaleString()} XP</span>
      </div>
      <div className="xp-bar-track">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="xp-bar-footer">
        <span className="xp-bar-pct">{pct}%</span>
      </div>
    </div>
  );
}
