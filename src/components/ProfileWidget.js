import React, { useEffect, useState } from 'react';
import { getMe } from '../lib/api';

export default function ProfileWidget() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const wallet = localStorage.getItem('wallet') || '';
    getMe(wallet)
      .then(setMe)
      .catch((e) => setError(e.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!me) return null;

  const progress = Math.round((me.levelProgress || 0) * 100);

  return (
    <div style={{ marginBottom: 16 }}>
      <div>
        Level {me.levelName}, {me.xp} XP, Next: {me.nextXP}
      </div>
      <div style={{ background: '#eee', height: 8, borderRadius: 4 }}>
        <div
          style={{
            width: `${progress}%`,
            background: '#4caf50',
            height: '100%',
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}
