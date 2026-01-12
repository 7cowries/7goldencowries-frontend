import React from 'react';
import { useThemeContext } from '@/theme/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  padding?: string;
  className?: string;
  glow?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, padding = '20px', className = '', glow }) => {
  const { design } = useThemeContext();
  return (
    <div
      className={`glass-card ${className}`}
      style={{
        padding,
        background: design.effects.glassPresets.panel.background,
        border: design.borders.glow,
        boxShadow: `${design.effects.shadows.glass}${glow ? `, ${design.effects.shadows.glow}` : ''}`,
        backdropFilter: 'blur(12px)',
        borderRadius: design.effects.radii.lg,
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
