import React, { useEffect, useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext';

const randomParticle = (i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 5}s`,
  duration: `${12 + Math.random() * 10}s`,
  size: 4 + Math.random() * 4,
});

export const OceanParticles = () => {
  const { particles } = useTheme();
  const nodes = useMemo(() => Array.from({ length: 38 }, (_, i) => randomParticle(i)), []);

  useEffect(() => {}, [particles]);

  if (!particles) return null;

  return (
    <div className="particle-layer">
      {nodes.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
};

export default OceanParticles;
