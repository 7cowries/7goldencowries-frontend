import { useEffect, useRef } from 'react';

export default function FXCanvas({ paused=false }) {
  const ref = useRef(null);
  const raf = useRef(0), dpr = window.devicePixelRatio || 1;
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const parts = Array.from({length: 28}).map(() => ({
      x: Math.random()*innerWidth*dpr,
      y: Math.random()*innerHeight*dpr,
      r: (6+Math.random()*14)*dpr,
      s: (0.15+Math.random()*0.6)*dpr,
      h: 180 + Math.random()*180, a: 0.20+Math.random()*0.25
    }));
    const resize = () => { c.width = innerWidth*dpr; c.height = innerHeight*dpr; };
    resize(); window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height);
      for (const p of parts) {
        p.y += p.s; if (p.y - p.r > c.height) { p.y = -p.r; p.x = Math.random()*c.width; }
        ctx.globalAlpha = p.a; ctx.fillStyle = `hsl(${p.h},80%,60%)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      }
      raf.current = requestAnimationFrame(draw);
    };
    if (!paused) draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize); };
  }, [paused]);
  return (
    <canvas
      ref={ref}
      style={{position:'fixed', inset:0, zIndex:0, pointerEvents:'none', mixBlendMode:'screen', opacity:.28}}
      aria-hidden
    />
  );
}
