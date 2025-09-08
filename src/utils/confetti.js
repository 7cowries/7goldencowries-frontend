export function burstConfetti() {
  const el = document.createElement('div');
  el.style.position = 'fixed';
  el.style.inset = '0';
  el.style.pointerEvents = 'none';
  const cvs = document.createElement('canvas');
  el.appendChild(cvs);
  document.body.appendChild(el);
  const ctx = cvs.getContext('2d');
  if (!ctx) {
    el.remove();
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  function resize() {
    cvs.width = innerWidth * dpr;
    cvs.height = innerHeight * dpr;
  }
  resize();
  addEventListener('resize', resize);
  const N = 120;
  const parts = [...Array(N)].map(() => ({
    x: Math.random() * cvs.width,
    y: -20 * dpr,
    v: (2 + Math.random() * 5) * dpr,
    s: (2 + Math.random() * 4) * dpr,
    h: ~~(200 + Math.random() * 150),
    a: 1,
  }));
  let t = 0;
  let raf;
  (function step() {
    raf = requestAnimationFrame(step);
    t++;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    for (const p of parts) {
      p.y += p.v;
      p.a -= 0.006;
      ctx.globalAlpha = Math.max(0, p.a);
      ctx.fillStyle = `hsl(${p.h},90%,60%)`;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    if (t > 260) {
      cancelAnimationFrame(raf);
      el.remove();
      removeEventListener('resize', resize);
    }
  })();
}
