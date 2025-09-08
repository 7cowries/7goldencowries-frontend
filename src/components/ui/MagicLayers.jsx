import { useEffect, useState } from 'react';

export default function MagicLayers() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  if (reduce) return null;
  return (
    <>
      <div className="veil" />
      <div id="magic-orbs">
        <span className="orb" />
        <span className="orb" />
        <span className="orb" />
        <span className="orb" />
      </div>
    </>
  );
}
