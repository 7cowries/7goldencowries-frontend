import React, { useEffect, useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import GlassCard from '../components/ui/GlassCard';
import CowryBadge from '../components/ui/CowryBadge';
import XPBarWave from '../components/ui/XPBarWave';
import { API_BASE } from '../config';

const ProfilePage = () => {
  const [me, setMe] = useState({ level: 1, xp: 0, history: [] });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/me`);
        if (res.ok) {
          const data = await res.json();
          setMe({
            level: data.level || 1,
            xp: data.xp || 0,
            history: data.history || [],
          });
          return;
        }
      } catch (err) {
        console.warn('profile fallback', err);
      }
      setMe({ level: 9, xp: 12800, history: ['Completed Orb Quest', 'Unlocked Coral Tier'] });
    }
    load();
  }, []);

  return (
    <PageContainer>
      <GlassCard title="Profile" subtitle="Glass header with neon edges">
        <div className="flex-between" style={{ alignItems: 'flex-start', gap: 16 }}>
          <CowryBadge level={me.level} label="Ascension" />
          <div style={{ flex: 1 }}>
            <h3>Explorer</h3>
            <p className="small-label">XP Progress</p>
            <XPBarWave progress={Math.min((me.xp % 10000) / 100, 100)} />
            <div className="pill" style={{ marginTop: 10 }}>Total XP: {me.xp}</div>
          </div>
        </div>
        <GlassCard title="Quest History">
          <ul style={{ margin: 0, paddingLeft: 18, color: '#cfe6ff' }}>
            {me.history.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </GlassCard>
      </GlassCard>
    </PageContainer>
  );
};

export default ProfilePage;
