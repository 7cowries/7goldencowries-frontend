import React from 'react';

const SectionHeader = ({ title, subtitle, actions }) => (
  <div className="section-header">
    <div>
      <h2>{title}</h2>
      {subtitle && <p className="small-label">{subtitle}</p>}
    </div>
    {actions && <div className="flex-wrap">{actions}</div>}
  </div>
);

export default SectionHeader;
