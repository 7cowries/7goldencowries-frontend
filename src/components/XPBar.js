import React, { useEffect, useState } from 'react';
import './XPBar.css';

const XPBar = ({ xp, nextXP }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const percent = Math.min((xp / nextXP) * 100, 100);
    const animate = setTimeout(() => setProgress(percent), 50);
    return () => clearTimeout(animate);
  }, [xp, nextXP]);

  return (
    <div className="xpbar-wrapper">
      <div className="xpbar-track">
        <div className="xpbar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="xpbar-label">{xp} / {nextXP} XP to next virtue</div>
    </div>
  );
};

export default XPBar;
