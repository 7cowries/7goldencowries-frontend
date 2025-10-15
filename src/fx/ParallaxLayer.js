import { useEffect, useRef } from 'react';
export default function ParallaxLayer({ depth=20, children, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const on = (e) => {
      const x = (e.clientX / window.innerWidth - .5) * depth;
      const y = (e.clientY / window.innerHeight - .5) * depth;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    window.addEventListener('mousemove', on);
    return () => window.removeEventListener('mousemove', on);
  }, [depth]);
  return <div ref={ref} style={{position:'relative', transition:'transform 80ms linear', ...style}}>{children}</div>;
}
