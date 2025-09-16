import React, { useEffect, useState } from 'react';
import { getMe } from '../utils/api';
import { clampProgress } from '../lib/format';
import { levelBadgeSrc } from '../config/progression';

export default function ProfileWidget() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await getMe();
      setMe(data);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener('profile-updated', onUpdate);
    return () => window.removeEventListener('profile-updated', onUpdate);
  }, []);

  if (loading) return <div style={{ height: 40 }} />;
  if (error) return <div>Error: {error}</div>;
  if (!me) return <div style={{ height: 40 }} />;

  const levelName = me.levelName || 'Shellborn';
  const badgeSrc = levelBadgeSrc(levelName);
  const xpValue = Number(me.xp ?? 0);
  const xpDisplay = Number.isFinite(xpValue) ? xpValue.toLocaleString() : '0';
  const rawNext = me.nextXP;
  const nextNumber = Number(rawNext);
  const nextXPDisplay =
    rawNext == null || rawNext === Infinity || !Number.isFinite(nextNumber)
      ? '∞'
      : nextNumber.toLocaleString();
  const progressPct = clampProgress((me.levelProgress || 0) * 100);
  const progressValue = Number.isFinite(progressPct)
    ? Number(progressPct.toFixed(1))
    : 0;
  const progressLabel = `${progressValue.toFixed(1)}% to next level`;

  return (
    <div className="profile-widget">
      <div className="pw-main">
        <img
          src={badgeSrc}
          alt={levelName}
          className="pw-badge"
          onError={(e) => {
            e.currentTarget.src = '/images/badges/unranked.png';
          }}
        />
        <div className="pw-copy">
          <span className="pw-label">Level</span>
          <strong className="pw-level">{levelName}</strong>
          <span className="pw-xp">XP {xpDisplay} / {nextXPDisplay}</span>
        </div>
      </div>
      <div
        className="pw-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressValue}
        aria-label={`Level progress ${progressLabel}`}
      >
        <div className="pw-bar">
          <div className="pw-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="pw-percent">{progressLabel}</span>
      </div>
    </div>
  );
}
