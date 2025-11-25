import React from "react";
import { motion } from "framer-motion";
import CowryBadge from "./CowryBadge";

const statusLabels = {
  locked: "Locked",
  claimable: "Claim",
  completed: "Completed",
  active: "Start",
};

export default function QuestCard({ quest, onAction }) {
  const status = quest.status || "active";
  const label = statusLabels[status] || "Start";
  const disabled = status === "locked" || status === "completed";

  return (
    <motion.div
      className={`quest-card card ${quest.status}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="quest-card-header">
        <div className="quest-type">{quest.type}</div>
        <CowryBadge level={quest.level || 1} size="xs" />
      </div>
      <h3 className="quest-title">{quest.title}</h3>
      <p className="muted">{quest.description}</p>
      <div className="quest-meta">
        <span className="chip">{quest.reward} XP</span>
        {quest.cooldown && <span className="chip ghost">Cooldown {quest.cooldown}</span>}
        {quest.network && <span className="chip ghost">{quest.network}</span>}
      </div>
      <div className="quest-actions">
        <button className="btn" disabled={disabled} onClick={() => !disabled && onAction?.(quest)}>
          {label}
        </button>
        {status === "completed" && <span className="quest-status success">Completed</span>}
        {status === "locked" && <span className="quest-status muted">Locked</span>}
        {status === "claimable" && <span className="quest-status info">Claim ready</span>}
      </div>
    </motion.div>
  );
}
