import React, { useEffect, useState } from 'react';
import { getMe } from '../utils/api';

export default function ProfileWidget() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getMe();
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

  const progressPct = Math.min(100, Math.round((me.levelProgress || 0) * 100));

  return (
    <div style={{ marginBottom: 16 }}>
      <div>Level {me.levelName}, {me.xp} XP, Next: {me.nextXP}</div>
      <div style={{ background: '#eee', height: 8, borderRadius: 4 }}>
        <div
          style={{ width: `${progressPct}%`, background: '#4caf50', height: '100%', borderRadius: 4 }}
        />
      </div>
    </div>
  );
}
