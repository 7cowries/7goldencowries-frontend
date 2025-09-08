// Tiny helper for feel-good effects; lazy-load to keep bundle small.
export async function boomConfetti() {
  try {
    if (typeof window === 'undefined' || /jsdom/i.test(navigator?.userAgent || '')) return;
    const confetti = (await import('canvas-confetti')).default;
    const end = Date.now() + 800;
    (function frame() {
      confetti({ particleCount: 30, startVelocity: 35, spread: 60, ticks: 60, origin: { y: 0.6 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  } catch {
    // no-op if lib missing
  }
}
