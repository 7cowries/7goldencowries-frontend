export function initHeroVideo() {
  const v = document.getElementById('bg-video');
  if (!v) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.15 });
  io.observe(v);

  v.addEventListener('loadedmetadata', () => { v.muted = true; v.play().catch(() => {}); });

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if (isMobile) document.body.classList.add('video-mobile');
}
