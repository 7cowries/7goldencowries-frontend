// Lightweight confetti loader that works without bundler changes
let confettiFn = null;

export async function confettiBurst(opts = {}) {
  if (!confettiFn) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
      s.async = true;
      s.onload = () => {
        // global confetti is exposed by the script
        confettiFn = window.confetti || null;
        resolve();
      };
      s.onerror = reject;
      document.head.appendChild(s);
    }).catch(() => {});
  }
  if (!confettiFn) return;

  const { particleCount = 120, spread = 75, angle = 60, origin = { y: 0.7 } } = opts;
  confettiFn({ particleCount, spread, angle, origin });
  confettiFn({ particleCount, spread, angle: 120, origin });
}

