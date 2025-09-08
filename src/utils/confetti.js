export function confettiBurst(opts = {}) {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV === 'test') return;
  try {
    if (localStorage.getItem('effects:confetti') === 'off') return;
  } catch (e) {
    return; // quietly ignore
  }
  import('canvas-confetti').then((mod) => {
    const c = mod.default || mod;
    c({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      ...opts,
    });
  }).catch(() => {});
}
