export function burstConfetti({count=150,duration=2800}={}) {
  const el = document.createElement('div'); el.style.position='fixed'; el.style.inset=0; el.style.pointerEvents='none';
  const cvs = document.createElement('canvas'); el.appendChild(cvs); document.body.appendChild(el);
  const ctx = cvs.getContext('2d'), dpr = window.devicePixelRatio||1;
  const resize = () => { cvs.width = innerWidth*dpr; cvs.height = innerHeight*dpr; };
  resize(); addEventListener('resize', resize);
  const ps = Array.from({length:count}, (_,i)=>({
    x: Math.random()*cvs.width, y: -10*dpr, vx: (Math.random()-.5)*3*dpr, vy: (2+Math.random()*6)*dpr,
    s: (2+Math.random()*4)*dpr, h: ~~(200+Math.random()*150), a: 1, r: Math.random()*Math.PI
  }));
  let t = 0, raf;
  (function loop(){
    raf = requestAnimationFrame(loop); t += 16;
    ctx.clearRect(0,0,cvs.width,cvs.height);
    for (const p of ps) {
      p.x+=p.vx; p.y+=p.vy; p.vy*=0.995; p.a-=0.006;
      ctx.save(); ctx.globalAlpha=Math.max(0,p.a); ctx.translate(p.x,p.y); ctx.rotate(p.r+=0.05);
      ctx.fillStyle=`hsl(${p.h},90%,60%)`; ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s); ctx.restore();
    }
    if (t>duration) { cancelAnimationFrame(raf); removeEventListener('resize', resize); el.remove(); }
  })();
}
