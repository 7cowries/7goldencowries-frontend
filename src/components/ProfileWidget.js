import React, { useEffect, useState } from 'react';
import { getMe } from '../lib/api';

export default function ProfileWidget() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const wallet = localStorage.getItem('wallet') || '';
        const data = await getMe(wallet);
        setMe(data);
      } catch (e) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!me) return null;

  const pct = Math.min(100, Math.round((me.levelProgress || 0) * 100));

  return (
    <div style={{ marginBottom: 16 }}>
      <div>Level {me.levelName}</div>
      <div>{me.xp} XP</div>
      <div>Next: {me.nextXP}</div>
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
