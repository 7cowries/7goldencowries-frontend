import React from "react";
const style = {
  position: "fixed",
  right: "10px",
  bottom: "10px",
  zIndex: 9999,
  padding: "6px 10px",
  borderRadius: "10px",
  background: "rgba(0,0,0,0.6)",
  color: "#c9f1ff",
  fontSize: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  backdropFilter: "blur(4px)"
};
export default function PrdBadge() {
  return (
    <a href="/docs/7goldencowries_Final_Full_PRD_v1.2.pdf" target="_blank" rel="noreferrer" style={style}>
      PRD v1.2
    </a>
  );
}
