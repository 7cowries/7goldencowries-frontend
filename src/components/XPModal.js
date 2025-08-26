import React, { useEffect } from "react";
import { playXP } from "../utils/sounds";
import "./XPModal.css"; // if you have one, keep it

export default function XPModal({ xpGained = 0, onClose }) {
  useEffect(() => {
    playXP();
  }, []);

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="glass-strong modal-box">
        <h2>🎉 XP Gained!</h2>
        <p style={{ fontSize: "1.6rem", margin: "4px 0 14px" }}>+{xpGained} XP</p>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
