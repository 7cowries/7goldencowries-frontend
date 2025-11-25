import React from "react";

export default function SectionHeader({ title, subtitle, actions }) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{subtitle}</p>
        <h1 className="page-title">{title}</h1>
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </div>
  );
}
