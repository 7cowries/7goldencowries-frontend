let scriptLoaded = false;
export async function confettiBurst() {
  if (!scriptLoaded) {
    await new Promise(r => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
      s.onload = () => r(scriptLoaded = true);
      document.head.appendChild(s);
    });
  }
  const fire = (o) => window.confetti({ ...{ particleCount: 90, spread: 70, origin: { y: .7 } }, ...o });
  fire({ angle: 60 });
  fire({ angle: 120 });
  fire({ startVelocity: 50 });
}
