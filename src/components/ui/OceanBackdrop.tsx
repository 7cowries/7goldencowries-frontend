import React from 'react';
import { useThemeContext } from '@/theme/ThemeContext';

const OceanBackdrop: React.FC<{ children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>> = ({ children, style, ...rest }) => {
  const { design } = useThemeContext();
  return (
    <div
      {...rest}
      style={{
        minHeight: '100vh',
        position: 'relative',
        background: design.gradients.ocean,
        overflow: 'hidden',
        color: design.colors.neutrals.base,
        ...style,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: design.colors.ocean.aura, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default OceanBackdrop;
