export function burstConfetti({ count = 120, duration = 1600 } = {}) {
  const end = Date.now() + duration;
  const tick = () => {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    const size = 6 + Math.random() * 8;
    p.style.cssText = `
      position:fixed; left:${Math.random() * 100}vw; top:-10px; width:${size}px; height:${size}px;
      background:hsl(${Math.random() * 360},100%,60%); border-radius:50%; pointer-events:none; z-index:9999;
      transform:translate3d(0,0,0); transition:transform ${duration}ms linear, opacity ${duration}ms linear;
      opacity:1;
    `;
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate3d(${(Math.random() * 2 - 1) * 200}px, 110vh, 0) rotate(${Math.random() * 720}deg)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), duration + 200);
    if (Date.now() < end) requestAnimationFrame(tick);
  };
  for (let i = 0; i < Math.min(count, 200); i++) tick();
}

