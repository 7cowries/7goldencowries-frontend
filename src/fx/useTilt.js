import { useEffect } from 'react';
export default function useTilt(ref, strength = 10) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transformStyle = 'preserve-3d';
    el.style.willChange = 'transform';
    const on = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px*strength}deg) rotateX(${-py*strength}deg) translateZ(0)`;
    };
    const off = () => { el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)'; };
    el.addEventListener('mousemove', on);
    el.addEventListener('mouseleave', off);
    return () => { el.removeEventListener('mousemove', on); el.removeEventListener('mouseleave', off); };
  }, [ref, strength]);
}
