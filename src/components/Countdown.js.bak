// src/components/Countdown.js
import React, { useEffect, useMemo, useState } from "react";

export default function Countdown({
  // ISO date, local time assumed by browser
  target = "2025-10-04T00:00:00",
  label = "Token Sale starts in",
}) {
  const [now, setNow] = useState(() => Date.now());
  // tick once per second
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = useMemo(() => {
    const t = new Date(target).getTime() - now;
    const clamped = Math.max(0, t);
    const s = Math.floor(clamped / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return { t: clamped, days, hours, minutes, seconds };
  }, [now, target]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="countdown">
      <div className="countdown-label">{label}</div>
      <div className="countdown-digits" aria-live="polite">
        <span>{diff.days}</span><small>d</small>
        <span>{pad(diff.hours)}</span><small>h</small>
        <span>{pad(diff.minutes)}</span><small>m</small>
        <span>{pad(diff.seconds)}</span><small>s</small>
      </div>
    </div>
  );
}
