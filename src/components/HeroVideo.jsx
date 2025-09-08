import { useEffect, useRef } from 'react';

export default function HeroVideo({ srcWebm, srcMp4, poster }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (!v) return;
      if (e.isIntersecting) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video ref={ref} playsInline muted loop preload="metadata" poster={poster} style={{width:'100%',borderRadius:'18px',objectFit:'cover'}}>
      <source src={srcWebm} type="video/webm" />
      <source src={srcMp4} type="video/mp4" />
    </video>
  );
}
