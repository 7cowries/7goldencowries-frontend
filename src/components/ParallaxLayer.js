// src/components/ParallaxLayer.js
import React, { useEffect, useRef } from "react";

export default function ParallaxLayer({ strength = 10, children, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      const rx = (e.clientX / w - 0.5) * strength;
      const ry = (e.clientY / h - 0.5) * strength;
      el.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [strength]);
  return <div ref={ref} className={`parallax ${className}`}>{children}</div>;
}
