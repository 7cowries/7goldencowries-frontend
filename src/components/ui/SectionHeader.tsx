import React from 'react';
import { useThemeContext } from '@/theme/ThemeContext';

const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => {
  const { design } = useThemeContext();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.02em', color: design.colors.gold.soft }}>{title}</div>
        {subtitle && <div style={{ color: design.colors.neutrals.muted, marginTop: 4 }}>{subtitle}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default SectionHeader;
