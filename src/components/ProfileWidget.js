import React, { useEffect, useState } from 'react';
import { getMe, getProgression } from '../lib/api';

export default function ProfileWidget() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const wallet = localStorage.getItem('wallet') || '';
        let me = await getMe(wallet);
        let prog = me?.progress;
        if (!prog) {
          const p = await getProgression();
          prog = p;
        }
        setProgress({
          levelName: prog.levelName || prog.level || '',
          xp: prog.xp ?? prog.currentXP ?? me?.xp ?? 0,
          next: prog.next || prog.nextThreshold || prog.nextXP || 0,
        });
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!progress) return null;
  const pct = progress.next ? Math.min(100, (progress.xp / progress.next) * 100) : 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div>
        Level {progress.levelName} — {progress.xp} / {progress.next}
      </div>
      <div style={{ background: '#eee', height: 8, borderRadius: 4 }}>
        <div
          style={{
            width: `${pct}%`,
            background: '#4caf50',
            height: '100%',
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}
