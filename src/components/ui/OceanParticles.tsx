import React, { useEffect, useMemo, useRef } from 'react';
import { useThemeContext } from '@/theme/ThemeContext';

const generateParticles = (count: number) =>
  Array.from({ length: count }).map((_, idx) => ({
    id: idx,
    size: Math.random() * 4 + 1,
    left: Math.random() * 100,
    delay: Math.random() * 12,
    duration: Math.random() * 18 + 12,
    opacity: Math.random() * 0.4 + 0.2,
  }));

const OceanParticles: React.FC<{ density?: number }> = ({ density = 36 }) => {
  const { particles, animations } = useThemeContext();
  const particlesRef = useRef<HTMLDivElement | null>(null);
  const items = useMemo(() => generateParticles(density), [density]);

  useEffect(() => {
    if (!particlesRef.current) return;
    particlesRef.current.style.opacity = particles ? '1' : '0';
  }, [particles]);

  return (
    <div
      ref={particlesRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        transition: 'opacity 400ms ease',
      }}
    >
      {items.map((item) => (
        <span
          key={item.id}
          style={{
            position: 'absolute',
            top: '-10%',
            left: `${item.left}%`,
            width: item.size,
            height: item.size,
            background: 'rgba(255, 239, 159, 0.4)',
            borderRadius: '999px',
            filter: 'blur(0px)',
            opacity: item.opacity,
            boxShadow: '0 0 12px rgba(255, 216, 107, 0.5)',
            animation: animations
              ? `floatY ${item.duration}s linear ${item.delay}s infinite`
              : undefined,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes floatY {
          0% { transform: translateY(0); }
          100% { transform: translateY(110vh); }
        }
      `}</style>
    </div>
  );
};

export default OceanParticles;
