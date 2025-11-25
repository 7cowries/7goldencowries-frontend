import React from 'react';

const GlassCard = ({ title, subtitle, children, actions, className = '' }) => (
  <div className={`glass-panel ${className}`}>
    <div className="glass-inner">
      {(title || subtitle || actions) && (
        <div className="section-header">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p className="small-label">{subtitle}</p>}
          </div>
          {actions && <div className="flex-wrap">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  </div>
);

export default GlassCard;
