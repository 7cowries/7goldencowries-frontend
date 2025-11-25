import React, { useEffect, useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import GlassCard from '../components/ui/GlassCard';
import CowryBadge from '../components/ui/CowryBadge';
import XPBarWave from '../components/ui/XPBarWave';
import { API_BASE } from '../config';

const Home = () => {
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState({ quests: 0, xp: 0, streak: 0 });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/me`);
        if (res.ok) {
          const data = await res.json();
          setMe(data);
          setStats({ quests: data.questsCompleted || 0, xp: data.xp || 0, streak: data.streak || 0 });
        }
      } catch (err) {
        console.warn('fallback profile', err);
        setMe({ name: 'Explorer', level: 7 });
        setStats({ quests: 42, xp: 12800, streak: 6 });
      }
    }
    load();
  }, []);

  return (
    <PageContainer>
      <GlassCard
        title="Hybrid Ocean Realm"
        subtitle="Cinematic Web3 Isles experience"
        actions={[
          <button key="cta1" className="btn-primary">Start Questing</button>,
          <button key="cta2" className="btn-ghost">View Isles</button>,
        ]}
      >
        <div className="hero-banner">
          <div>
            <h1>Ascend the Cowry Seas</h1>
            <p style={{ color: '#cfe6ff', lineHeight: 1.6 }}>
              Sail across floating orb-islands, claim neon gold rewards, and unlock staking multipliers.
              Every click shimmers with glassmorphic light and animated XP waves.
            </p>
            <div className="flex-wrap">
              <div className="pill">Deep ocean gradients</div>
              <div className="pill">Neon gold actions</div>
              <div className="pill">Particle depth layers</div>
            </div>
          </div>
          <div style={{ display: 'grid', placeItems: 'center', gap: 12 }}>
            <CowryBadge level={me?.level || 1} label="Golden Cowry" />
            <XPBarWave progress={65} />
          </div>
        </div>
      </GlassCard>

      <div className="card-grid">
        <GlassCard title="Quests" subtitle="Daily + Partner">
          <div className="flex-between">
            <div>
              <h2>{stats.quests}</h2>
              <p className="small-label">Completed</p>
            </div>
            <button className="btn-primary">Open Quests</button>
          </div>
        </GlassCard>
        <GlassCard title="XP" subtitle="Ocean wave bar">
          <h2>{stats.xp} XP</h2>
          <XPBarWave progress={Math.min((stats.xp % 10000) / 100, 100)} />
        </GlassCard>
        <GlassCard title="Streak" subtitle="Golden focus">
          <div className="flex-between">
            <h2>{stats.streak} days</h2>
            <span className="badge-gold">+{stats.streak * 50} XP</span>
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
};

export default Home;
